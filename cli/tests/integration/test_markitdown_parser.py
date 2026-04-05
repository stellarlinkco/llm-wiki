"""Integration tests for MarkItDownParser adapter.

Tests real file parsing through MarkItDown — no mocks.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from llm_wiki.domain.errors import ParseError
from llm_wiki.domain.models import Frontmatter, ParsedDocument, SourceFile
from llm_wiki.infrastructure.markitdown_parser import MarkItDownParser


@pytest.fixture
def parser() -> MarkItDownParser:
    return MarkItDownParser()


# ── Fixture helpers ──────────────────────────────────────────────


@pytest.fixture
def txt_file(tmp_path: Path) -> Path:
    p = tmp_path / "sample.txt"
    p.write_text("# My Title\n\nHello world, this is plain text.\n")
    return p


@pytest.fixture
def txt_file_no_heading(tmp_path: Path) -> Path:
    p = tmp_path / "no-heading.txt"
    p.write_text("Just some content without a markdown heading.\n")
    return p


@pytest.fixture
def html_file(tmp_path: Path) -> Path:
    p = tmp_path / "page.html"
    p.write_text(
        "<html><body><h1>Web Page</h1><p>Some <b>bold</b> text.</p></body></html>"
    )
    return p


# ── 1. Parse .txt → ParsedDocument with correct content & frontmatter ────


class TestParseTxt:
    def test_returns_parsed_document(
        self, parser: MarkItDownParser, txt_file: Path
    ) -> None:
        source = SourceFile.from_path(txt_file)
        result = parser.parse(source)

        assert isinstance(result, ParsedDocument)

    def test_content_preserved(
        self, parser: MarkItDownParser, txt_file: Path
    ) -> None:
        source = SourceFile.from_path(txt_file)
        result = parser.parse(source)

        assert "Hello world" in result.content

    def test_frontmatter_fields(
        self, parser: MarkItDownParser, txt_file: Path
    ) -> None:
        source = SourceFile.from_path(txt_file)
        result = parser.parse(source)
        fm = result.frontmatter

        assert isinstance(fm, Frontmatter)
        assert fm.source_path == str(txt_file)
        assert fm.format == "txt"
        assert fm.parsed_at.endswith("Z")

    def test_source_round_trip(
        self, parser: MarkItDownParser, txt_file: Path
    ) -> None:
        source = SourceFile.from_path(txt_file)
        result = parser.parse(source)

        assert result.source is source


# ── 2. Parse .html → markdown content ────────────────────────────


class TestParseHtml:
    def test_returns_parsed_document(
        self, parser: MarkItDownParser, html_file: Path
    ) -> None:
        source = SourceFile.from_path(html_file)
        result = parser.parse(source)

        assert isinstance(result, ParsedDocument)

    def test_html_converted_to_markdown(
        self, parser: MarkItDownParser, html_file: Path
    ) -> None:
        source = SourceFile.from_path(html_file)
        result = parser.parse(source)

        # markitdown converts HTML to markdown; bold text should appear
        assert "bold" in result.content

    def test_frontmatter_format_is_html(
        self, parser: MarkItDownParser, html_file: Path
    ) -> None:
        source = SourceFile.from_path(html_file)
        result = parser.parse(source)

        assert result.frontmatter.format == "html"


# ── 3. Parse nonexistent file → ParseError ───────────────────────


class TestParseNonexistent:
    def test_raises_parse_error(self, parser: MarkItDownParser, tmp_path: Path) -> None:
        missing = tmp_path / "does_not_exist.txt"
        source = SourceFile.from_path(missing)

        with pytest.raises(ParseError):
            parser.parse(source)

    def test_error_message_contains_path(
        self, parser: MarkItDownParser, tmp_path: Path
    ) -> None:
        missing = tmp_path / "ghost.pdf"
        source = SourceFile.from_path(missing)

        with pytest.raises(ParseError, match="ghost.pdf"):
            parser.parse(source)


# ── 4. supported_formats() returns known extensions ──────────────


class TestSupportedFormats:
    def test_returns_list(self, parser: MarkItDownParser) -> None:
        fmts = parser.supported_formats()
        assert isinstance(fmts, list)

    def test_contains_core_formats(self, parser: MarkItDownParser) -> None:
        fmts = parser.supported_formats()
        for ext in ("pdf", "docx", "html", "txt", "csv", "md"):
            assert ext in fmts, f"{ext} missing from supported_formats"

    def test_no_dots_in_extensions(self, parser: MarkItDownParser) -> None:
        fmts = parser.supported_formats()
        for ext in fmts:
            assert not ext.startswith("."), f"extension should not have dot: {ext}"


# ── 5. Title extraction ─────────────────────────────────────────


class TestTitleExtraction:
    def test_title_from_heading(
        self, parser: MarkItDownParser, txt_file: Path
    ) -> None:
        """If content has `# Title`, use it."""
        source = SourceFile.from_path(txt_file)
        result = parser.parse(source)

        assert result.frontmatter.title == "My Title"

    def test_title_fallback_to_first_line(
        self, parser: MarkItDownParser, txt_file_no_heading: Path
    ) -> None:
        """Without a heading, title is extracted from the first content line."""
        source = SourceFile.from_path(txt_file_no_heading)
        result = parser.parse(source)

        # Should extract first meaningful line, not filename
        assert result.frontmatter.title != ""
        assert len(result.frontmatter.title) > 0
