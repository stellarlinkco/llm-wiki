"""ParseDocument use case — ingest source files into the raw directory."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from llm_wiki.domain.errors import ParseError
from llm_wiki.domain.models import ParsedDocument, SourceFile, WikiProject
from llm_wiki.domain.ports import DocumentParser, PageRepository


@dataclass
class ParseResult:
    """Outcome of a batch parse operation."""

    parsed: list[str] = field(default_factory=list)
    failed: list[str] = field(default_factory=list)
    skipped: list[str] = field(default_factory=list)


class ParseDocument:
    """Parse source files and write them to the project raw directory."""

    def __init__(
        self,
        project: WikiProject,
        parser: DocumentParser,
        repo: PageRepository,
    ) -> None:
        self._project = project
        self._parser = parser
        self._repo = repo

    def execute(self, paths: list[Path], recursive: bool = False) -> ParseResult:
        result = ParseResult()
        supported = set(self._parser.supported_formats())

        for path in paths:
            if path.is_dir():
                if recursive:
                    files = self._repo.list_files(path, pattern="*")
                else:
                    files = sorted(f for f in path.iterdir() if f.is_file())
                for f in files:
                    if f.is_file():
                        self._process_file(f, supported, result)
            else:
                self._process_file(path, supported, result)

        return result

    def _process_file(
        self, path: Path, supported: set[str], result: ParseResult
    ) -> None:
        source = SourceFile.from_path(path)

        if source.format not in supported:
            result.skipped.append(str(path))
            return

        try:
            doc = self._parser.parse(source)
        except ParseError:
            result.failed.append(str(path))
            return

        content = self._serialize(doc)
        output_path = self._project.raw_dir / (path.stem + ".md")
        self._repo.write_content(output_path, content)
        result.parsed.append(str(path))

    @staticmethod
    def _yaml_escape(value: str) -> str:
        """Escape a YAML string value if it contains special characters."""
        if any(c in value for c in (':', '{', '}', '[', ']', '"', "'", '\n', '#', '&', '*', '!', '|', '>')):
            escaped = value.replace('\\', '\\\\').replace('"', '\\"')
            return f'"{escaped}"'
        return value

    def _serialize(self, doc: ParsedDocument) -> str:
        fm = doc.frontmatter
        lines = [
            "---",
            f"title: {self._yaml_escape(fm.title)}",
            f"source_path: {self._yaml_escape(fm.source_path)}",
            f"format: {fm.format}",
            f"parsed_at: {fm.parsed_at}",
            "---",
            "",
            doc.content,
        ]
        return "\n".join(lines)
