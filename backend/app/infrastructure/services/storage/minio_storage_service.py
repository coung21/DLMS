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

    async def get_presigned_url(self, file_path: str, expiration_minutes: int = 15, filename: str = None) -> str:
        from datetime import timedelta
        
        # WE MUST USE THE PUBLIC ENDPOINT FOR SIGNING
        # Otherwise the Host header in the signature won't match what the browser sends
        signer = Minio(
            settings.STORAGE_PUBLIC_ENDPOINT,
            access_key=settings.STORAGE_ACCESS_KEY,
            secret_key=settings.STORAGE_SECRET_KEY,
            secure=settings.STORAGE_SECURE,
            region="us-east-1",  # Bypass bucket location discovery network request
        )

        extra_query_params = {}
        if filename:
            import urllib.parse
            encoded_filename = urllib.parse.quote(filename)
            extra_query_params["response-content-disposition"] = f"attachment; filename=\"{encoded_filename}\"; filename*=UTF-8''{encoded_filename}"

        # Generate the URL using the public-facing 'signer'
        return signer.presigned_get_object(
            self.bucket_name,
            file_path,
            expires=timedelta(minutes=expiration_minutes),
            extra_query_params=extra_query_params
        )

    async def delete_file(self, file_path: str) -> bool:
        try:
            self.client.remove_object(self.bucket_name, file_path)
            return True
        except Exception:
            return False
