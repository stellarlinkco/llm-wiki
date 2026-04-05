"""TDD: Domain models tests — written BEFORE implementation."""

from pathlib import Path
from datetime import datetime

import pytest


class TestPageType:
    def test_enum_values(self):
        from llm_wiki.domain.models import PageType

        assert PageType.ENTITY == "entity"
        assert PageType.CONCEPT == "concept"
        assert PageType.SOURCE == "source"
        assert PageType.COMPARISON == "comparison"
        assert PageType.QUERY == "query"
        assert PageType.OVERVIEW == "overview"

    def test_all_types_count(self):
        from llm_wiki.domain.models import PageType

        assert len(PageType) == 6


class TestSourceFile:
    def test_from_path(self):
        from llm_wiki.domain.models import SourceFile

        sf = SourceFile.from_path(Path("/docs/paper.pdf"))
        assert sf.path == Path("/docs/paper.pdf")
        assert sf.format == "pdf"

    def test_format_lowercase(self):
        from llm_wiki.domain.models import SourceFile

        sf = SourceFile.from_path(Path("/docs/report.DOCX"))
        assert sf.format == "docx"

    def test_frozen(self):
        from llm_wiki.domain.models import SourceFile

        sf = SourceFile(path=Path("/a.txt"), format="txt")
        with pytest.raises(AttributeError):
            sf.path = Path("/b.txt")  # type: ignore[misc]


class TestFrontmatter:
    def test_creation(self):
        from llm_wiki.domain.models import Frontmatter

        fm = Frontmatter(
            title="Test Paper",
            source_path="/docs/paper.pdf",
            format="pdf",
            parsed_at="2026-04-05T12:00:00Z",
        )
        assert fm.title == "Test Paper"
        assert fm.format == "pdf"

    def test_frozen(self):
        from llm_wiki.domain.models import Frontmatter

        fm = Frontmatter(
            title="T", source_path="/a", format="pdf", parsed_at="2026-01-01"
        )
        with pytest.raises(AttributeError):
            fm.title = "X"  # type: ignore[misc]


class TestParsedDocument:
    def test_creation(self):
        from llm_wiki.domain.models import ParsedDocument, Frontmatter, SourceFile

        source = SourceFile(path=Path("/a.pdf"), format="pdf")
        fm = Frontmatter(
            title="Paper", source_path="/a.pdf", format="pdf", parsed_at="2026-01-01"
        )
        doc = ParsedDocument(content="# Hello", frontmatter=fm, source=source)
        assert doc.content == "# Hello"
        assert doc.frontmatter.title == "Paper"
        assert doc.source.format == "pdf"


class TestWikiPage:
    def test_creation(self):
        from llm_wiki.domain.models import WikiPage, PageType

        page = WikiPage(
            path=Path("wiki/entities/python.md"),
            title="Python",
            page_type=PageType.ENTITY,
            created="2026-01-01",
            updated="2026-04-05",
            sources=("paper1.md", "paper2.md"),
            tags=("programming", "language"),
            word_count=1500,
        )
        assert page.title == "Python"
        assert page.page_type == PageType.ENTITY
        assert len(page.sources) == 2
        assert page.word_count == 1500

    def test_optional_fields(self):
        from llm_wiki.domain.models import WikiPage

        page = WikiPage(
            path=Path("wiki/sources/x.md"),
            title="X",
            page_type=None,
            created=None,
            updated=None,
            sources=(),
            tags=(),
            word_count=0,
        )
        assert page.page_type is None
        assert page.created is None

    def test_frozen(self):
        from llm_wiki.domain.models import WikiPage

        page = WikiPage(
            path=Path("a.md"),
            title="A",
            page_type=None,
            created=None,
            updated=None,
            sources=(),
            tags=(),
            word_count=0,
        )
        with pytest.raises(AttributeError):
            page.title = "B"  # type: ignore[misc]


class TestWikiProject:
    def test_derived_paths(self):
        from llm_wiki.domain.models import WikiProject

        proj = WikiProject(root=Path("/home/user/my-wiki"), name="My Wiki")
        assert proj.raw_dir == Path("/home/user/my-wiki/raw")
        assert proj.wiki_dir == Path("/home/user/my-wiki/wiki")
        assert proj.index_path == Path("/home/user/my-wiki/wiki/index.md")
        assert proj.log_path == Path("/home/user/my-wiki/wiki/log.md")
        assert proj.search_index_path == Path(
            "/home/user/my-wiki/.llm-wiki/search-index.json"
        )
        assert proj.schema_path == Path("/home/user/my-wiki/CLAUDE.md")
        assert proj.marker_dir == Path("/home/user/my-wiki/.llm-wiki")

    def test_subdirectories(self):
        from llm_wiki.domain.models import WikiProject

        proj = WikiProject(root=Path("/wiki"), name="W")
        expected = {
            "raw",
            "raw/assets",
            "wiki",
            "wiki/entities",
            "wiki/concepts",
            "wiki/sources",
            "wiki/comparisons",
            "wiki/queries",
            ".llm-wiki",
        }
        assert set(str(p.relative_to(proj.root)) for p in proj.required_dirs) == expected


class TestSearchResult:
    def test_creation(self):
        from llm_wiki.domain.models import SearchResult

        sr = SearchResult(
            path="wiki/concepts/attention.md",
            score=12.4,
            title="Attention Mechanism",
            snippet="The attention mechanism allows...",
        )
        assert sr.score == 12.4
        assert sr.title == "Attention Mechanism"

    def test_frozen(self):
        from llm_wiki.domain.models import SearchResult

        sr = SearchResult(path="a", score=1.0, title="A", snippet="s")
        with pytest.raises(AttributeError):
            sr.score = 2.0  # type: ignore[misc]


class TestValidationError:
    def test_with_line(self):
        from llm_wiki.domain.models import ValidationFinding

        err = ValidationFinding(
            error_type="dead_link",
            file="wiki/entities/foo.md",
            message="Link to bar.md not found",
            line=42,
        )
        assert err.line == 42

    def test_without_line(self):
        from llm_wiki.domain.models import ValidationFinding

        err = ValidationFinding(
            error_type="missing_dir",
            file="wiki/",
            message="wiki/entities/ missing",
        )
        assert err.line is None


class TestValidationReport:
    def test_valid_when_no_errors(self):
        from llm_wiki.domain.models import ValidationReport, ValidationFinding

        warning = ValidationFinding(
            error_type="warn", file="a.md", message="minor"
        )
        report = ValidationReport(valid=True, errors=(), warnings=(warning,))
        assert report.valid is True
        assert len(report.warnings) == 1

    def test_invalid_when_errors(self):
        from llm_wiki.domain.models import ValidationReport, ValidationFinding

        error = ValidationFinding(
            error_type="missing_frontmatter", file="b.md", message="no frontmatter"
        )
        report = ValidationReport(valid=False, errors=(error,), warnings=())
        assert report.valid is False


class TestWikiStatus:
    def test_creation(self):
        from llm_wiki.domain.models import WikiStatus

        status = WikiStatus(
            wiki_root="/home/user/wiki",
            raw_documents=10,
            wiki_pages=45,
            by_type={"entity": 20, "concept": 15, "source": 10},
            total_word_count=120000,
            last_modified="2026-04-05",
            index_stale=False,
            search_index_exists=True,
        )
        assert status.raw_documents == 10
        assert status.wiki_pages == 45
        assert status.total_word_count == 120000
        assert status.index_stale is False


# --- Ports tests ---


class TestDocumentParserPort:
    def test_is_abstract(self):
        from llm_wiki.domain.ports import DocumentParser

        with pytest.raises(TypeError):
            DocumentParser()  # type: ignore[abstract]

    def test_has_required_methods(self):
        from llm_wiki.domain.ports import DocumentParser

        assert hasattr(DocumentParser, "parse")
        assert hasattr(DocumentParser, "supported_formats")


class TestPageRepositoryPort:
    def test_is_abstract(self):
        from llm_wiki.domain.ports import PageRepository

        with pytest.raises(TypeError):
            PageRepository()  # type: ignore[abstract]

    def test_has_required_methods(self):
        from llm_wiki.domain.ports import PageRepository

        for method in ["list_pages", "read_content", "write_content", "exists", "ensure_dir", "list_files"]:
            assert hasattr(PageRepository, method)


class TestSearchEnginePort:
    def test_is_abstract(self):
        from llm_wiki.domain.ports import SearchEngine

        with pytest.raises(TypeError):
            SearchEngine()  # type: ignore[abstract]

    def test_has_required_methods(self):
        from llm_wiki.domain.ports import SearchEngine

        for method in ["build_index", "search", "save_index", "load_index"]:
            assert hasattr(SearchEngine, method)


# --- Errors tests ---


class TestDomainErrors:
    def test_wiki_not_found_error(self):
        from llm_wiki.domain.errors import WikiNotFoundError

        err = WikiNotFoundError("not found")
        assert str(err) == "not found"
        assert isinstance(err, Exception)

    def test_parse_error(self):
        from llm_wiki.domain.errors import ParseError

        err = ParseError("bad pdf")
        assert isinstance(err, Exception)

    def test_search_index_not_found_error(self):
        from llm_wiki.domain.errors import SearchIndexNotFoundError

        assert issubclass(SearchIndexNotFoundError, Exception)

    def test_project_already_exists_error(self):
        from llm_wiki.domain.errors import ProjectAlreadyExistsError

        assert issubclass(ProjectAlreadyExistsError, Exception)
