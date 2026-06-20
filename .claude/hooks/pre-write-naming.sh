#!/usr/bin/env bash
# .claude/hooks/pre-write-naming.sh
# Claude Code pre-write hook: rejects files with forbidden naming patterns before
# writing them to disk. Delegates to the repo-wide check-naming.sh in path mode.
set -euo pipefail
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
exec bash "$repo_root/.git-hooks/check-naming.sh" "$@"
