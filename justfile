# justfile — unified development entry point.
# Run `just` to see all available commands.

set shell := ["bash", "-cu"]

default:
    @just --list

# === Setup ===

setup:
    cd sdk && npm ci

# === Daily development ===

check: fmt-check lint typecheck test dead-code duplicate-code
    @echo "All checks passed."

check-fast:
    changed=$$(git diff --name-only --diff-filter=ACMR HEAD -- '*.ts' '*.tsx' '*.js' '*.jsx'); \
    if [ -z "$$changed" ]; then echo "no changed source files"; exit 0; fi; \
    cd sdk && npx eslint --max-warnings 0 $$changed && npx prettier --check $$changed

fmt:
    cd sdk && npx prettier --write 'src/**/*.ts' 'test/**/*.js'

fmt-check:
    cd sdk && npx prettier --check 'src/**/*.ts' 'test/**/*.js'

lint:
    cd sdk && npx eslint . --max-warnings 0

typecheck:
    cd sdk && npm run typecheck

# === Tests ===

test:
    cd sdk && npm test

test-coverage:
    cd sdk && npx c8 --reporter=text --reporter=lcov --all --src src node --test test/*.test.js

# === Build ===

build:
    cd sdk && npm run build

# === Hygiene ===

dead-code:
    cd sdk && npx knip --reporter compact

duplicate-code:
    cd sdk && npx jscpd --config ../.jscpd.json

deps-audit:
    cd sdk && npm audit --audit-level=high

# === Guardrails ===

test-guardrails:
    bash scripts/test-guardrails.sh

clean:
    rm -rf sdk/dist sdk/node_modules coverage .run reports
