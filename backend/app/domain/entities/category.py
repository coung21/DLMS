import uuid
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Category:
    name: str
    description: Optional[str] = None
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
