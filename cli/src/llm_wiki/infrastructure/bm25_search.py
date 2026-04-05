"""BM25 full-text search adapter.

Infrastructure layer — implements SearchEngine port using rank_bm25.
Supports both CJK (Chinese/Japanese/Korean) and Latin text via jieba segmentation.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import jieba
from rank_bm25 import BM25Plus

from llm_wiki.domain.models import SearchResult
from llm_wiki.domain.ports import SearchEngine

# Suppress jieba's loading messages
jieba.setLogLevel(jieba.logging.WARNING)

# Regex to detect CJK characters
_CJK_RE = re.compile(
    r"[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff"
    r"\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]"
)


def _has_cjk(text: str) -> bool:
    """Check if text contains any CJK characters."""
    return bool(_CJK_RE.search(text))


# Common CJK stopwords that pollute BM25 ranking
_CJK_STOPWORDS = frozenset(
    "的 了 在 是 我 有 和 就 不 人 都 一 一个 上 也 很 到 说 要 去 你 会 着 没有 看 好 "
    "自己 这 他 她 它 们 那 里 为 与 及 或 等 把 被 从 对 让 向 但 而 之 以 其 中 可以 "
    "还 个 么 什么 如果 所以 因为 这个 那个 这些 那些".split()
)


class BM25Search(SearchEngine):
    """BM25Plus-backed search engine over wiki documents.

    Uses jieba for CJK text segmentation, whitespace split for Latin text.
    Single-threaded by design — not safe for concurrent use.
    """

    def __init__(self) -> None:
        self._documents: list[dict] = []
        self._bm25: BM25Plus | None = None

    # ── Port implementation ──────────────────────────────────────────

    @staticmethod
    def _tokenize(text: str) -> list[str]:
        """Consistent tokenization for both indexing and querying.

        Uses jieba segmentation for CJK text, whitespace split for Latin.
        Filters CJK stopwords. Strips markdown syntax.
        """
        # Strip markdown noise before tokenizing
        text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)  # links → text
        text = re.sub(r"[*_#`|>]", " ", text)  # markdown chars
        text = re.sub(r"---+", " ", text)  # horizontal rules
        text_lower = text.lower()
        if _has_cjk(text_lower):
            tokens = [w for w in jieba.cut_for_search(text_lower) if w.strip()]
            return [t for t in tokens if t not in _CJK_STOPWORDS and len(t) > 0]
        return text_lower.split()

    def build_index(self, documents: list[tuple[str, str, str]]) -> None:
        """Build index from (path, title, content) tuples.

        Title tokens are prepended to content tokens for title-match boosting.
        """
        self._documents = []
        for path, title, content in documents:
            content_tokens = self._tokenize(content)
            # Boost: prepend title tokens 3x so title matches rank higher
            title_tokens = self._tokenize(title) * 3
            self._documents.append({
                "path": path,
                "title": title,
                "content": content,
                "tokens": title_tokens + content_tokens,
            })
        if self._documents:
            self._bm25 = BM25Plus([doc["tokens"] for doc in self._documents])
        else:
            self._bm25 = None

    def search(self, query: str, limit: int = 10) -> list[SearchResult]:
        """Search the index, return ranked results with snippets."""
        if self._bm25 is None or not self._documents:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        scores = self._bm25.get_scores(query_tokens)

        # Pair each document with its score, filter score > 0, sort descending.
        scored = [
            (i, float(score))
            for i, score in enumerate(scores)
            if score > 0
        ]
        scored.sort(key=lambda x: x[1], reverse=True)
        scored = scored[:limit]

        results: list[SearchResult] = []
        for i, score in scored:
            doc = self._documents[i]
            snippet = self._extract_snippet(doc["content"], query_tokens)
            results.append(
                SearchResult(
                    path=doc["path"],
                    score=score,
                    title=doc["title"],
                    snippet=snippet,
                )
            )
        return results

    def save_index(self, path: Path) -> None:
        """Persist the index to disk as JSON.

        Stores path, title, tokens (for BM25 rebuild) and a short content
        excerpt (for snippet fallback). Full content is NOT stored to keep
        the index compact.
        """
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        compact = [
            {
                "path": doc["path"],
                "title": doc["title"],
                "tokens": doc["tokens"],
                "content": doc.get("content", "")[:2000],  # keep only first 2K chars for snippets
            }
            for doc in self._documents
        ]
        path.write_text(json.dumps(compact, ensure_ascii=False), encoding="utf-8")

    def load_index(self, path: Path) -> None:
        """Load the index from a JSON file on disk."""
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Index file not found: {path}")
        data = json.loads(path.read_text(encoding="utf-8"))
        # Validate schema
        if not isinstance(data, list):
            raise ValueError(f"Invalid index format: expected list, got {type(data).__name__}")
        for i, doc in enumerate(data):
            if not isinstance(doc, dict) or "tokens" not in doc or "path" not in doc:
                raise ValueError(f"Invalid index entry at position {i}: missing required fields")
        self._documents = data
        if self._documents:
            self._bm25 = BM25Plus([doc["tokens"] for doc in self._documents])
        else:
            self._bm25 = None

    # ── Private helpers ──────────────────────────────────────────────

    @staticmethod
    def _extract_snippet(content: str, query_tokens: list[str]) -> str:
        """Extract a snippet containing a query term, max 300 chars.

        Splits on sentence boundaries for both CJK and Latin text.
        """
        # Strip markdown syntax for cleaner snippets
        clean = re.sub(r"^#+\s+.*$", "", content, flags=re.MULTILINE)
        clean = re.sub(r"^\|.*\|$", "", clean, flags=re.MULTILINE)
        clean = re.sub(r"^---+$", "", clean, flags=re.MULTILINE)
        clean = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", clean)  # links → text
        clean = re.sub(r"\*\*(.+?)\*\*", r"\1", clean)  # bold → text
        clean = re.sub(r"\*(.+?)\*", r"\1", clean)  # italic → text
        clean = re.sub(r"`(.+?)`", r"\1", clean)  # inline code → text
        clean = clean.strip()

        # Split on CJK + Latin sentence boundaries
        sentences = re.split(r"(?<=[。！？.!?])\s*|\n\n+", clean)
        sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 5]

        for sentence in sentences:
            lower = sentence.lower()
            if any(token in lower for token in query_tokens):
                return sentence[:300]

        # Fallback: first non-empty paragraph
        for sentence in sentences:
            if len(sentence) > 10:
                return sentence[:300]
        return clean[:300] if clean else content[:300]
