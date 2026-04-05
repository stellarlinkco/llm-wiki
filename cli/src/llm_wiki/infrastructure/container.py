"""Composition root — wires ports to adapters.

This is the single place where infrastructure meets domain.
"""

from dataclasses import dataclass
from pathlib import Path

from llm_wiki.domain.models import WikiProject
from llm_wiki.domain.ports import DocumentParser, PageRepository, SearchEngine
from llm_wiki.infrastructure.filesystem import LocalFileSystem
from llm_wiki.infrastructure.markitdown_parser import MarkItDownParser
from llm_wiki.infrastructure.bm25_search import BM25Search
from llm_wiki.application.init_project import InitProject
from llm_wiki.application.parse_document import ParseDocument
from llm_wiki.application.validate_wiki import ValidateWiki
from llm_wiki.application.build_index import BuildIndex
from llm_wiki.application.search_wiki import SearchWiki
from llm_wiki.application.list_pages import ListPages
from llm_wiki.application.get_status import GetStatus


@dataclass
class Container:
    """Holds all wired use cases ready for CLI consumption."""

    repo: PageRepository
    parser: DocumentParser
    search_engine: SearchEngine

    def init_project(self, root: Path, name: str, description: str) -> InitProject:
        return InitProject(root=root, name=name, description=description, repo=self.repo)

    def parse_document(self, project: WikiProject) -> ParseDocument:
        return ParseDocument(project=project, parser=self.parser, repo=self.repo)

    def validate_wiki(self, project: WikiProject) -> ValidateWiki:
        return ValidateWiki(project=project, repo=self.repo)

    def build_index(self, project: WikiProject) -> BuildIndex:
        return BuildIndex(project=project, repo=self.repo, search_engine=self.search_engine)

    def search_wiki(self, project: WikiProject) -> SearchWiki:
        return SearchWiki(project=project, search_engine=self.search_engine)

    def list_pages(self, project: WikiProject) -> ListPages:
        return ListPages(project=project, repo=self.repo)

    def get_status(self, project: WikiProject) -> GetStatus:
        return GetStatus(project=project, repo=self.repo)


def create_container() -> Container:
    """Create the default container with real adapters."""
    return Container(
        repo=LocalFileSystem(),
        parser=MarkItDownParser(),
        search_engine=BM25Search(),
    )
