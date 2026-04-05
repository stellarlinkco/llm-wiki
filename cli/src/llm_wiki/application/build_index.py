"""BuildIndex use case — generates index.md catalog and search index."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import re

from llm_wiki.domain.models import WikiPage, WikiProject
from llm_wiki.domain.ports import PageRepository, SearchEngine

# System files at wiki root — excluded from catalog listing
_SYSTEM_FILES = {"index.md", "log.md", "overview.md"}


@dataclass(frozen=True)
class IndexResult:
    catalog_entries: int
    indexed_documents: int
    index_path: str


class BuildIndex:
    """Build the wiki catalog (index.md) and full-text search index."""

    def __init__(
        self,
        project: WikiProject,
        repo: PageRepository,
        search_engine: SearchEngine,
    ) -> None:
        self._project = project
        self._repo = repo
        self._search = search_engine

    def execute(self) -> IndexResult:
        wiki_pages = self._repo.list_pages(self._project.wiki_dir)
        raw_pages = self._repo.list_pages(self._project.raw_dir)

        # 1. Generate index.md content
        index_content = self._build_catalog(wiki_pages)
        self._repo.write_content(self._project.index_path, index_content)

        # 2. Build search index — exclude system files
        searchable_wiki = [p for p in wiki_pages if p.path.name not in _SYSTEM_FILES]
        all_pages = searchable_wiki + raw_pages
        docs = self._collect_docs(all_pages)
        self._search.build_index(docs)
        self._search.save_index(self._project.search_index_path)

        content_pages = [p for p in wiki_pages if p.path.name not in _SYSTEM_FILES]
        return IndexResult(
            catalog_entries=len(content_pages),
            indexed_documents=len(all_pages),
            index_path=str(self._project.index_path),
        )

    # -- private helpers --------------------------------------------------

    _INDEX_FRONTMATTER = "---\ntitle: Wiki Catalog\ntype: overview\n---\n\n"

    def _build_catalog(self, wiki_pages: list[WikiPage]) -> str:
        # Exclude system files (index.md, log.md, overview.md) from catalog
        content_pages = [
            p for p in wiki_pages
            if p.path.name not in _SYSTEM_FILES
        ]

        if not content_pages:
            return self._INDEX_FRONTMATTER + "# Index\n\n_No pages yet._\n"

        # Group by page_type
        groups: dict[str, list[WikiPage]] = {}
        for page in content_pages:
            key = page.page_type.value if page.page_type else "other"
            groups.setdefault(key, []).append(page)

        lines = [self._INDEX_FRONTMATTER + "# Index\n"]
        for type_name in sorted(groups):
            lines.append(f"\n## {type_name.capitalize()}\n")
            for page in sorted(groups[type_name], key=lambda p: p.title.lower()):
                summary = self._get_summary(page.path)
                rel_path = self._relative_path(page.path)
                lines.append(f"- [{page.title}]({rel_path}) — {summary}")

        lines.append("")
        return "\n".join(lines)

    def _get_summary(self, path: Path) -> str:
        content = self._repo.read_content(path)
        body = _strip_frontmatter(content)
        summary = _extract_plain_summary(body)
        return summary[:120] + "..." if len(summary) > 120 else summary

    def _relative_path(self, page_path: Path) -> str:
        """Compute path relative to the wiki_dir (where index.md lives)."""
        try:
            return str(page_path.relative_to(self._project.wiki_dir))
        except ValueError:
            return str(page_path)

    def _collect_docs(
        self, pages: list[WikiPage]
    ) -> list[tuple[str, str, str]]:
        docs: list[tuple[str, str, str]] = []
        for page in pages:
            content = self._repo.read_content(page.path)
            body = _strip_frontmatter(content)
            docs.append((str(page.path), page.title, body))
        return docs


def _strip_frontmatter(content: str) -> str:
    """Remove YAML frontmatter block from content. Handles CRLF."""
    content = content.replace("\r\n", "\n").replace("\r", "\n")
    if not content.startswith("---\n"):
        return content
    second = content.find("---\n", 4)
    if second == -1:
        return content
    return content[second + 4:]


def _extract_plain_summary(body: str) -> str:
    """Extract first meaningful line from markdown, stripping all syntax."""
    for line in body.split("\n"):
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("|") or line.startswith("---") or line.startswith("<!--"):
            continue
        # Strip markdown syntax
        line = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", line)  # links → text
        line = re.sub(r"\*\*(.+?)\*\*", r"\1", line)  # bold
        line = re.sub(r"\*(.+?)\*", r"\1", line)  # italic
        line = re.sub(r"`(.+?)`", r"\1", line)  # inline code
        line = line.strip("- ").strip()
        if line:
            return line
    return "(empty)"
