"""Domain ports — driven interfaces (ABC). Zero external dependencies.

These define WHAT the domain needs, not HOW it's done.
Infrastructure adapters implement these interfaces.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from .models import ParsedDocument, SearchResult, SourceFile, WikiPage


class DocumentParser(ABC):
    """Port for converting source files to markdown."""

    @abstractmethod
    def parse(self, source: SourceFile) -> ParsedDocument:
        """Convert a source file to a parsed markdown document."""
        ...

    @abstractmethod
    def supported_formats(self) -> list[str]:
        """Return list of supported file extensions (without dot)."""
        ...


class PageRepository(ABC):
    """Port for reading/writing wiki pages and files."""

    @abstractmethod
    def list_pages(self, directory: Path) -> list[WikiPage]:
        """List all .md files in directory with parsed metadata."""
        ...

    @abstractmethod
    def read_content(self, path: Path) -> str:
        """Read the raw content of a file."""
        ...

    @abstractmethod
    def write_content(self, path: Path, content: str) -> None:
        """Write content to a file, creating parent dirs if needed."""
        ...

    @abstractmethod
    def exists(self, path: Path) -> bool:
        """Check if a file or directory exists."""
        ...

    @abstractmethod
    def ensure_dir(self, path: Path) -> None:
        """Create directory (and parents) if it doesn't exist."""
        ...

    @abstractmethod
    def list_files(self, directory: Path, pattern: str = "*.md") -> list[Path]:
        """List files matching a glob pattern in a directory (recursive)."""
        ...


class SearchEngine(ABC):
    """Port for full-text search over wiki content."""

    @abstractmethod
    def build_index(self, documents: list[tuple[str, str, str]]) -> None:
        """Build index from (path, title, content) tuples."""
        ...

    @abstractmethod
    def search(self, query: str, limit: int = 10) -> list[SearchResult]:
        """Search the index, return ranked results with snippets."""
        ...

    @abstractmethod
    def save_index(self, path: Path) -> None:
        """Persist the index to disk as JSON."""
        ...

    @abstractmethod
    def load_index(self, path: Path) -> None:
        """Load the index from a JSON file on disk."""
        ...
