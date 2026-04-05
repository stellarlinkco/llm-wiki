"""ValidateWiki use case — checks project structure, frontmatter, and links."""

from __future__ import annotations

import re
from pathlib import Path

from llm_wiki.domain.models import ValidationFinding, ValidationReport, WikiProject
from llm_wiki.domain.ports import PageRepository

_LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


class ValidateWiki:
    """Validate a wiki project's structure, frontmatter, and internal links."""

    def __init__(self, project: WikiProject, repo: PageRepository) -> None:
        self._project = project
        self._repo = repo

    def execute(self, fix: bool = False) -> ValidationReport:
        errors: list[ValidationFinding] = []
        warnings: list[ValidationFinding] = []

        self._check_dirs(errors, warnings, fix)
        self._check_files(errors, self._project.wiki_dir, require_type=True)
        self._check_files(errors, self._project.raw_dir, require_type=False)

        return ValidationReport(
            valid=len(errors) == 0,
            errors=tuple(errors),
            warnings=tuple(warnings),
        )

    # -- private helpers --------------------------------------------------

    def _check_dirs(
        self,
        errors: list[ValidationFinding],
        warnings: list[ValidationFinding],
        fix: bool,
    ) -> None:
        for d in self._project.required_dirs:
            if not self._repo.exists(d):
                if fix:
                    self._repo.ensure_dir(d)
                    warnings.append(
                        ValidationFinding(
                            error_type="missing_directory",
                            file=str(d),
                            message=f"Created missing directory: {d}",
                        )
                    )
                else:
                    errors.append(
                        ValidationFinding(
                            error_type="missing_directory",
                            file=str(d),
                            message=f"Required directory missing: {d}",
                        )
                    )

    def _check_files(
        self,
        errors: list[ValidationFinding],
        directory: Path,
        *,
        require_type: bool,
    ) -> None:
        files = self._repo.list_files(directory)
        for fpath in files:
            content = self._repo.read_content(fpath)
            self._check_frontmatter(errors, fpath, content, require_type=require_type)
            self._check_links(errors, fpath, content)

    @staticmethod
    def _normalize_newlines(content: str) -> str:
        """Normalize CRLF to LF for consistent frontmatter detection."""
        return content.replace("\r\n", "\n").replace("\r", "\n")

    def _check_frontmatter(
        self,
        errors: list[ValidationFinding],
        fpath: Path,
        content: str,
        *,
        require_type: bool,
    ) -> None:
        content = self._normalize_newlines(content)
        if not content.startswith("---\n"):
            errors.append(
                ValidationFinding(
                    error_type="missing_frontmatter",
                    file=str(fpath),
                    message="File has no YAML frontmatter block",
                )
            )
            return

        second = content.find("---\n", 4)
        if second == -1:
            errors.append(
                ValidationFinding(
                    error_type="missing_frontmatter",
                    file=str(fpath),
                    message="Frontmatter block not closed (missing second ---)",
                )
            )
            return

        block = content[4:second]

        if "title:" not in block:
            errors.append(
                ValidationFinding(
                    error_type="missing_field",
                    file=str(fpath),
                    message="Frontmatter missing required field: title",
                )
            )

        if require_type and "type:" not in block:
            errors.append(
                ValidationFinding(
                    error_type="missing_field",
                    file=str(fpath),
                    message="Frontmatter missing required field: type",
                )
            )

    def _check_links(
        self,
        errors: list[ValidationFinding],
        fpath: Path,
        content: str,
    ) -> None:
        for _text, target in _LINK_RE.findall(content):
            if target.startswith("http://") or target.startswith("https://"):
                continue
            # Strip anchor fragments before resolving
            target_path = target.split("#")[0]
            if not target_path:
                continue  # pure anchor link like #section
            resolved = fpath.parent / target_path
            if not self._repo.exists(resolved):
                errors.append(
                    ValidationFinding(
                        error_type="dead_link",
                        file=str(fpath),
                        message=f"Dead link: [{_text}]({target}) — target not found",
                    )
                )
