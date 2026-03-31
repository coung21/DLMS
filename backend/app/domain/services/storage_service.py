from abc import ABC, abstractmethod
from typing import BinaryIO


class StorageService(ABC):
    """Interface for storage service."""

    @abstractmethod
    async def upload_file(self, file: BinaryIO, filename: str, content_type: str = None) -> str:
        """
        Upload a file to storage and return the file path/URL.
        """
        pass

    @abstractmethod
    async def get_presigned_url(self, file_path: str, expiration_minutes: int = 15, filename: str = None) -> str:
        """
        Get a presigned URL for a file. If filename is provided, it should trigger a download with that name.
        """
        pass

    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from storage.
        """
        pass
