"""Unit tests for ParseDocument use case."""

from pathlib import Path
from unittest.mock import MagicMock, PropertyMock

import pytest

from llm_wiki.application.parse_document import ParseDocument, ParseResult
from llm_wiki.domain.errors import ParseError
from llm_wiki.domain.models import (
    Frontmatter,
    ParsedDocument,
    SourceFile,
    WikiProject,
)
from llm_wiki.domain.ports import DocumentParser, PageRepository


@pytest.fixture
def mock_parser() -> MagicMock:
    parser = MagicMock(spec=DocumentParser)
    parser.supported_formats.return_value = ["md", "pdf", "txt", "html"]
    return parser


@pytest.fixture
def mock_repo() -> MagicMock:
    repo = MagicMock(spec=PageRepository)
    return repo


@pytest.fixture
def project() -> WikiProject:
    return WikiProject(root=Path("/fake/project"), name="Test Wiki")


def _make_parsed_doc(path: Path, content: str = "Hello world") -> ParsedDocument:
    source = SourceFile.from_path(path)
    return ParsedDocument(
        content=content,
        frontmatter=Frontmatter(
            title=path.stem,
            source_path=str(path),
            format=source.format,
            parsed_at="2026-04-05T00:00:00",
        ),
        source=source,
    )


class TestParseDocumentSingleFile:
    def test_single_file_success(
        self, mock_parser: MagicMock, mock_repo: MagicMock, project: WikiProject
    ) -> None:
        file_path = Path("/data/notes.md")
        parsed = _make_parsed_doc(file_path)
        mock_parser.parse.return_value = parsed
        mock_repo.exists.return_value = False  # it's a file, not a dir

        uc = ParseDocument(project=project, parser=mock_parser, repo=mock_repo)
        result = uc.execute([file_path])

        assert isinstance(result, ParseResult)
        assert str(file_path) in result.parsed
        assert len(result.failed) == 0
        assert len(result.skipped) == 0

    def test_single_file_writes_to_raw_dir(
        self, mock_parser: MagicMock, mock_repo: MagicMock, project: WikiProject
    ) -> None:
        file_path = Path("/data/notes.md")
        parsed = _make_parsed_doc(file_path)
        mock_parser.parse.return_value = parsed
        mock_repo.exists.return_value = False

        uc = ParseDocument(project=project, parser=mock_parser, repo=mock_repo)
        uc.execute([file_path])

        expected_output = project.raw_dir / "notes.md"
        mock_repo.write_content.assert_called_once()
        actual_path = mock_repo.write_content.call_args[0][0]
        assert actual_path == expected_output

    def test_written_content_has_frontmatter(
        self, mock_parser: MagicMock, mock_repo: MagicMock, project: WikiProject
    ) -> None:
        file_path = Path("/data/notes.md")
        parsed = _make_parsed_doc(file_path, content="Body text here")
        mock_parser.parse.return_value = parsed
        mock_repo.exists.return_value = False

        uc = ParseDocument(project=project, parser=mock_parser, repo=mock_repo)
        uc.execute([file_path])

        written_content = mock_repo.write_content.call_args[0][1]
        assert written_content.startswith("---\n")
        assert "title:" in written_content
        assert "source_path:" in written_content
        assert "format:" in written_content
        assert "parsed_at:" in written_content
        assert "Body text here" in written_content


class TestParseDocumentDirectory:
    def test_batch_directory_processing(
        self, mock_parser: MagicMock, mock_repo: MagicMock, project: WikiProject, tmp_path: Path
    ) -> None:
        dir_path = tmp_path / "docs"
        dir_path.mkdir()
        file_a = dir_path / "a.md"
        file_b = dir_path / "b.txt"
        file_a.touch()
        file_b.touch()

        mock_repo.list_files.return_value = [file_a, file_b]

        mock_parser.parse.side_effect = [
            _make_parsed_doc(file_a, "Content A"),
            _make_parsed_doc(file_b, "Content B"),
        ]

        uc = ParseDocument(project=project, parser=mock_parser, repo=mock_repo)
        result = uc.execute([dir_path])

        assert str(file_a) in result.parsed
        assert str(file_b) in result.parsed
        assert mock_repo.write_content.call_count == 2

    def test_directory_filters_unsupported(
        self, mock_parser: MagicMock, mock_repo: MagicMock, project: WikiProject, tmp_path: Path
    ) -> None:
        dir_path = tmp_path / "docs"
        dir_path.mkdir()
        file_a = dir_path / "a.md"
        file_b = dir_path / "b.xyz"
        file_a.touch()
        file_b.touch()

        mock_repo.list_files.return_value = [file_a, file_b]

        mock_parser.parse.return_value = _make_parsed_doc(file_a, "Content A")

        uc = ParseDocument(project=project, parser=mock_parser, repo=mock_repo)
        result = uc.execute([dir_path])

        assert str(file_a) in result.parsed
        assert str(file_b) in result.skipped


class TestParseDocumentFailure:
    def test_parse_failure_added_to_failed(
        self, mock_parser: MagicMock, mock_repo: MagicMock, project: WikiProject
    ) -> None:
        file_path = Path("/data/corrupt.pdf")
        mock_parser.parse.side_effect = ParseError("corrupt file")
        mock_repo.exists.return_value = False

        uc = ParseDocument(project=project, parser=mock_parser, repo=mock_repo)
        result = uc.execute([file_path])

        assert str(file_path) in result.failed
        assert len(result.parsed) == 0

    def test_parse_failure_does_not_halt_batch(
        self, mock_parser: MagicMock, mock_repo: MagicMock, project: WikiProject
    ) -> None:
        good_file = Path("/data/good.md")
        bad_file = Path("/data/bad.pdf")

        mock_repo.exists.return_value = False  # both are files
        mock_parser.parse.side_effect = [
            ParseError("bad"),
            _make_parsed_doc(good_file, "OK"),
        ]

        uc = ParseDocument(project=project, parser=mock_parser, repo=mock_repo)
        result = uc.execute([bad_file, good_file])

        assert str(bad_file) in result.failed
        assert str(good_file) in result.parsed


class TestParseDocumentUnsupported:
    def test_unsupported_format_skipped(
        self, mock_parser: MagicMock, mock_repo: MagicMock, project: WikiProject
    ) -> None:
        file_path = Path("/data/image.bmp")
        mock_repo.exists.return_value = False

        uc = ParseDocument(project=project, parser=mock_parser, repo=mock_repo)
        result = uc.execute([file_path])

        assert str(file_path) in result.skipped
        mock_parser.parse.assert_not_called()
