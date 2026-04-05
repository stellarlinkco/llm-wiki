"""Use case: list wiki pages with optional filtering and sorting."""

from __future__ import annotations

from llm_wiki.domain.models import PageType, WikiPage, WikiProject
from llm_wiki.domain.ports import PageRepository


class ListPages:
    """List pages from the wiki or raw directory."""

    def __init__(self, project: WikiProject, repo: PageRepository) -> None:
        self._project = project
        self._repo = repo

    def execute(
        self,
        page_type: str | None = None,
        sort_by: str = "title",
        raw: bool = False,
    ) -> list[WikiPage]:
        directory = self._project.raw_dir if raw else self._project.wiki_dir
        pages = self._repo.list_pages(directory)

        if page_type is not None:
            try:
                target_type = PageType(page_type)
            except ValueError:
                return []  # invalid page_type yields empty list
            pages = [p for p in pages if p.page_type == target_type]

        _VALID_SORT_FIELDS = {"title", "path", "page_type", "created", "updated", "word_count"}
        if sort_by not in _VALID_SORT_FIELDS:
            sort_by = "title"
        pages = sorted(pages, key=lambda p: getattr(p, sort_by, "") or "")

        return pages
