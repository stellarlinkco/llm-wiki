"""MarkItDown adapter — converts source files to markdown via markitdown."""

from __future__ import annotations

import re
from datetime import datetime, timezone

from markitdown import MarkItDown

from llm_wiki.domain.errors import ParseError
from llm_wiki.domain.models import Frontmatter, ParsedDocument, SourceFile
from llm_wiki.domain.ports import DocumentParser

_HEADING_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)
_BOLD_TITLE_RE = re.compile(r"\*\*(.+?)\*\*", re.MULTILINE)  # first bold text anywhere

_SUPPORTED_FORMATS: list[str] = [
    "pdf", "docx", "pptx", "xlsx",
    "html", "htm",
    "txt", "csv", "json", "xml",
    "ipynb", "md",
    "zip",
    "jpg", "jpeg", "png", "gif", "webp",
    "wav", "mp3",
]


class MarkItDownParser(DocumentParser):
    """Infrastructure adapter that delegates to the ``markitdown`` library."""

    def __init__(self) -> None:
        self._md = MarkItDown()

    # ── DocumentParser interface ─────────────────────────────────

    def parse(self, source: SourceFile) -> ParsedDocument:
        try:
            result = self._md.convert(str(source.path))
        except Exception as exc:
            raise ParseError(
                f"Failed to parse {source.path}: {exc}"
            ) from exc

        text = result.text_content or ""

        if not text.strip():
            raise ParseError(
                f"No content extracted from {source.path} — file may be empty or unsupported"
            )

        # Title: first H1 heading → first bold line → first non-empty line → filename
        title = source.path.stem
        match = _HEADING_RE.search(text)
        if match:
            title = match.group(1).strip()
            # Strip bold markers from title if present
            title = re.sub(r"\*\*(.+?)\*\*", r"\1", title)
        else:
            bold_match = _BOLD_TITLE_RE.search(text)
            if bold_match:
                candidate = bold_match.group(1).strip()
                # Skip generic prefixes like "一、" "二、"
                if not re.match(r"^[一二三四五六七八九十]+[、.]", candidate):
                    title = candidate
                else:
                    # Try next bold match
                    for m in _BOLD_TITLE_RE.finditer(text):
                        c = m.group(1).strip()
                        if not re.match(r"^[一二三四五六七八九十]+[、.]", c):
                            title = c
                            break
            if title == source.path.stem:
                # Still filename — try first non-empty, non-table line
                for line in text.split("\n"):
                    line = line.strip()
                    if line and not line.startswith("|") and not line.startswith("---"):
                        title = re.sub(r"[*_#`]", "", line).strip()[:100]
                        break

        fm = Frontmatter(
            title=title,
            source_path=str(source.path),
            format=source.format,
            parsed_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        )
        return ParsedDocument(content=text, frontmatter=fm, source=source)

    def supported_formats(self) -> list[str]:
        return list(_SUPPORTED_FORMATS)
