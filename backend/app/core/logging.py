import sys
from loguru import logger
from app.core.config import settings


def setup_logging() -> None:
    logger.remove()
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )
    level = "DEBUG" if settings.DEBUG else "INFO"
    logger.add(sys.stdout, format=log_format, level=level, colorize=True)
    logger.add(
        "logs/dlms_{time:YYYY-MM-DD}.log",
        rotation="1 day",
        retention="30 days",
        compression="zip",
        format=log_format,
        level=level,
    )


__all__ = ["logger", "setup_logging"]
