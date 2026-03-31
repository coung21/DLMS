import io
from typing import BinaryIO
from minio import Minio
from app.core.config import settings
from app.domain.services.storage_service import StorageService


class MinioStorageService(StorageService):
    def __init__(self):
        self.client = Minio(
            settings.STORAGE_ENDPOINT,
            access_key=settings.STORAGE_ACCESS_KEY,
            secret_key=settings.STORAGE_SECRET_KEY,
            secure=settings.STORAGE_SECURE,
        )
        self.bucket_name = settings.STORAGE_BUCKET

    async def upload_file(self, file: BinaryIO, filename: str, content_type: str = "application/octet-stream") -> str:
        # Minio client is synchronous, so we might want to wrap it in a thread if needed,
        # but for simplicity we'll call it directly here.
        # Check if bucket exists
        if not self.client.bucket_exists(self.bucket_name):
            self.client.make_bucket(self.bucket_name)

        # Get file size
        file.seek(0, io.SEEK_END)
        size = file.tell()
        file.seek(0)

        self.client.put_object(
            bucket_name=self.bucket_name,
            object_name=filename,
            data=file,
            length=size,
            content_type=content_type,
        )
        return filename

    async def get_file_url(self, file_path: str) -> str:
        # For public buckets or presigned URLs
        return self.client.get_presigned_url(
            "GET",
            self.bucket_name,
            file_path,
        )

    async def delete_file(self, file_path: str) -> bool:
        try:
            self.client.remove_object(self.bucket_name, file_path)
            return True
        except Exception:
            return False
