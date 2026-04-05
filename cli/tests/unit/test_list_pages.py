"""TDD: ListPages use case tests — written BEFORE implementation."""

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from llm_wiki.domain.models import WikiProject, WikiPage, PageType


def _make_project() -> WikiProject:
    return WikiProject(root=Path("/tmp/wiki"), name="test")


def _make_page(
    title: str,
    page_type: PageType | None = None,
    path: str = "wiki/entities/test.md",
    word_count: int = 100,
    updated: str | None = "2026-01-01",
) -> WikiPage:
    return WikiPage(
        path=Path(path),
        title=title,
        page_type=page_type,
        created="2026-01-01",
        updated=updated,
        sources=(),
        tags=(),
        word_count=word_count,
    )


def _make_repo(pages: list[WikiPage] | None = None) -> MagicMock:
    repo = MagicMock()
    repo.list_pages.return_value = pages or []
    return repo


class TestListPagesDefault:
    def test_lists_wiki_pages(self):
        from llm_wiki.application.list_pages import ListPages

        pages = [
            _make_page("Alpha", PageType.ENTITY),
            _make_page("Beta", PageType.CONCEPT),
        ]
        repo = _make_repo(pages)
        project = _make_project()

        uc = ListPages(project, repo)
        got = uc.execute()

        repo.list_pages.assert_called_once_with(project.wiki_dir)
        assert len(got) == 2

    def test_empty_wiki_returns_empty(self):
        from llm_wiki.application.list_pages import ListPages

        repo = _make_repo([])
        uc = ListPages(_make_project(), repo)
        got = uc.execute()

        assert got == []


class TestListPagesRaw:
    def test_lists_raw_pages(self):
        from llm_wiki.application.list_pages import ListPages

        pages = [_make_page("Raw Doc", path="raw/doc.md")]
        repo = _make_repo(pages)
        project = _make_project()

        uc = ListPages(project, repo)
        got = uc.execute(raw=True)

        repo.list_pages.assert_called_once_with(project.raw_dir)
        assert len(got) == 1
        assert got[0].title == "Raw Doc"


class TestListPagesFilterByType:
    def test_filter_entities(self):
        from llm_wiki.application.list_pages import ListPages

        pages = [
            _make_page("Python", PageType.ENTITY),
            _make_page("OOP", PageType.CONCEPT),
            _make_page("Java", PageType.ENTITY),
        ]
        repo = _make_repo(pages)

        uc = ListPages(_make_project(), repo)
        got = uc.execute(page_type="entity")

        assert len(got) == 2
        assert all(p.page_type == PageType.ENTITY for p in got)

    def test_filter_concepts(self):
        from llm_wiki.application.list_pages import ListPages

        pages = [
            _make_page("Python", PageType.ENTITY),
            _make_page("OOP", PageType.CONCEPT),
        ]
        repo = _make_repo(pages)

        uc = ListPages(_make_project(), repo)
        got = uc.execute(page_type="concept")

        assert len(got) == 1
        assert got[0].title == "OOP"

    def test_filter_skips_none_type(self):
        from llm_wiki.application.list_pages import ListPages

        pages = [
            _make_page("Python", PageType.ENTITY),
            _make_page("Unknown", None),
        ]
        repo = _make_repo(pages)

        uc = ListPages(_make_project(), repo)
        got = uc.execute(page_type="entity")

        assert len(got) == 1
        assert got[0].title == "Python"

    def test_no_filter_returns_all(self):
        from llm_wiki.application.list_pages import ListPages

        pages = [
            _make_page("Python", PageType.ENTITY),
            _make_page("OOP", PageType.CONCEPT),
            _make_page("Unknown", None),
        ]
        repo = _make_repo(pages)

        uc = ListPages(_make_project(), repo)
        got = uc.execute()

        assert len(got) == 3


class TestListPagesSort:
    def test_sort_by_title_default(self):
        from llm_wiki.application.list_pages import ListPages

        pages = [
            _make_page("Zebra", PageType.ENTITY),
            _make_page("Alpha", PageType.ENTITY),
            _make_page("Middle", PageType.ENTITY),
        ]
        repo = _make_repo(pages)

        uc = ListPages(_make_project(), repo)
        got = uc.execute()

        titles = [p.title for p in got]
        assert titles == ["Alpha", "Middle", "Zebra"]

    def test_sort_by_word_count(self):
        from llm_wiki.application.list_pages import ListPages

        pages = [
            _make_page("Short", PageType.ENTITY, word_count=50),
            _make_page("Long", PageType.ENTITY, word_count=500),
            _make_page("Medium", PageType.ENTITY, word_count=200),
        ]
        repo = _make_repo(pages)

        uc = ListPages(_make_project(), repo)
        got = uc.execute(sort_by="word_count")

        counts = [p.word_count for p in got]
        assert counts == [50, 200, 500]

    def test_sort_by_updated(self):
        from llm_wiki.application.list_pages import ListPages

        pages = [
            _make_page("C", PageType.ENTITY, updated="2026-03-01"),
            _make_page("A", PageType.ENTITY, updated="2026-01-01"),
            _make_page("B", PageType.ENTITY, updated="2026-02-01"),
        ]
        repo = _make_repo(pages)

        uc = ListPages(_make_project(), repo)
        got = uc.execute(sort_by="updated")

        dates = [p.updated for p in got]
        assert dates == ["2026-01-01", "2026-02-01", "2026-03-01"]

    def test_sort_with_filter(self):
        from llm_wiki.application.list_pages import ListPages

        pages = [
            _make_page("Zebra", PageType.ENTITY),
            _make_page("OOP", PageType.CONCEPT),
            _make_page("Alpha", PageType.ENTITY),
        ]
        repo = _make_repo(pages)

        uc = ListPages(_make_project(), repo)
        got = uc.execute(page_type="entity", sort_by="title")

        titles = [p.title for p in got]
        assert titles == ["Alpha", "Zebra"]
