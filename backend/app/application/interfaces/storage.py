"""Storage service interface."""
from abc import ABC, abstractmethod


class IStorageService(ABC):
    """Interface for storage operations."""

    @abstractmethod
    async def get_presigned_url(self, file_path: str, expiration_minutes: int = 15) -> str:
        """Generate a presigned URL for downloading/previewing a file."""
        pass
