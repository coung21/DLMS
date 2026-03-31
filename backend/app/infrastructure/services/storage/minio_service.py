"""MinIO implementation of IStorageService."""
from datetime import timedelta
from minio import Minio

from app.application.interfaces.storage import IStorageService
from app.core.config import settings
from app.core.logging import logger


class MinioStorageService(IStorageService):
    def __init__(self) -> None:
        self.client = Minio(
            endpoint=settings.STORAGE_ENDPOINT,
            access_key=settings.STORAGE_ACCESS_KEY,
            secret_key=settings.STORAGE_SECRET_KEY,
            secure=settings.STORAGE_SECURE,
        )
        self.bucket_name = settings.STORAGE_BUCKET

    async def get_presigned_url(self, file_path: str, expiration_minutes: int = 15) -> str:
        try:
            url = self.client.presigned_get_object(
                self.bucket_name,
                file_path,
                expires=timedelta(minutes=expiration_minutes),
            )
            return url
        except Exception as e:
            logger.error(f"Error generating presigned URL for {file_path}: {e}")
            raise
