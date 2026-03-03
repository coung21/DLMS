"""Custom exceptions for the DLMS application."""


class DLMSBaseException(Exception):
    """Base exception for all DLMS exceptions."""

    def __init__(self, message: str, code: str | None = None):
        self.message = message
        self.code = code
        super().__init__(message)


# --- Domain Exceptions ---
class EntityNotFoundError(DLMSBaseException):
    """Raised when a domain entity is not found."""


class DuplicateEntityError(DLMSBaseException):
    """Raised when a duplicate entity is detected."""


class InvalidEntityStateError(DLMSBaseException):
    """Raised when an entity is in an invalid state for an operation."""


# --- Application / Use-Case Exceptions ---
class AuthenticationError(DLMSBaseException):
    """Raised on authentication failure."""


class AuthorizationError(DLMSBaseException):
    """Raised when a user lacks permission to perform an action."""


class ValidationError(DLMSBaseException):
    """Raised when input data is invalid."""


class LoanLimitExceededError(DLMSBaseException):
    """Raised when a user reaches their maximum loan limit."""


class DocumentUnavailableError(DLMSBaseException):
    """Raised when a document is not available for loan/download."""


# --- Infrastructure Exceptions ---
class StorageUploadError(DLMSBaseException):
    """Raised when a file-storage upload fails."""


class EmailDeliveryError(DLMSBaseException):
    """Raised when an email cannot be delivered."""
