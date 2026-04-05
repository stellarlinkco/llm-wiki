#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
CLI_DIR="$PROJECT_ROOT/cli"

# Create CLI project structure if missing
mkdir -p "$CLI_DIR/src/llm_wiki/"{domain,application,infrastructure}
mkdir -p "$CLI_DIR/tests/"{unit,integration}

# Create __init__.py files if missing
for dir in "$CLI_DIR/src/llm_wiki" "$CLI_DIR/src/llm_wiki/domain" "$CLI_DIR/src/llm_wiki/application" "$CLI_DIR/src/llm_wiki/infrastructure" "$CLI_DIR/tests" "$CLI_DIR/tests/unit" "$CLI_DIR/tests/integration"; do
    touch "$dir/__init__.py"
done

# Install in editable mode if pyproject.toml exists
if [ -f "$CLI_DIR/pyproject.toml" ]; then
    cd "$CLI_DIR"
    pip install -e ".[dev]" 2>/dev/null || uv pip install -e ".[dev]" 2>/dev/null || echo "WARN: Could not install. Run 'pip install -e .[dev]' manually from cli/"
fi

# Verify
cd "$CLI_DIR"
python -c "import llm_wiki; print(f'llm-wiki v{llm_wiki.__version__} ready')" 2>/dev/null || echo "WARN: llm_wiki not yet importable (expected during M1-T1)"

echo "Environment ready"
