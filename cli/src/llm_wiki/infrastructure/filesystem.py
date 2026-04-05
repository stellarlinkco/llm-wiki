"""LocalFileSystem adapter — implements PageRepository port.

Reads/writes files on the local filesystem.
Parses YAML frontmatter from .md files using python-frontmatter.
"""

from __future__ import annotations

from pathlib import Path

import frontmatter

from llm_wiki.domain.models import PageType, WikiPage
from llm_wiki.domain.ports import PageRepository


class LocalFileSystem(PageRepository):
    """Concrete PageRepository backed by the local filesystem."""

    def list_pages(self, directory: Path) -> list[WikiPage]:
        """List all .md files in directory recursively with parsed metadata."""
        pages: list[WikiPage] = []
        for md_path in sorted(directory.rglob("*.md")):
            if not md_path.is_file():
                continue
            pages.append(self._parse_wiki_page(md_path))
        return pages

    def read_content(self, path: Path) -> str:
        """Read the raw content of a file."""
        try:
            return path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            return path.read_text(encoding="utf-8", errors="replace")

    def write_content(self, path: Path, content: str) -> None:
        """Write content to a file, creating parent dirs if needed."""
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")

    def exists(self, path: Path) -> bool:
        """Check if a file or directory exists."""
        return path.exists()

    def ensure_dir(self, path: Path) -> None:
        """Create directory (and parents) if it doesn't exist."""
        path.mkdir(parents=True, exist_ok=True)

    def list_files(self, directory: Path, pattern: str = "*.md") -> list[Path]:
        """List files matching a glob pattern in a directory (recursive)."""
        return sorted(p for p in directory.rglob(pattern) if p.is_file())

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_wiki_page(path: Path) -> WikiPage:
        """Parse a single .md file into a WikiPage, handling errors gracefully."""
        try:
            raw = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            raw = path.read_text(encoding="utf-8", errors="replace")

        try:
            post = frontmatter.loads(raw)
            metadata: dict = post.metadata
            content: str = post.content
        except Exception:
            metadata = {}
            content = raw

        title = metadata.get("title") or path.stem

        # Resolve page type
        raw_type = metadata.get("type")
        page_type: PageType | None = None
        if raw_type is not None:
            try:
                page_type = PageType(raw_type)
            except ValueError:
                page_type = None

        word_count = len(content.split()) if content.strip() else 0

        return WikiPage(
            path=path,
            title=str(title),
            page_type=page_type,
            created=metadata.get("created"),
            updated=metadata.get("updated"),
            sources=tuple(metadata.get("sources") or []),
            tags=tuple(metadata.get("tags") or []),
            word_count=word_count,
        )
