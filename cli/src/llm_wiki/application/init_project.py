"""InitProject use case — bootstrap a new wiki project."""

from __future__ import annotations

from pathlib import Path

from llm_wiki.domain.errors import ProjectAlreadyExistsError
from llm_wiki.domain.models import WikiProject
from llm_wiki.domain.ports import PageRepository


class InitProject:
    """Create the directory scaffold and seed files for a new wiki."""

    def __init__(
        self, root: Path, name: str, description: str, repo: PageRepository
    ) -> None:
        self._root = root
        self._name = name
        self._description = description
        self._repo = repo

    def execute(self) -> WikiProject:
        project = WikiProject(root=self._root, name=self._name)

        if self._repo.exists(project.marker_dir):
            raise ProjectAlreadyExistsError(
                f"Wiki project already exists at {self._root}"
            )

        for d in project.required_dirs:
            self._repo.ensure_dir(d)

        self._repo.write_content(project.schema_path, self._claude_md())
        self._repo.write_content(project.index_path, self._index_md())
        self._repo.write_content(project.log_path, self._log_md())
        self._repo.write_content(
            project.wiki_dir / "overview.md", self._overview_md()
        )

        return project

    def _claude_md(self) -> str:
        return (
            f"# {self._name}\n\n"
            f"{self._description}\n\n"
            "## Wiki Schema\n\n"
            "This project is an LLM-wiki knowledge base.\n\n"
            "### Directory Layout\n\n"
            "- `raw/` — ingested source documents (markdown with frontmatter)\n"
            "- `wiki/` — curated wiki pages\n"
            "  - `entities/` — named things (people, orgs, tools)\n"
            "  - `concepts/` — abstract ideas and theories\n"
            "  - `sources/` — summaries of original sources\n"
            "  - `comparisons/` — side-by-side analyses\n"
            "  - `queries/` — research questions and answers\n"
            "  - `index.md` — master catalog of all pages\n"
            "  - `log.md` — changelog of wiki operations\n"
            "  - `overview.md` — high-level project overview\n"
            "- `.llm-wiki/` — internal metadata and search index\n\n"
            "### Page Frontmatter\n\n"
            "Every wiki page must have YAML frontmatter with:\n"
            "- `title`: page title\n"
            "- `type`: one of entity, concept, source, comparison, query, overview\n"
            "- `created`: ISO-8601 date\n"
            "- `updated`: ISO-8601 date\n"
            "- `sources`: list of source file paths\n"
            "- `tags`: list of tags\n"
        )

    def _index_md(self) -> str:
        return (
            "---\n"
            "title: Wiki Catalog\n"
            "type: overview\n"
            "---\n\n"
            "# Wiki Catalog\n\n"
            "## Entities\n\n"
            "## Concepts\n\n"
            "## Sources\n\n"
            "## Comparisons\n\n"
            "## Queries\n"
        )

    def _log_md(self) -> str:
        return (
            "---\n"
            "title: Wiki Log\n"
            "type: overview\n"
            "---\n\n"
            "# Wiki Log\n\n"
            "<!-- Append entries below as wiki operations are performed. -->\n"
        )

    @staticmethod
    def _yaml_quote(value: str) -> str:
        """Quote a YAML value if it contains special characters."""
        if any(c in value for c in (':', '{', '}', '[', ']', '"', "'", '\n', '#')):
            return f'"{value.replace(chr(92), chr(92)*2).replace(chr(34), chr(92)+chr(34))}"'
        return value

    def _overview_md(self) -> str:
        title = f"{self._name} — Overview"
        return (
            "---\n"
            f"title: {self._yaml_quote(title)}\n"
            "type: overview\n"
            "---\n\n"
            f"# {title}\n\n"
            f"{self._description}\n\n"
            "<!-- Expand this page as the wiki grows. -->\n"
        )
