"""Architecture test: domain layer must have ZERO external imports.

Only stdlib modules are allowed in domain/.
This test scans all .py files in the domain directory and checks imports.
"""

import ast
from pathlib import Path

DOMAIN_DIR = Path(__file__).resolve().parents[2] / "src" / "llm_wiki" / "domain"

ALLOWED_STDLIB = {
    "__future__",
    "abc",
    "dataclasses",
    "enum",
    "pathlib",
    "typing",
    "datetime",
    "collections",
    "re",
}

ALLOWED_INTERNAL_PREFIX = "."  # relative imports within domain


def _extract_imports(filepath: Path) -> list[tuple[str, int]]:
    """Extract all import module names and line numbers from a Python file."""
    source = filepath.read_text()
    tree = ast.parse(source, filename=str(filepath))
    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append((alias.name, node.lineno))
        elif isinstance(node, ast.ImportFrom):
            if node.module and node.level == 0:  # absolute import
                imports.append((node.module, node.lineno))
            # level > 0 means relative import (within domain) — allowed
    return imports


def test_domain_has_zero_external_imports():
    """Domain layer must not import any external package."""
    violations = []

    py_files = list(DOMAIN_DIR.glob("**/*.py"))
    assert len(py_files) >= 3, f"Expected at least 3 .py files in domain/, found {len(py_files)}"

    for filepath in py_files:
        for module_name, lineno in _extract_imports(filepath):
            top_level = module_name.split(".")[0]
            if top_level not in ALLOWED_STDLIB:
                violations.append(
                    f"  {filepath.relative_to(DOMAIN_DIR)}:{lineno} "
                    f"imports '{module_name}' (top-level: '{top_level}')"
                )

    assert not violations, (
        f"Domain layer has {len(violations)} forbidden import(s):\n"
        + "\n".join(violations)
        + "\n\nOnly these stdlib modules are allowed: "
        + ", ".join(sorted(ALLOWED_STDLIB))
    )


def test_domain_files_exist():
    """Domain layer must have models.py, ports.py, errors.py."""
    for name in ["models.py", "ports.py", "errors.py", "__init__.py"]:
        assert (DOMAIN_DIR / name).exists(), f"Missing domain/{name}"
