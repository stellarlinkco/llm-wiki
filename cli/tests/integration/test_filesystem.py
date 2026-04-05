"""Integration tests for LocalFileSystem adapter.

Uses real filesystem via pytest tmp_path fixture.
"""

from pathlib import Path

import pytest

from llm_wiki.domain.models import PageType, WikiPage
from llm_wiki.infrastructure.filesystem import LocalFileSystem


@pytest.fixture
def fs() -> LocalFileSystem:
    return LocalFileSystem()


# ---------------------------------------------------------------------------
# list_pages
# ---------------------------------------------------------------------------


class TestListPages:
    def test_parses_md_files_with_yaml_frontmatter(self, fs: LocalFileSystem, tmp_path: Path):
        md = tmp_path / "alpha.md"
        md.write_text(
            "---\n"
            "title: Alpha Page\n"
            "type: entity\n"
            "created: '2025-01-01'\n"
            "updated: '2025-06-15'\n"
            "sources:\n"
            "  - doc1.pdf\n"
            "  - doc2.pdf\n"
            "tags:\n"
            "  - physics\n"
            "  - quantum\n"
            "---\n"
            "Hello world this is content\n",
            encoding="utf-8",
        )

        pages = fs.list_pages(tmp_path)

        assert len(pages) == 1
        page = pages[0]
        assert page.path == md
        assert page.title == "Alpha Page"
        assert page.page_type == PageType.ENTITY
        assert page.created == "2025-01-01"
        assert page.updated == "2025-06-15"
        assert page.sources == ("doc1.pdf", "doc2.pdf")
        assert page.tags == ("physics", "quantum")
        assert page.word_count == 5  # "Hello world this is content"

    def test_multiple_md_files(self, fs: LocalFileSystem, tmp_path: Path):
        for name in ("a.md", "b.md", "c.md"):
            (tmp_path / name).write_text(
                "---\ntitle: Page\n---\nword\n", encoding="utf-8"
            )
        # non-md file should be ignored
        (tmp_path / "readme.txt").write_text("ignore me", encoding="utf-8")

        pages = fs.list_pages(tmp_path)
        assert len(pages) == 3

    def test_no_frontmatter_returns_defaults(self, fs: LocalFileSystem, tmp_path: Path):
        md = tmp_path / "bare.md"
        md.write_text("Just plain markdown content\n", encoding="utf-8")

        pages = fs.list_pages(tmp_path)

        assert len(pages) == 1
        page = pages[0]
        assert page.path == md
        assert page.title == "bare"  # stem of filename
        assert page.page_type is None
        assert page.created is None
        assert page.updated is None
        assert page.sources == ()
        assert page.tags == ()
        assert page.word_count == 4  # "Just plain markdown content"

    def test_corrupt_frontmatter_returns_defaults(self, fs: LocalFileSystem, tmp_path: Path):
        md = tmp_path / "bad.md"
        md.write_text(
            "---\n"
            "title: [unclosed bracket\n"
            "---\n"
            "body text here\n",
            encoding="utf-8",
        )

        pages = fs.list_pages(tmp_path)

        assert len(pages) == 1
        page = pages[0]
        # Should not crash; uses filename-derived defaults
        assert page.path == md
        assert isinstance(page.title, str)
        assert page.word_count >= 0

    def test_unknown_page_type_defaults_to_none(self, fs: LocalFileSystem, tmp_path: Path):
        md = tmp_path / "unknown.md"
        md.write_text(
            "---\ntitle: X\ntype: nonexistent_type\n---\ncontent\n",
            encoding="utf-8",
        )

        pages = fs.list_pages(tmp_path)
        assert pages[0].page_type is None

    def test_empty_directory_returns_empty_list(self, fs: LocalFileSystem, tmp_path: Path):
        assert fs.list_pages(tmp_path) == []


# ---------------------------------------------------------------------------
# read_content
# ---------------------------------------------------------------------------


class TestReadContent:
    def test_reads_file_as_utf8(self, fs: LocalFileSystem, tmp_path: Path):
        p = tmp_path / "note.md"
        p.write_text("café résumé naïve", encoding="utf-8")

        assert fs.read_content(p) == "café résumé naïve"

    def test_reads_empty_file(self, fs: LocalFileSystem, tmp_path: Path):
        p = tmp_path / "empty.md"
        p.write_text("", encoding="utf-8")

        assert fs.read_content(p) == ""


# ---------------------------------------------------------------------------
# write_content
# ---------------------------------------------------------------------------


class TestWriteContent:
    def test_writes_string_to_file(self, fs: LocalFileSystem, tmp_path: Path):
        p = tmp_path / "out.md"
        fs.write_content(p, "hello world")

        assert p.read_text(encoding="utf-8") == "hello world"

    def test_creates_parent_dirs(self, fs: LocalFileSystem, tmp_path: Path):
        p = tmp_path / "a" / "b" / "c" / "deep.md"
        fs.write_content(p, "deep content")

        assert p.exists()
        assert p.read_text(encoding="utf-8") == "deep content"

    def test_overwrites_existing_file(self, fs: LocalFileSystem, tmp_path: Path):
        p = tmp_path / "overwrite.md"
        p.write_text("old", encoding="utf-8")

        fs.write_content(p, "new")

        assert p.read_text(encoding="utf-8") == "new"


# ---------------------------------------------------------------------------
# exists
# ---------------------------------------------------------------------------


class TestExists:
    def test_existing_file(self, fs: LocalFileSystem, tmp_path: Path):
        p = tmp_path / "file.txt"
        p.write_text("x", encoding="utf-8")
        assert fs.exists(p) is True

    def test_existing_directory(self, fs: LocalFileSystem, tmp_path: Path):
        d = tmp_path / "subdir"
        d.mkdir()
        assert fs.exists(d) is True

    def test_nonexistent_path(self, fs: LocalFileSystem, tmp_path: Path):
        assert fs.exists(tmp_path / "nope") is False


# ---------------------------------------------------------------------------
# ensure_dir
# ---------------------------------------------------------------------------


class TestEnsureDir:
    def test_creates_directory(self, fs: LocalFileSystem, tmp_path: Path):
        d = tmp_path / "new_dir"
        fs.ensure_dir(d)
        assert d.is_dir()

    def test_creates_parent_directories(self, fs: LocalFileSystem, tmp_path: Path):
        d = tmp_path / "p1" / "p2" / "p3"
        fs.ensure_dir(d)
        assert d.is_dir()

    def test_idempotent_on_existing_dir(self, fs: LocalFileSystem, tmp_path: Path):
        d = tmp_path / "existing"
        d.mkdir()
        fs.ensure_dir(d)  # should not raise
        assert d.is_dir()


# ---------------------------------------------------------------------------
# list_files
# ---------------------------------------------------------------------------


class TestListFiles:
    def test_matches_glob_pattern(self, fs: LocalFileSystem, tmp_path: Path):
        (tmp_path / "a.md").write_text("", encoding="utf-8")
        (tmp_path / "b.md").write_text("", encoding="utf-8")
        (tmp_path / "c.txt").write_text("", encoding="utf-8")

        result = fs.list_files(tmp_path, "*.md")
        names = sorted(p.name for p in result)
        assert names == ["a.md", "b.md"]

    def test_recursive_matching(self, fs: LocalFileSystem, tmp_path: Path):
        sub = tmp_path / "sub"
        sub.mkdir()
        (tmp_path / "top.md").write_text("", encoding="utf-8")
        (sub / "nested.md").write_text("", encoding="utf-8")

        result = fs.list_files(tmp_path, "*.md")
        names = sorted(p.name for p in result)
        assert names == ["nested.md", "top.md"]

    def test_no_matches_returns_empty(self, fs: LocalFileSystem, tmp_path: Path):
        assert fs.list_files(tmp_path, "*.xyz") == []
