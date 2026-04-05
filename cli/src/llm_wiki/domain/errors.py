"""Domain errors. Zero external dependencies."""


class WikiNotFoundError(Exception):
    """Raised when no wiki project is found."""


class ParseError(Exception):
    """Raised when document parsing fails."""


class SearchIndexNotFoundError(Exception):
    """Raised when the search index does not exist."""


class ProjectAlreadyExistsError(Exception):
    """Raised when trying to init a project that already exists."""
