"""TDD: GetStatus use case tests — written BEFORE implementation."""

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from llm_wiki.domain.models import WikiProject, WikiPage, WikiStatus, PageType


def _make_project() -> WikiProject:
    return WikiProject(root=Path("/tmp/wiki"), name="test")


def _make_page(
    title: str,
    page_type: PageType | None = None,
    word_count: int = 100,
    updated: str | None = "2026-01-01",
) -> WikiPage:
    return WikiPage(
        path=Path(f"wiki/entities/{title.lower()}.md"),
        title=title,
        page_type=page_type,
        created="2026-01-01",
        updated=updated,
        sources=(),
        tags=(),
        word_count=word_count,
    )


class TestGetStatusEmptyWiki:
    def test_empty_wiki(self):
        from llm_wiki.application.get_status import GetStatus

        repo = MagicMock()
        repo.list_files.return_value = []
        repo.list_pages.return_value = []
        repo.exists.return_value = False
        project = _make_project()

        uc = GetStatus(project, repo)
        status = uc.execute()

        assert isinstance(status, WikiStatus)
        assert status.wiki_root == str(project.root)
        assert status.raw_documents == 0
        assert status.wiki_pages == 0
        assert status.by_type == {}
        assert status.total_word_count == 0
        assert status.last_modified is None
        assert status.search_index_exists is False
        assert status.index_stale is True

    def test_calls_correct_paths(self):
        from llm_wiki.application.get_status import GetStatus

        repo = MagicMock()
        repo.list_files.return_value = []
        repo.list_pages.return_value = []
        repo.exists.return_value = False
        project = _make_project()

        uc = GetStatus(project, repo)
        uc.execute()

        repo.list_files.assert_called_once_with(project.raw_dir, "*.md")
        repo.list_pages.assert_called_once_with(project.wiki_dir)
        repo.exists.assert_called_once_with(project.search_index_path)


class TestGetStatusWithPages:
    def test_counts_by_type(self):
        from llm_wiki.application.get_status import GetStatus

        pages = [
            _make_page("Python", PageType.ENTITY),
            _make_page("Java", PageType.ENTITY),
            _make_page("OOP", PageType.CONCEPT),
            _make_page("Paper1", PageType.SOURCE),
        ]
        repo = MagicMock()
        repo.list_files.return_value = [Path("raw/a.md"), Path("raw/b.md")]
        repo.list_pages.return_value = pages
        repo.exists.return_value = True

        uc = GetStatus(_make_project(), repo)
        status = uc.execute()

        assert status.raw_documents == 2
        assert status.wiki_pages == 4
        assert status.by_type == {"entity": 2, "concept": 1, "source": 1}

    def test_total_word_count(self):
        from llm_wiki.application.get_status import GetStatus

        pages = [
            _make_page("A", PageType.ENTITY, word_count=100),
            _make_page("B", PageType.CONCEPT, word_count=250),
            _make_page("C", PageType.SOURCE, word_count=50),
        ]
        repo = MagicMock()
        repo.list_files.return_value = []
        repo.list_pages.return_value = pages
        repo.exists.return_value = True

        uc = GetStatus(_make_project(), repo)
        status = uc.execute()

        assert status.total_word_count == 400

    def test_last_modified_picks_latest(self):
        from llm_wiki.application.get_status import GetStatus

        pages = [
            _make_page("A", PageType.ENTITY, updated="2026-01-01"),
            _make_page("B", PageType.CONCEPT, updated="2026-04-05"),
            _make_page("C", PageType.SOURCE, updated="2026-02-15"),
        ]
        repo = MagicMock()
        repo.list_files.return_value = []
        repo.list_pages.return_value = pages
        repo.exists.return_value = True

        uc = GetStatus(_make_project(), repo)
        status = uc.execute()

        assert status.last_modified == "2026-04-05"

    def test_last_modified_skips_none(self):
        from llm_wiki.application.get_status import GetStatus

        pages = [
            _make_page("A", PageType.ENTITY, updated=None),
            _make_page("B", PageType.CONCEPT, updated="2026-03-01"),
        ]
        repo = MagicMock()
        repo.list_files.return_value = []
        repo.list_pages.return_value = pages
        repo.exists.return_value = True

        uc = GetStatus(_make_project(), repo)
        status = uc.execute()

        assert status.last_modified == "2026-03-01"

    def test_pages_with_none_type_excluded_from_by_type(self):
        from llm_wiki.application.get_status import GetStatus

        pages = [
            _make_page("Python", PageType.ENTITY),
            _make_page("Unknown", None),
        ]
        repo = MagicMock()
        repo.list_files.return_value = []
        repo.list_pages.return_value = pages
        repo.exists.return_value = True

        uc = GetStatus(_make_project(), repo)
        status = uc.execute()

        assert status.wiki_pages == 2
        assert status.by_type == {"entity": 1}


class TestGetStatusStaleness:
    def test_index_missing_means_stale(self):
        from llm_wiki.application.get_status import GetStatus

        repo = MagicMock()
        repo.list_files.return_value = []
        repo.list_pages.return_value = [_make_page("A", PageType.ENTITY)]
        repo.exists.return_value = False

        uc = GetStatus(_make_project(), repo)
        status = uc.execute()

        assert status.search_index_exists is False
        assert status.index_stale is True

    def test_index_exists_not_stale(self):
        from llm_wiki.application.get_status import GetStatus

        repo = MagicMock()
        repo.list_files.return_value = []
        repo.list_pages.return_value = [_make_page("A", PageType.ENTITY)]
        repo.exists.return_value = True

        uc = GetStatus(_make_project(), repo)
        status = uc.execute()

        assert status.search_index_exists is True
        assert status.index_stale is False

    def test_index_exists_empty_wiki_not_stale(self):
        from llm_wiki.application.get_status import GetStatus

        repo = MagicMock()
        repo.list_files.return_value = []
        repo.list_pages.return_value = []
        repo.exists.return_value = True

        uc = GetStatus(_make_project(), repo)
        status = uc.execute()

        assert status.search_index_exists is True
        assert status.index_stale is False
