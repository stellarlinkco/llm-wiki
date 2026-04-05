"""Use case: get status overview of a wiki project."""

from __future__ import annotations

from llm_wiki.domain.models import WikiProject, WikiStatus
from llm_wiki.domain.ports import PageRepository


class GetStatus:
    """Compute status summary for the wiki project."""

    def __init__(self, project: WikiProject, repo: PageRepository) -> None:
        self._project = project
        self._repo = repo

    def execute(self) -> WikiStatus:
        raw_files = self._repo.list_files(self._project.raw_dir, "*.md")
        wiki_pages = self._repo.list_pages(self._project.wiki_dir)

        # Count by page type, skipping pages with no type.
        by_type: dict[str, int] = {}
        for page in wiki_pages:
            if page.page_type is not None:
                key = page.page_type.value
                by_type[key] = by_type.get(key, 0) + 1

        total_word_count = sum(p.word_count for p in wiki_pages)

        # Last modified: max of updated dates, skipping None.
        dates = [p.updated for p in wiki_pages if p.updated is not None]
        last_modified = max(dates) if dates else None

        search_index_exists = self._repo.exists(self._project.search_index_path)
        index_stale = not search_index_exists

        return WikiStatus(
            wiki_root=str(self._project.root),
            raw_documents=len(raw_files),
            wiki_pages=len(wiki_pages),
            by_type=by_type,
            total_word_count=total_word_count,
            last_modified=last_modified,
            index_stale=index_stale,
            search_index_exists=search_index_exists,
        )
