"""Use case: search across wiki content using the search engine port."""

from __future__ import annotations

from llm_wiki.domain.errors import SearchIndexNotFoundError
from llm_wiki.domain.models import SearchResult, WikiProject
from llm_wiki.domain.ports import SearchEngine

# Map page_type names to their directory segment in wiki paths.
_TYPE_DIR_MAP: dict[str, str] = {
    "entity": "/entities/",
    "concept": "/concepts/",
    "source": "/sources/",
    "comparison": "/comparisons/",
    "query": "/queries/",
    "overview": "/overviews/",
}


class SearchWiki:
    """Search the wiki index with optional page-type and scope filters."""

    def __init__(self, project: WikiProject, search_engine: SearchEngine) -> None:
        self._project = project
        self._engine = search_engine

    def execute(
        self,
        query: str,
        limit: int = 10,
        page_type: str | None = None,
        scope: str | None = None,
    ) -> list[SearchResult]:
        # Load index — convert infra errors to domain errors.
        try:
            self._engine.load_index(self._project.search_index_path)
        except (FileNotFoundError, OSError) as exc:
            raise SearchIndexNotFoundError(str(exc)) from exc

        # Fetch more results than needed to allow for filtering.
        fetch_limit = limit * 3 if (page_type or scope) else limit
        raw_results = self._engine.search(query, limit=fetch_limit)

        filtered = raw_results

        # Filter by page_type via path directory segment.
        if page_type is not None:
            dir_segment = _TYPE_DIR_MAP.get(page_type)
            if dir_segment:
                filtered = [r for r in filtered if dir_segment in r.path]
            else:
                filtered = []

        # Filter by scope — match raw/ or wiki/ as path prefix or segment.
        if scope is not None:
            prefix = scope + "/"
            segment = f"/{scope}/"
            filtered = [
                r for r in filtered
                if r.path.startswith(prefix) or segment in r.path
            ]

        # Deduplicate: when raw/ and wiki/sources/ both match the same source,
        # prefer the wiki version (richer content with cross-references).
        seen_stems: dict[str, SearchResult] = {}
        deduped: list[SearchResult] = []
        for r in filtered:
            # Extract filename stem for dedup
            stem = r.path.rsplit("/", 1)[-1].replace(".md", "")
            if stem in seen_stems:
                existing = seen_stems[stem]
                # Keep the wiki version (higher quality) or higher score
                if "/wiki/" in r.path and "/raw/" in existing.path:
                    deduped = [x if x is not existing else r for x in deduped]
                    seen_stems[stem] = r
                # else keep existing
            else:
                seen_stems[stem] = r
                deduped.append(r)

        return deduped[:limit]
