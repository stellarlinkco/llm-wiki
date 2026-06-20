#!/usr/bin/env bash
# .git-hooks/check-naming.sh
# Rejects commits that add files whose names violate code-canonicality rules.
# Wired into pre-commit via .husky/pre-commit.
#
# See AGENTS.md § Code Canonicality.

set -euo pipefail

# Regex source: repo-root `constraints.yaml` (preferred) or fallback defaults (legacy repos).
# - Forbidden suffix patterns: `code_canonicality.forbidden_suffixes.patterns`
# - Scratchpad directories: `code_canonicality.scratchpad_directories.paths`
#
# This hook must run on bare macOS (bash 3.2). Do not add non-default deps (e.g., yq).
DEFAULT_FORBIDDEN_SUFFIX_RE='(_v[0-9]+|_new|_old|_backup|_temp|_copy|_final|_real|_improved|_refactored|_fixed|_legacy|_deprecated|_archive|_save|V[0-9]+|New|Old|Legacy|Deprecated|Backup)(\.|/|$)'
DEFAULT_SCRATCH_DIR_RE='(^|/)(tmp|scratch|backup|_old|deprecated|archive|wip)(/|$)'

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
constraints_file="$repo_root/constraints.yaml"

yaml_get() {
  local path="${1:?yaml path required}"
  local file="${2:?yaml file required}"

  [ -f "$file" ] || return 1

  case "$path" in
    code_canonicality.forbidden_suffixes.patterns)
      sed -n '/^code_canonicality:/,/^size_limits:/p' "$file" \
        | sed -n '/^  forbidden_suffixes:/,/^  scratchpad_directories:/p' \
        | grep -E '^[[:space:]]*-[[:space:]]*' \
        | sed -E "s/^[[:space:]]*-[[:space:]]*//; s/[[:space:]]*$//; s/^[\\\"']//; s/[\\\"']$//"
      ;;
    code_canonicality.scratchpad_directories.paths)
      sed -n '/^code_canonicality:/,/^size_limits:/p' "$file" \
        | sed -n '/^  scratchpad_directories:/,/^size_limits:/p' \
        | grep -m 1 -E '^[[:space:]]*paths:' \
        | sed -E 's/^[[:space:]]*paths:[[:space:]]*//; s/[[:space:]]*$//'
      ;;
    *)
      return 1
      ;;
  esac
}

FORBIDDEN_SUFFIX_RE="$DEFAULT_FORBIDDEN_SUFFIX_RE"
SCRATCH_DIR_RE="$DEFAULT_SCRATCH_DIR_RE"
forbidden_source="fallback"
scratch_source="fallback"

if [ -f "$constraints_file" ]; then
  forbidden_joined=""
  while IFS= read -r pat; do
    [ -z "$pat" ] && continue
    pat="${pat%\$}"
    if [ -z "$forbidden_joined" ]; then
      forbidden_joined="$pat"
    else
      forbidden_joined="$forbidden_joined|$pat"
    fi
  done <<EOF
$(yaml_get 'code_canonicality.forbidden_suffixes.patterns' "$constraints_file" 2>/dev/null || true)
EOF

  if [ -n "$forbidden_joined" ]; then
    FORBIDDEN_SUFFIX_RE="(${forbidden_joined})(\\.|/|$)"
    forbidden_source="constraints.yaml"
  fi

  scratch_paths_line="$(yaml_get 'code_canonicality.scratchpad_directories.paths' "$constraints_file" 2>/dev/null || true)"
  if [ -n "$scratch_paths_line" ]; then
    scratch_cleaned="$(printf '%s' "$scratch_paths_line" | sed -E "s/^[[:space:]]*\\[//; s/\\][[:space:]]*$//; s/[\\\"']//g; s/,/ /g")"
    scratch_joined=""
    for term in $scratch_cleaned; do
      term="${term#/}"
      term="${term%/}"
      [ -z "$term" ] && continue
      if [ -z "$scratch_joined" ]; then
        scratch_joined="$term"
      else
        scratch_joined="$scratch_joined|$term"
      fi
    done
    if [ -n "$scratch_joined" ]; then
      SCRATCH_DIR_RE="(^|/)(${scratch_joined})(/|$)"
      scratch_source="constraints.yaml"
    fi
  fi
fi

echo "check-naming.sh: FORBIDDEN_SUFFIX_RE source: $forbidden_source" >&2
echo "check-naming.sh: SCRATCH_DIR_RE source:    $scratch_source" >&2

# Path-argument mode (agent write-time check): validate one path directly
if [ "$#" -gt 0 ]; then
  f="$1"
  if [[ "$f" =~ $FORBIDDEN_SUFFIX_RE ]] || [[ "$f" =~ $SCRATCH_DIR_RE ]]; then
    echo "naming violation (write-time): $f — see AGENTS.md § Code Canonicality" >&2
    exit 2
  fi
  exit 0
fi

# Read added or renamed files (cached).
violations=()
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  if [[ "$f" =~ $FORBIDDEN_SUFFIX_RE ]]; then
    violations+=("  forbidden naming suffix: $f")
  fi
  if [[ "$f" =~ $SCRATCH_DIR_RE ]]; then
    violations+=("  scratchpad directory:    $f")
  fi
done < <(git diff --cached --name-only --diff-filter=AR 2>/dev/null || true)

if [ "${#violations[@]}" -gt 0 ]; then
  cat <<EOF
Code canonicality violation — these path(s) cannot be committed:

$(printf '%s\n' "${violations[@]}")

Why: parallel versions (_v1, _v2, _new), placeholder names (_temp, _copy), and
scratchpad directories cause the codebase to bloat with duplicate logic.

What to do:
  - If you are refactoring: rename the new file over the old one and let git track the change in history.
  - If this is genuinely a separate concept: rename to something descriptive (no suffix).
  - If this is throwaway exploration: keep it outside the repo (e.g., /tmp).

See AGENTS.md § Code Canonicality for the full rule.
EOF
  exit 1
fi

exit 0
