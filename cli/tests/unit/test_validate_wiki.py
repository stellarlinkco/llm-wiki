"""Tests for ValidateWiki use case."""

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from llm_wiki.application.validate_wiki import ValidateWiki
from llm_wiki.domain.models import WikiProject
from llm_wiki.domain.ports import PageRepository


@pytest.fixture
def project():
    return WikiProject(root=Path("/fake/project"), name="test-wiki")


@pytest.fixture
def repo():
    return MagicMock(spec=PageRepository)


# --- All valid ---------------------------------------------------------


def test_all_valid_returns_valid_report(project, repo):
    """When all dirs exist, all frontmatter is correct, and no dead links,
    report.valid should be True with zero errors."""
    repo.exists.return_value = True

    def list_files_side(directory, pattern="*.md"):
        if directory == project.wiki_dir:
            return [project.wiki_dir / "entities" / "page.md"]
        return []

    repo.list_files.side_effect = list_files_side
    repo.read_content.return_value = (
        "---\ntitle: My Page\ntype: entity\n---\n\nSome body text.\n"
    )

    uc = ValidateWiki(project, repo)
    report = uc.execute()

    assert report.valid is True
    assert report.errors == ()


# --- Missing directory -------------------------------------------------


def test_missing_directory_produces_error(project, repo):
    """A required directory that doesn't exist should produce an error."""

    def exists_side_effect(path):
        # Make the first required dir missing, rest exist
        if path == project.required_dirs[0]:
            return False
        return True

    repo.exists.side_effect = exists_side_effect
    repo.list_files.return_value = []

    uc = ValidateWiki(project, repo)
    report = uc.execute()

    assert report.valid is False
    assert len(report.errors) >= 1
    dir_errors = [e for e in report.errors if e.error_type == "missing_directory"]
    assert len(dir_errors) == 1
    assert str(project.required_dirs[0]) in dir_errors[0].message


# --- Missing frontmatter -----------------------------------------------


def test_missing_frontmatter_produces_error(project, repo):
    """A .md file without frontmatter should produce an error."""
    repo.exists.return_value = True

    def list_files_side(directory, pattern="*.md"):
        if directory == project.wiki_dir:
            return [project.wiki_dir / "entities" / "bad.md"]
        return []

    repo.list_files.side_effect = list_files_side
    repo.read_content.return_value = "No frontmatter at all.\n"

    uc = ValidateWiki(project, repo)
    report = uc.execute()

    assert report.valid is False
    fm_errors = [e for e in report.errors if e.error_type == "missing_frontmatter"]
    assert len(fm_errors) == 1


def test_wiki_frontmatter_missing_title_produces_error(project, repo):
    """Wiki file with frontmatter but no title: field → error."""
    repo.exists.return_value = True

    def list_files_side(directory, pattern="*.md"):
        if directory == project.wiki_dir:
            return [project.wiki_dir / "entities" / "notitle.md"]
        return []

    repo.list_files.side_effect = list_files_side
    repo.read_content.return_value = "---\ntype: entity\n---\nBody.\n"

    uc = ValidateWiki(project, repo)
    report = uc.execute()

    assert report.valid is False
    field_errors = [e for e in report.errors if e.error_type == "missing_field"]
    assert any("title" in e.message for e in field_errors)


def test_wiki_frontmatter_missing_type_produces_error(project, repo):
    """Wiki file with frontmatter but no type: field → error."""
    repo.exists.return_value = True

    def list_files_side(directory, pattern="*.md"):
        if directory == project.wiki_dir:
            return [project.wiki_dir / "entities" / "notype.md"]
        return []

    repo.list_files.side_effect = list_files_side
    repo.read_content.return_value = "---\ntitle: Has Title\n---\nBody.\n"

    uc = ValidateWiki(project, repo)
    report = uc.execute()

    assert report.valid is False
    field_errors = [e for e in report.errors if e.error_type == "missing_field"]
    assert any("type" in e.message for e in field_errors)


def test_raw_frontmatter_only_needs_title(project, repo):
    """Raw files only need 'title' in frontmatter, not 'type'."""
    repo.exists.return_value = True
    # Return raw/ files from list_files for wiki_dir (empty), and raw_dir with a file
    wiki_file = project.raw_dir / "notes.md"
    repo.list_files.return_value = []  # default

    def list_files_side_effect(directory, pattern="*.md"):
        if directory == project.wiki_dir:
            return []
        if directory == project.raw_dir:
            return [wiki_file]
        return []

    repo.list_files.side_effect = list_files_side_effect
    repo.read_content.return_value = "---\ntitle: Raw Note\n---\nContent.\n"

    uc = ValidateWiki(project, repo)
    report = uc.execute()

    # No errors because raw/ only requires title
    assert report.valid is True


# --- Dead link ----------------------------------------------------------


def test_dead_link_produces_error(project, repo):
    """A markdown link pointing to a non-existent file should produce an error."""
    wiki_file = project.wiki_dir / "entities" / "page.md"

    def exists_side_effect(path):
        # All dirs exist, but linked target does not
        if path == project.wiki_dir / "entities" / "missing.md":
            return False
        return True

    repo.exists.side_effect = exists_side_effect

    def list_files_side(directory, pattern="*.md"):
        if directory == project.wiki_dir:
            return [wiki_file]
        return []

    repo.list_files.side_effect = list_files_side
    repo.read_content.return_value = (
        "---\ntitle: Page\ntype: entity\n---\n\n"
        "See [other](./missing.md) for details.\n"
    )

    uc = ValidateWiki(project, repo)
    report = uc.execute()

    assert report.valid is False
    link_errors = [e for e in report.errors if e.error_type == "dead_link"]
    assert len(link_errors) == 1
    assert "missing.md" in link_errors[0].message


def test_external_links_are_ignored(project, repo):
    """HTTP(S) links should not be checked."""
    repo.exists.return_value = True

    def list_files_side(directory, pattern="*.md"):
        if directory == project.wiki_dir:
            return [project.wiki_dir / "entities" / "page.md"]
        return []

    repo.list_files.side_effect = list_files_side
    repo.read_content.return_value = (
        "---\ntitle: Page\ntype: entity\n---\n\n"
        "See [Google](https://google.com) and [Docs](http://docs.io).\n"
    )

    uc = ValidateWiki(project, repo)
    report = uc.execute()

    assert report.valid is True
    assert report.errors == ()


# --- Fix mode -----------------------------------------------------------


def test_fix_mode_creates_missing_dirs(project, repo):
    """When fix=True, missing required dirs should be created via ensure_dir."""
    missing_dir = project.required_dirs[0]

    def exists_side_effect(path):
        if path == missing_dir:
            return False
        return True

    repo.exists.side_effect = exists_side_effect
    repo.list_files.return_value = []

    uc = ValidateWiki(project, repo)
    report = uc.execute(fix=True)

    repo.ensure_dir.assert_called_with(missing_dir)
    # After fixing, the error should still be reported but as a warning
    # (or the report notes the fix). The report itself reflects the initial state
    # but the fix was applied.
    assert repo.ensure_dir.call_count >= 1
