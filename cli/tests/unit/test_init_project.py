"""Unit tests for InitProject use case."""

from pathlib import Path
from unittest.mock import MagicMock, call

import pytest

from llm_wiki.application.init_project import InitProject
from llm_wiki.domain.errors import ProjectAlreadyExistsError
from llm_wiki.domain.models import WikiProject
from llm_wiki.domain.ports import PageRepository


@pytest.fixture
def mock_repo() -> MagicMock:
    repo = MagicMock(spec=PageRepository)
    repo.exists.return_value = False
    return repo


@pytest.fixture
def root() -> Path:
    return Path("/fake/project")


class TestInitProjectHappyPath:
    def test_returns_wiki_project(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="My Wiki", description="A test wiki", repo=mock_repo)
        project = uc.execute()

        assert isinstance(project, WikiProject)
        assert project.root == root
        assert project.name == "My Wiki"

    def test_checks_marker_dir_existence(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="My Wiki", description="A test wiki", repo=mock_repo)
        uc.execute()

        mock_repo.exists.assert_called_once_with(root / ".llm-wiki")

    def test_creates_all_required_dirs(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="My Wiki", description="A test wiki", repo=mock_repo)
        project = uc.execute()

        expected_dirs = project.required_dirs
        ensure_dir_calls = [c[0][0] for c in mock_repo.ensure_dir.call_args_list]
        for d in expected_dirs:
            assert d in ensure_dir_calls, f"Missing ensure_dir call for {d}"

    def test_writes_claude_md(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="My Wiki", description="A test wiki", repo=mock_repo)
        uc.execute()

        write_calls = {c[0][0]: c[0][1] for c in mock_repo.write_content.call_args_list}
        claude_md_path = root / "CLAUDE.md"
        assert claude_md_path in write_calls

    def test_writes_index_md(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="My Wiki", description="A test wiki", repo=mock_repo)
        uc.execute()

        write_calls = {c[0][0]: c[0][1] for c in mock_repo.write_content.call_args_list}
        assert root / "wiki" / "index.md" in write_calls

    def test_writes_log_md(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="My Wiki", description="A test wiki", repo=mock_repo)
        uc.execute()

        write_calls = {c[0][0]: c[0][1] for c in mock_repo.write_content.call_args_list}
        assert root / "wiki" / "log.md" in write_calls

    def test_writes_overview_md(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="My Wiki", description="A test wiki", repo=mock_repo)
        uc.execute()

        write_calls = {c[0][0]: c[0][1] for c in mock_repo.write_content.call_args_list}
        assert root / "wiki" / "overview.md" in write_calls

    def test_four_files_written(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="My Wiki", description="A test wiki", repo=mock_repo)
        uc.execute()

        assert mock_repo.write_content.call_count == 4


class TestInitProjectAlreadyExists:
    def test_raises_if_marker_dir_exists(self, mock_repo: MagicMock, root: Path) -> None:
        mock_repo.exists.return_value = True
        uc = InitProject(root=root, name="My Wiki", description="desc", repo=mock_repo)

        with pytest.raises(ProjectAlreadyExistsError):
            uc.execute()

    def test_no_dirs_created_when_exists(self, mock_repo: MagicMock, root: Path) -> None:
        mock_repo.exists.return_value = True
        uc = InitProject(root=root, name="My Wiki", description="desc", repo=mock_repo)

        with pytest.raises(ProjectAlreadyExistsError):
            uc.execute()

        mock_repo.ensure_dir.assert_not_called()

    def test_no_files_written_when_exists(self, mock_repo: MagicMock, root: Path) -> None:
        mock_repo.exists.return_value = True
        uc = InitProject(root=root, name="My Wiki", description="desc", repo=mock_repo)

        with pytest.raises(ProjectAlreadyExistsError):
            uc.execute()

        mock_repo.write_content.assert_not_called()


class TestInitProjectContent:
    def test_name_in_claude_md(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="Alpha Wiki", description="desc", repo=mock_repo)
        uc.execute()

        write_calls = {c[0][0]: c[0][1] for c in mock_repo.write_content.call_args_list}
        claude_content = write_calls[root / "CLAUDE.md"]
        assert "Alpha Wiki" in claude_content

    def test_description_in_claude_md(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="Wiki", description="Knowledge base for AI", repo=mock_repo)
        uc.execute()

        write_calls = {c[0][0]: c[0][1] for c in mock_repo.write_content.call_args_list}
        claude_content = write_calls[root / "CLAUDE.md"]
        assert "Knowledge base for AI" in claude_content

    def test_index_has_catalog_structure(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="Wiki", description="desc", repo=mock_repo)
        uc.execute()

        write_calls = {c[0][0]: c[0][1] for c in mock_repo.write_content.call_args_list}
        index_content = write_calls[root / "wiki" / "index.md"]
        assert "# " in index_content  # has a heading

    def test_log_has_log_structure(self, mock_repo: MagicMock, root: Path) -> None:
        uc = InitProject(root=root, name="Wiki", description="desc", repo=mock_repo)
        uc.execute()

        write_calls = {c[0][0]: c[0][1] for c in mock_repo.write_content.call_args_list}
        log_content = write_calls[root / "wiki" / "log.md"]
        assert "# " in log_content  # has a heading
