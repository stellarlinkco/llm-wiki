"""Click CLI — driver adapter for llm-wiki.

All human messages go to stderr. All structured output goes to stdout as JSON.
"""

from __future__ import annotations

import json
import sys
from dataclasses import asdict
from pathlib import Path

import click

from llm_wiki.domain.errors import (
    ParseError,
    ProjectAlreadyExistsError,
    SearchIndexNotFoundError,
    WikiNotFoundError,
)
from llm_wiki.domain.models import WikiProject
from llm_wiki.infrastructure.container import create_container


def _find_wiki_root(start: Path) -> Path:
    """Walk up from start to find .llm-wiki/ marker directory."""
    current = start.resolve()
    while True:
        if (current / ".llm-wiki").is_dir():
            return current
        parent = current.parent
        if parent == current:
            raise WikiNotFoundError(
                "No llm-wiki project found. Run 'llm-wiki init' or use --root <path>."
            )
        current = parent


def _get_project(root_override: str | None) -> WikiProject:
    """Resolve wiki root and return WikiProject."""
    if root_override:
        root = Path(root_override).resolve()
    else:
        root = _find_wiki_root(Path.cwd())
    name = root.name
    return WikiProject(root=root, name=name)


def _output_json(data: object) -> None:
    """Write JSON to stdout."""
    click.echo(json.dumps(data, ensure_ascii=False, indent=2, default=str))


def _log(msg: str) -> None:
    """Write human message to stderr."""
    click.echo(msg, err=True)


@click.group()
@click.option("--root", default=None, help="Wiki root directory (auto-discovered if omitted)")
@click.pass_context
def cli(ctx: click.Context, root: str | None) -> None:
    """llm-wiki: CLI tool for building LLM-powered personal knowledge bases."""
    ctx.ensure_object(dict)
    ctx.obj["root"] = root


@cli.command()
@click.argument("path", default=".", type=click.Path())
@click.option("--name", default=None, help="Wiki name (default: directory name)")
@click.option("--description", default="", help="Wiki description")
@click.pass_context
def init(ctx: click.Context, path: str, name: str | None, description: str) -> None:
    """Initialize a new wiki project."""
    root = Path(path).resolve()
    wiki_name = name or root.name
    container = create_container()
    try:
        uc = container.init_project(root=root, name=wiki_name, description=description)
        project = uc.execute()
        _log(f"Wiki '{project.name}' initialized at {project.root}")
        _output_json({
            "wiki_root": str(project.root),
            "name": project.name,
            "status": "initialized",
        })
    except ProjectAlreadyExistsError as e:
        _log(f"Error: {e}")
        sys.exit(1)


@cli.command()
@click.argument("paths", nargs=-1, required=True, type=click.Path(exists=True))
@click.option("--recursive", is_flag=True, help="Process directories recursively")
@click.pass_context
def parse(ctx: click.Context, paths: tuple[str, ...], recursive: bool) -> None:
    """Parse source documents into markdown."""
    try:
        project = _get_project(ctx.obj["root"])
    except WikiNotFoundError as e:
        _log(str(e))
        sys.exit(1)

    container = create_container()
    uc = container.parse_document(project)

    path_list = [Path(p).resolve() for p in paths]
    result = uc.execute(path_list, recursive=recursive)

    _output_json({
        "parsed": result.parsed,
        "failed": result.failed,
        "skipped": result.skipped,
    })

    if result.failed:
        _log(f"Warning: {len(result.failed)} file(s) failed to parse")
        sys.exit(1)


@cli.command()
@click.option("--fix", is_flag=True, help="Auto-fix what can be fixed")
@click.pass_context
def validate(ctx: click.Context, fix: bool) -> None:
    """Validate wiki structural integrity."""
    try:
        project = _get_project(ctx.obj["root"])
    except WikiNotFoundError as e:
        _log(str(e))
        sys.exit(1)

    container = create_container()
    uc = container.validate_wiki(project)
    report = uc.execute(fix=fix)

    _output_json({
        "valid": report.valid,
        "errors": [asdict(e) for e in report.errors],
        "warnings": [asdict(w) for w in report.warnings],
    })

    if not report.valid:
        _log(f"Validation failed: {len(report.errors)} error(s)")
        sys.exit(1)


@cli.command()
@click.pass_context
def index(ctx: click.Context) -> None:
    """Rebuild wiki catalog and search index."""
    try:
        project = _get_project(ctx.obj["root"])
    except WikiNotFoundError as e:
        _log(str(e))
        sys.exit(1)

    container = create_container()
    uc = container.build_index(project)
    result = uc.execute()

    _output_json({
        "catalog_entries": result.catalog_entries,
        "indexed_documents": result.indexed_documents,
        "index_path": result.index_path,
    })
    _log(f"Indexed {result.indexed_documents} documents, {result.catalog_entries} catalog entries")


@cli.command()
@click.argument("query")
@click.option("--limit", default=10, type=int, help="Max results (default: 10)")
@click.option("--type", "page_type", default=None, help="Filter by page type")
@click.option("--raw-only", is_flag=True, help="Search raw/ only")
@click.option("--wiki-only", is_flag=True, help="Search wiki/ only")
@click.pass_context
def search(ctx: click.Context, query: str, limit: int, page_type: str | None, raw_only: bool, wiki_only: bool) -> None:
    """Search wiki content."""
    try:
        project = _get_project(ctx.obj["root"])
    except WikiNotFoundError as e:
        _log(str(e))
        sys.exit(1)

    scope = None
    if raw_only:
        scope = "raw"
    elif wiki_only:
        scope = "wiki"

    container = create_container()
    uc = container.search_wiki(project)
    try:
        results = uc.execute(query=query, limit=limit, page_type=page_type, scope=scope)
        _output_json([asdict(r) for r in results])
    except SearchIndexNotFoundError:
        _log("Search index not found. Run 'llm-wiki index' first.")
        sys.exit(2)


@cli.command("list")
@click.option("--type", "page_type", default=None, help="Filter by page type")
@click.option("--sort", "sort_by", default="title", help="Sort by field (default: title)")
@click.option("--raw", is_flag=True, help="List raw/ files instead of wiki/ pages")
@click.pass_context
def list_pages(ctx: click.Context, page_type: str | None, sort_by: str, raw: bool) -> None:
    """List wiki pages."""
    try:
        project = _get_project(ctx.obj["root"])
    except WikiNotFoundError as e:
        _log(str(e))
        sys.exit(1)

    container = create_container()
    uc = container.list_pages(project)
    pages = uc.execute(page_type=page_type, sort_by=sort_by, raw=raw)

    _output_json([
        {
            "path": str(p.path),
            "title": p.title,
            "type": p.page_type.value if p.page_type else None,
            "created": p.created,
            "updated": p.updated,
            "sources": p.sources,
            "tags": p.tags,
        }
        for p in pages
    ])


@cli.command()
@click.pass_context
def status(ctx: click.Context) -> None:
    """Show wiki status summary."""
    try:
        project = _get_project(ctx.obj["root"])
    except WikiNotFoundError as e:
        _log(str(e))
        sys.exit(1)

    container = create_container()
    uc = container.get_status(project)
    result = uc.execute()

    _output_json(asdict(result))
