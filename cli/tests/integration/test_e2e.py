"""End-to-end smoke test: full demo flow via CLI runner."""

import json
import re
from pathlib import Path

import pytest
from click.testing import CliRunner

from llm_wiki.infrastructure.cli import cli


@pytest.fixture
def runner():
    return CliRunner()


@pytest.fixture
def wiki_dir(tmp_path):
    """Return a tmp directory path for the wiki."""
    return tmp_path / "test-wiki"


def extract_json(output: str):
    """Extract JSON from mixed stdout+stderr output.

    Click CliRunner may mix stderr into output. We find the JSON portion.
    """
    # Try parsing the whole output first
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        pass
    # Find JSON object or array in output
    for match in re.finditer(r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\])', output, re.DOTALL):
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            continue
    # Last resort: find lines that look like JSON
    lines = output.strip().split('\n')
    json_lines = []
    in_json = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('{') or stripped.startswith('['):
            in_json = True
        if in_json:
            json_lines.append(line)
        if in_json and (stripped.endswith('}') or stripped.endswith(']')):
            try:
                return json.loads('\n'.join(json_lines))
            except json.JSONDecodeError:
                continue
    raise ValueError(f"No valid JSON found in output:\n{output}")


class TestInitCommand:
    def test_init_creates_project(self, runner, wiki_dir):
        result = runner.invoke(cli, ["init", str(wiki_dir), "--name", "Test Wiki"])
        assert result.exit_code == 0, f"output: {result.output}"
        data = extract_json(result.output)
        assert data["name"] == "Test Wiki"
        assert data["status"] == "initialized"
        assert (wiki_dir / ".llm-wiki").is_dir()
        assert (wiki_dir / "CLAUDE.md").exists()
        assert (wiki_dir / "wiki" / "index.md").exists()
        assert (wiki_dir / "wiki" / "log.md").exists()

    def test_init_already_exists(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        result = runner.invoke(cli, ["init", str(wiki_dir)])
        assert result.exit_code == 1
        assert "already exists" in result.output.lower()


class TestParseCommand:
    def test_parse_txt_file(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        source = wiki_dir / "sample.txt"
        source.write_text("Hello world. This is a test document.")
        result = runner.invoke(cli, ["--root", str(wiki_dir), "parse", str(source)])
        assert result.exit_code == 0, f"output: {result.output}"
        data = extract_json(result.output)
        assert len(data["parsed"]) == 1
        assert len(data["failed"]) == 0
        raw_files = list((wiki_dir / "raw").glob("*.md"))
        assert len(raw_files) == 1

    def test_parse_html_file(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        source = wiki_dir / "page.html"
        source.write_text("<html><body><h1>Title</h1><p>Content here.</p></body></html>")
        result = runner.invoke(cli, ["--root", str(wiki_dir), "parse", str(source)])
        assert result.exit_code == 0, f"output: {result.output}"
        data = extract_json(result.output)
        assert len(data["parsed"]) == 1


class TestIndexCommand:
    def test_index_empty_wiki(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        result = runner.invoke(cli, ["--root", str(wiki_dir), "index"])
        assert result.exit_code == 0, f"output: {result.output}"
        data = extract_json(result.output)
        assert "catalog_entries" in data
        assert "indexed_documents" in data

    def test_index_after_parse(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        source = wiki_dir / "doc.txt"
        source.write_text("Attention mechanism is key to transformers.")
        runner.invoke(cli, ["--root", str(wiki_dir), "parse", str(source)])
        result = runner.invoke(cli, ["--root", str(wiki_dir), "index"])
        assert result.exit_code == 0
        data = extract_json(result.output)
        assert data["indexed_documents"] >= 1


class TestSearchCommand:
    def test_search_no_index(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        result = runner.invoke(cli, ["--root", str(wiki_dir), "search", "test"])
        assert result.exit_code == 2
        assert "index" in result.output.lower()

    def test_search_after_index(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        source = wiki_dir / "transformer.txt"
        source.write_text("The transformer architecture uses self-attention mechanisms.")
        runner.invoke(cli, ["--root", str(wiki_dir), "parse", str(source)])
        runner.invoke(cli, ["--root", str(wiki_dir), "index"])
        result = runner.invoke(cli, ["--root", str(wiki_dir), "search", "transformer"])
        assert result.exit_code == 0, f"output: {result.output}"
        data = extract_json(result.output)
        assert isinstance(data, list)

    def test_search_with_limit(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        source = wiki_dir / "doc.txt"
        source.write_text("Machine learning and deep learning.")
        runner.invoke(cli, ["--root", str(wiki_dir), "parse", str(source)])
        runner.invoke(cli, ["--root", str(wiki_dir), "index"])
        result = runner.invoke(cli, ["--root", str(wiki_dir), "search", "learning", "--limit", "1"])
        assert result.exit_code == 0
        data = extract_json(result.output)
        assert len(data) <= 1


class TestValidateCommand:
    def test_validate_fresh_project(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        result = runner.invoke(cli, ["--root", str(wiki_dir), "validate"])
        assert result.exit_code == 0, f"output: {result.output}"
        data = extract_json(result.output)
        assert "valid" in data


class TestListCommand:
    def test_list_empty_wiki(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        result = runner.invoke(cli, ["--root", str(wiki_dir), "list"])
        assert result.exit_code == 0, f"output: {result.output}"
        data = extract_json(result.output)
        assert isinstance(data, list)

    def test_list_raw_after_parse(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        source = wiki_dir / "doc.txt"
        source.write_text("Content")
        runner.invoke(cli, ["--root", str(wiki_dir), "parse", str(source)])
        result = runner.invoke(cli, ["--root", str(wiki_dir), "list", "--raw"])
        assert result.exit_code == 0
        data = extract_json(result.output)
        assert len(data) >= 1


class TestStatusCommand:
    def test_status_empty(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        result = runner.invoke(cli, ["--root", str(wiki_dir), "status"])
        assert result.exit_code == 0, f"output: {result.output}"
        data = extract_json(result.output)
        assert "wiki_root" in data
        assert "raw_documents" in data
        assert "wiki_pages" in data
        assert "by_type" in data
        assert "index_stale" in data

    def test_status_after_parse(self, runner, wiki_dir):
        runner.invoke(cli, ["init", str(wiki_dir)])
        source = wiki_dir / "doc.txt"
        source.write_text("Some words here for counting")
        runner.invoke(cli, ["--root", str(wiki_dir), "parse", str(source)])
        result = runner.invoke(cli, ["--root", str(wiki_dir), "status"])
        assert result.exit_code == 0
        data = extract_json(result.output)
        assert data["raw_documents"] >= 1


class TestFullDemoFlow:
    """E2E: the exact demo flow from the spec."""

    def test_full_flow(self, runner, wiki_dir):
        # Step 1: Init
        r = runner.invoke(cli, ["init", str(wiki_dir), "--name", "Research Wiki"])
        assert r.exit_code == 0, f"init failed: {r.output}"

        # Step 2: Create a source file
        source = wiki_dir / "paper.txt"
        source.write_text(
            "# Attention Is All You Need\n\n"
            "The dominant sequence transduction models are based on complex "
            "recurrent or convolutional neural networks. The best performing models "
            "also connect the encoder and decoder through an attention mechanism. "
            "We propose a new simple network architecture, the Transformer, "
            "based solely on attention mechanisms."
        )

        # Step 3: Parse
        r = runner.invoke(cli, ["--root", str(wiki_dir), "parse", str(source)])
        assert r.exit_code == 0, f"parse failed: {r.output}"
        parse_data = extract_json(r.output)
        assert len(parse_data["parsed"]) == 1

        # Step 4: Index
        r = runner.invoke(cli, ["--root", str(wiki_dir), "index"])
        assert r.exit_code == 0, f"index failed: {r.output}"
        index_data = extract_json(r.output)
        assert index_data["indexed_documents"] >= 1

        # Step 5: Search
        r = runner.invoke(cli, ["--root", str(wiki_dir), "search", "attention"])
        assert r.exit_code == 0, f"search failed: {r.output}"
        search_data = extract_json(r.output)
        assert isinstance(search_data, list)
        assert len(search_data) >= 1

        # Step 6: Validate
        r = runner.invoke(cli, ["--root", str(wiki_dir), "validate"])
        assert r.exit_code == 0, f"validate failed: {r.output}"
        validate_data = extract_json(r.output)
        assert "valid" in validate_data

        # Step 7: List
        r = runner.invoke(cli, ["--root", str(wiki_dir), "list", "--raw"])
        assert r.exit_code == 0, f"list failed: {r.output}"
        list_data = extract_json(r.output)
        assert len(list_data) >= 1

        # Step 8: Status
        r = runner.invoke(cli, ["--root", str(wiki_dir), "status"])
        assert r.exit_code == 0, f"status failed: {r.output}"
        status_data = extract_json(r.output)
        assert status_data["raw_documents"] >= 1
