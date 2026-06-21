#!/usr/bin/env bash
# scripts/test-guardrails.sh
# Proves every guardrail actually rejects violations.
# Run: just test-guardrails
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

pass=0
fail=0

expect_reject() {
  local label="$1"
  shift
  echo -n "  $label ... "
  if "$@" >/dev/null 2>&1; then
    echo "FAIL (expected rejection, got acceptance)"
    fail=$((fail + 1))
  else
    echo "PASS"
    pass=$((pass + 1))
  fi
}

skip() {
  local label="$1"
  local reason="$2"
  echo "  $label ... SKIP ($reason)"
}

echo "=== guardrail self-test ==="
echo "tmp: $tmp"
echo

# 1. Naming guard — forbidden suffixes.
badfile="$tmp/auth_v2.ts"
touch "$badfile"
expect_reject "naming guard (_v2 file)" bash "$repo_root/.git-hooks/check-naming.sh" "$badfile"

badfile2="$tmp/UserNew.ts"
touch "$badfile2"
expect_reject "naming guard (New suffix)" bash "$repo_root/.git-hooks/check-naming.sh" "$badfile2"

# 2. Scratchpad directory guard.
scratchfile="$tmp/tmp/test.ts"
mkdir -p "$(dirname "$scratchfile")"
touch "$scratchfile"
expect_reject "scratchpad guard (tmp/ dir)" bash "$repo_root/.git-hooks/check-naming.sh" "$scratchfile"

# 3. Naming guard — allowed file should pass.
goodfile="$tmp/auth-provider.ts"
touch "$goodfile"
echo -n "  naming guard (valid file) ... "
if bash "$repo_root/.git-hooks/check-naming.sh" "$goodfile" >/dev/null 2>&1; then
  echo "PASS"; pass=$((pass + 1))
else
  echo "FAIL (rejected valid file)"; fail=$((fail + 1))
fi

# 4. Commit-message guard — non-conventional message.
badmsg="$tmp/badmsg"
echo "bad message" > "$badmsg"
if [ -f "$repo_root/commitlint.config.js" ]; then
  expect_reject "commit-msg guard (\"bad message\")" \
    sh -c "cd '$repo_root' && npx --no-install commitlint --edit '$badmsg'"
else
  skip "commit-msg guard" "no commitlint config found"
fi

# 5. CI layer4 — file/complexity audit must target src/, not test files.
echo -n "  CI file size audit scopes to src ... "
if grep -q "eslint src" "$repo_root/.github/workflows/ci.yml"; then
  echo "PASS"; pass=$((pass + 1))
else
  echo "FAIL (expected 'eslint src' in ci.yml layer4 audit)"
  fail=$((fail + 1))
fi

echo
echo "guardrail self-test: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
