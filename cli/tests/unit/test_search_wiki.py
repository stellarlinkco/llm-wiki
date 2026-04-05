"""TDD: SearchWiki use case tests — written BEFORE implementation."""

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from llm_wiki.domain.models import WikiProject, SearchResult
from llm_wiki.domain.errors import SearchIndexNotFoundError


def _make_project() -> WikiProject:
    return WikiProject(root=Path("/tmp/wiki"), name="test")


def _make_engine(results: list[SearchResult] | None = None) -> MagicMock:
    engine = MagicMock()
    engine.load_index.return_value = None
    engine.search.return_value = results or []
    return engine


class TestSearchWikiHappyPath:
    def test_returns_results(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path="wiki/entities/python.md", score=5.0, title="Python", snippet="A language..."),
            SearchResult(path="wiki/concepts/oop.md", score=3.2, title="OOP", snippet="Object oriented..."),
        ]
        engine = _make_engine(results)
        project = _make_project()

        uc = SearchWiki(project, engine)
        got = uc.execute("python")

        engine.load_index.assert_called_once_with(project.search_index_path)
        assert len(got) == 2
        assert got[0].title == "Python"
        assert got[1].title == "OOP"

    def test_loads_index_before_searching(self):
        from llm_wiki.application.search_wiki import SearchWiki

        engine = _make_engine([])
        project = _make_project()

        uc = SearchWiki(project, engine)
        uc.execute("anything")

        engine.load_index.assert_called_once_with(project.search_index_path)
        engine.search.assert_called_once()


class TestSearchWikiLimit:
    def test_truncates_to_limit(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path=f"wiki/entities/p{i}.md", score=float(10 - i), title=f"P{i}", snippet="...")
            for i in range(10)
        ]
        engine = _make_engine(results)
        project = _make_project()

        uc = SearchWiki(project, engine)
        got = uc.execute("test", limit=3)

        assert len(got) == 3

    def test_default_limit_is_10(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path=f"wiki/entities/p{i}.md", score=float(20 - i), title=f"P{i}", snippet="...")
            for i in range(15)
        ]
        engine = _make_engine(results)
        project = _make_project()

        uc = SearchWiki(project, engine)
        got = uc.execute("test")

        assert len(got) == 10


class TestSearchWikiPageTypeFilter:
    def test_filter_entities_only(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path="wiki/entities/python.md", score=5.0, title="Python", snippet="..."),
            SearchResult(path="wiki/concepts/oop.md", score=4.0, title="OOP", snippet="..."),
            SearchResult(path="wiki/entities/java.md", score=3.0, title="Java", snippet="..."),
        ]
        engine = _make_engine(results)
        project = _make_project()

        uc = SearchWiki(project, engine)
        got = uc.execute("lang", page_type="entity")

        assert len(got) == 2
        assert all("entities" in r.path for r in got)

    def test_filter_concepts(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path="wiki/entities/python.md", score=5.0, title="Python", snippet="..."),
            SearchResult(path="wiki/concepts/oop.md", score=4.0, title="OOP", snippet="..."),
        ]
        engine = _make_engine(results)
        project = _make_project()

        uc = SearchWiki(project, engine)
        got = uc.execute("test", page_type="concept")

        assert len(got) == 1
        assert got[0].title == "OOP"

    def test_filter_sources(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path="wiki/sources/paper.md", score=5.0, title="Paper", snippet="..."),
            SearchResult(path="wiki/entities/python.md", score=4.0, title="Python", snippet="..."),
        ]
        engine = _make_engine(results)

        uc = SearchWiki(_make_project(), engine)
        got = uc.execute("test", page_type="source")

        assert len(got) == 1
        assert got[0].title == "Paper"

    def test_no_match_returns_empty(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path="wiki/entities/python.md", score=5.0, title="Python", snippet="..."),
        ]
        engine = _make_engine(results)

        uc = SearchWiki(_make_project(), engine)
        got = uc.execute("test", page_type="comparison")

        assert got == []


class TestSearchWikiScopeFilter:
    def test_raw_scope(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path="raw/paper.md", score=5.0, title="Paper", snippet="..."),
            SearchResult(path="wiki/entities/python.md", score=4.0, title="Python", snippet="..."),
            SearchResult(path="raw/notes.md", score=3.0, title="Notes", snippet="..."),
        ]
        engine = _make_engine(results)

        uc = SearchWiki(_make_project(), engine)
        got = uc.execute("test", scope="raw")

        assert len(got) == 2
        assert all(r.path.startswith("raw/") for r in got)

    def test_wiki_scope(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path="raw/paper.md", score=5.0, title="Paper", snippet="..."),
            SearchResult(path="wiki/entities/python.md", score=4.0, title="Python", snippet="..."),
        ]
        engine = _make_engine(results)

        uc = SearchWiki(_make_project(), engine)
        got = uc.execute("test", scope="wiki")

        assert len(got) == 1
        assert got[0].title == "Python"

    def test_no_scope_returns_all(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path="raw/paper.md", score=5.0, title="Paper", snippet="..."),
            SearchResult(path="wiki/entities/python.md", score=4.0, title="Python", snippet="..."),
        ]
        engine = _make_engine(results)

        uc = SearchWiki(_make_project(), engine)
        got = uc.execute("test")

        assert len(got) == 2


class TestSearchWikiCombinedFilters:
    def test_page_type_and_scope_combined(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path="wiki/entities/python.md", score=5.0, title="Python", snippet="..."),
            SearchResult(path="wiki/concepts/oop.md", score=4.0, title="OOP", snippet="..."),
            SearchResult(path="raw/paper.md", score=3.0, title="Paper", snippet="..."),
        ]
        engine = _make_engine(results)

        uc = SearchWiki(_make_project(), engine)
        got = uc.execute("test", page_type="entity", scope="wiki")

        assert len(got) == 1
        assert got[0].title == "Python"

    def test_combined_filters_with_limit(self):
        from llm_wiki.application.search_wiki import SearchWiki

        results = [
            SearchResult(path=f"wiki/entities/p{i}.md", score=float(10 - i), title=f"P{i}", snippet="...")
            for i in range(5)
        ]
        engine = _make_engine(results)

        uc = SearchWiki(_make_project(), engine)
        got = uc.execute("test", page_type="entity", scope="wiki", limit=2)

        assert len(got) == 2


class TestSearchWikiIndexNotFound:
    def test_file_not_found_raises_domain_error(self):
        from llm_wiki.application.search_wiki import SearchWiki

        engine = MagicMock()
        engine.load_index.side_effect = FileNotFoundError("no such file")

        uc = SearchWiki(_make_project(), engine)

        with pytest.raises(SearchIndexNotFoundError):
            uc.execute("test")

    def test_os_error_raises_domain_error(self):
        from llm_wiki.application.search_wiki import SearchWiki

        engine = MagicMock()
        engine.load_index.side_effect = OSError("permission denied")

        uc = SearchWiki(_make_project(), engine)

        with pytest.raises(SearchIndexNotFoundError):
            uc.execute("test")
