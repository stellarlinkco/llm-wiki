"""Integration tests for BM25Search adapter."""

import json

import pytest

from llm_wiki.domain.models import SearchResult
from llm_wiki.domain.ports import SearchEngine
from llm_wiki.infrastructure.bm25_search import BM25Search


# ── Fixtures ─────────────────────────────────────────────────────────

SAMPLE_DOCS: list[tuple[str, str, str]] = [
    (
        "wiki/entities/python.md",
        "Python Programming",
        "Python is a high-level programming language. It supports multiple paradigms. "
        "Python is widely used in data science and web development.",
    ),
    (
        "wiki/entities/rust.md",
        "Rust Programming",
        "Rust is a systems programming language. It focuses on safety and performance. "
        "Rust prevents data races at compile time.",
    ),
    (
        "wiki/concepts/testing.md",
        "Software Testing",
        "Testing verifies that software works correctly. Unit tests cover individual functions. "
        "Integration tests verify component interactions.",
    ),
]


@pytest.fixture()
def engine() -> BM25Search:
    """Return a BM25Search instance with sample docs indexed."""
    e = BM25Search()
    e.build_index(SAMPLE_DOCS)
    return e


# ── 1. build_index + search returns ranked results ──────────────────

def test_build_index_and_search_returns_ranked_results(engine: BM25Search) -> None:
    results = engine.search("python programming language")
    assert len(results) > 0
    assert all(isinstance(r, SearchResult) for r in results)
    # Results should be sorted by score descending.
    scores = [r.score for r in results]
    assert scores == sorted(scores, reverse=True)


# ── 2. Search existing term → results with score > 0 ────────────────

def test_search_existing_term_has_positive_scores(engine: BM25Search) -> None:
    results = engine.search("rust safety")
    assert len(results) >= 1
    for r in results:
        assert r.score > 0


# ── 3. Search nonexistent term → empty list ──────────────────────────

def test_search_nonexistent_term_returns_empty(engine: BM25Search) -> None:
    results = engine.search("xyznonexistent")
    assert results == []


# ── 4. save_index + load_index round-trip ────────────────────────────

def test_save_load_roundtrip(engine: BM25Search, tmp_path) -> None:
    index_file = tmp_path / "subdir" / "index.json"
    engine.save_index(index_file)
    assert index_file.exists()

    # Load into a fresh instance and verify search still works.
    loaded = BM25Search()
    loaded.load_index(index_file)

    original_results = engine.search("python")
    loaded_results = loaded.search("python")

    assert len(original_results) == len(loaded_results)
    for orig, load in zip(original_results, loaded_results):
        assert orig.path == load.path
        assert orig.title == load.title
        assert abs(orig.score - load.score) < 1e-6


# ── 5. Snippets are extracted (non-empty, max 300 chars) ────────────

def test_snippets_non_empty_and_max_300_chars(engine: BM25Search) -> None:
    results = engine.search("testing")
    assert len(results) >= 1
    for r in results:
        assert len(r.snippet) > 0
        assert len(r.snippet) <= 300


# ── 6. search with limit caps results ───────────────────────────────

def test_search_limit_caps_results(engine: BM25Search) -> None:
    # All three docs mention "programming" or common terms, so query broadly.
    results_all = engine.search("programming language", limit=10)
    results_limited = engine.search("programming language", limit=1)
    assert len(results_limited) <= 1
    # If there are multiple results without limit, the limited version is smaller.
    if len(results_all) > 1:
        assert len(results_limited) < len(results_all)


# ── 7. load_index on nonexistent file → FileNotFoundError ───────────

def test_load_index_nonexistent_raises(tmp_path) -> None:
    engine = BM25Search()
    with pytest.raises(FileNotFoundError):
        engine.load_index(tmp_path / "does_not_exist.json")


# ── Implements SearchEngine ABC ──────────────────────────────────────

def test_bm25search_is_search_engine() -> None:
    assert issubclass(BM25Search, SearchEngine)
