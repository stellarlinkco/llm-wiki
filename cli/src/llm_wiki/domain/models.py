"""Domain models — value objects, enums, aggregate root.

This module has ZERO external dependencies. Only stdlib imports allowed.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Optional


class PageType(str, Enum):
    ENTITY = "entity"
    CONCEPT = "concept"
    SOURCE = "source"
    COMPARISON = "comparison"
    QUERY = "query"
    OVERVIEW = "overview"


@dataclass(frozen=True)
class SourceFile:
    path: Path
    format: str

    @staticmethod
    def from_path(path: Path) -> SourceFile:
        return SourceFile(path=path, format=path.suffix.lstrip(".").lower())


@dataclass(frozen=True)
class Frontmatter:
    title: str
    source_path: str
    format: str
    parsed_at: str


@dataclass(frozen=True)
class ParsedDocument:
    content: str
    frontmatter: Frontmatter
    source: SourceFile


@dataclass(frozen=True)
class WikiPage:
    path: Path
    title: str
    page_type: Optional[PageType]
    created: Optional[str]
    updated: Optional[str]
    sources: tuple[str, ...]
    tags: tuple[str, ...]
    word_count: int


@dataclass(frozen=True)
class WikiProject:
    root: Path
    name: str

    def __post_init__(self) -> None:
        if not self.name or not self.name.strip():
            object.__setattr__(self, "name", str(self.root.name))

    @property
    def raw_dir(self) -> Path:
        return self.root / "raw"

    @property
    def wiki_dir(self) -> Path:
        return self.root / "wiki"

    @property
    def index_path(self) -> Path:
        return self.wiki_dir / "index.md"

    @property
    def log_path(self) -> Path:
        return self.wiki_dir / "log.md"

    @property
    def search_index_path(self) -> Path:
        return self.root / ".llm-wiki" / "search-index.json"

    @property
    def schema_path(self) -> Path:
        return self.root / "CLAUDE.md"

    @property
    def marker_dir(self) -> Path:
        return self.root / ".llm-wiki"

    @property
    def required_dirs(self) -> list[Path]:
        return [
            self.root / "raw",
            self.root / "raw" / "assets",
            self.root / "wiki",
            self.root / "wiki" / "entities",
            self.root / "wiki" / "concepts",
            self.root / "wiki" / "sources",
            self.root / "wiki" / "comparisons",
            self.root / "wiki" / "queries",
            self.root / ".llm-wiki",
        ]


@dataclass(frozen=True)
class SearchResult:
    path: str
    score: float
    title: str
    snippet: str


@dataclass(frozen=True)
class ValidationFinding:
    error_type: str
    file: str
    message: str
    line: Optional[int] = None


@dataclass(frozen=True)
class ValidationReport:
    valid: bool
    errors: tuple[ValidationFinding, ...]
    warnings: tuple[ValidationFinding, ...]


@dataclass(frozen=True)
class WikiStatus:
    wiki_root: str
    raw_documents: int
    wiki_pages: int
    by_type: dict[str, int]  # dict kept for JSON serialization; field is non-reassignable
    total_word_count: int
    last_modified: Optional[str]
    index_stale: bool
    search_index_exists: bool
