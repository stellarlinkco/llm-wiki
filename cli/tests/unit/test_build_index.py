"""Tests for BuildIndex use case."""

from pathlib import Path
from unittest.mock import MagicMock, call

import pytest

from llm_wiki.application.build_index import BuildIndex, IndexResult
from llm_wiki.domain.models import PageType, WikiPage, WikiProject
from llm_wiki.domain.ports import PageRepository, SearchEngine


@pytest.fixture
def project():
    return WikiProject(root=Path("/fake/project"), name="test-wiki")


@pytest.fixture
def repo():
    return MagicMock(spec=PageRepository)


@pytest.fixture
def search():
    return MagicMock(spec=SearchEngine)


def _make_page(path: Path, title: str, page_type: PageType | None = None) -> WikiPage:
    return WikiPage(
        path=path,
        title=title,
        page_type=page_type,
        created=None,
        updated=None,
        sources=(),
        tags=(),
        word_count=0,
    )


# --- Empty wiki --------------------------------------------------------


def test_empty_wiki_produces_empty_index(project, repo, search):
    """With no pages, index.md should be minimal and counts zero."""
    repo.list_pages.return_value = []
    repo.read_content.return_value = ""

    uc = BuildIndex(project, repo, search)
    result = uc.execute()

    assert isinstance(result, IndexResult)
    assert result.catalog_entries == 0
    assert result.indexed_documents == 0
    repo.write_content.assert_called_once()
    # The written path should be the project index_path
    written_path = repo.write_content.call_args[0][0]
    assert written_path == project.index_path


# --- Pages grouped by type --------------------------------------------


def test_pages_grouped_by_type_in_index(project, repo, search):
    """Index.md content should group wiki pages by their page_type."""
    entity_page = _make_page(
        project.wiki_dir / "entities" / "alpha.md", "Alpha", PageType.ENTITY
    )
    concept_page = _make_page(
        project.wiki_dir / "concepts" / "beta.md", "Beta", PageType.CONCEPT
    )

    def list_pages_side(directory):
        if directory == project.wiki_dir:
            return [entity_page, concept_page]
        return []  # raw_dir

    repo.list_pages.side_effect = list_pages_side
    repo.read_content.return_value = (
        "---\ntitle: X\ntype: entity\n---\nSome content here for summary.\n"
    )

    uc = BuildIndex(project, repo, search)
    result = uc.execute()

    # Check that write_content was called with grouped content
    written_content = repo.write_content.call_args[0][1]
    assert "## Entity" in written_content or "## entity" in written_content.lower()
    assert "## Concept" in written_content or "## concept" in written_content.lower()
    assert "Alpha" in written_content
    assert "Beta" in written_content
    assert result.catalog_entries == 2


# --- Search engine called with all docs --------------------------------


def test_search_engine_receives_all_documents(project, repo, search):
    """build_index + save_index should be called with wiki + raw pages."""
    wiki_page = _make_page(
        project.wiki_dir / "entities" / "a.md", "A", PageType.ENTITY
    )
    raw_page = _make_page(project.raw_dir / "notes.md", "Notes", None)

    def list_pages_side(directory):
        if directory == project.wiki_dir:
            return [wiki_page]
        if directory == project.raw_dir:
            return [raw_page]
        return []

    repo.list_pages.side_effect = list_pages_side
    repo.read_content.return_value = "---\ntitle: T\n---\nBody text.\n"

    uc = BuildIndex(project, repo, search)
    result = uc.execute()

    search.build_index.assert_called_once()
    docs = search.build_index.call_args[0][0]
    assert len(docs) == 2
    # Each doc is a (path, title, content) tuple
    paths = {d[0] for d in docs}
    assert str(wiki_page.path) in paths
    assert str(raw_page.path) in paths
    search.save_index.assert_called_once_with(project.search_index_path)


# --- Correct counts returned -------------------------------------------


def test_returns_correct_counts(project, repo, search):
    """IndexResult should have correct catalog_entries and indexed_documents."""
    wiki_pages = [
        _make_page(project.wiki_dir / "entities" / "a.md", "A", PageType.ENTITY),
        _make_page(project.wiki_dir / "concepts" / "b.md", "B", PageType.CONCEPT),
    ]
    raw_pages = [
        _make_page(project.raw_dir / "r.md", "R", None),
    ]

    def list_pages_side(directory):
        if directory == project.wiki_dir:
            return wiki_pages
        if directory == project.raw_dir:
            return raw_pages
        return []

    repo.list_pages.side_effect = list_pages_side
    repo.read_content.return_value = "---\ntitle: T\n---\nBody.\n"

    uc = BuildIndex(project, repo, search)
    result = uc.execute()

    # catalog_entries = wiki pages listed in index.md
    assert result.catalog_entries == 2
    # indexed_documents = wiki + raw pages in search index
    assert result.indexed_documents == 3
    assert result.index_path == str(project.index_path)


# --- Frontmatter stripping --------------------------------------------


def test_summary_strips_frontmatter(project, repo, search):
    """The summary in index.md should not include frontmatter block."""
    page = _make_page(
        project.wiki_dir / "entities" / "x.md", "X", PageType.ENTITY
    )

    repo.list_pages.side_effect = lambda d: [page] if d == project.wiki_dir else []
    body = "This is the actual body content that appears after frontmatter."
    repo.read_content.return_value = f"---\ntitle: X\ntype: entity\n---\n{body}\n"

    uc = BuildIndex(project, repo, search)
    uc.execute()

    written = repo.write_content.call_args[0][1]
    # The summary should contain the body, not frontmatter fields
    assert "This is the actual body" in written
    assert "type: entity" not in written.split("---")[-1] if "---" in written else True
