from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy import (
    Column,
   Integer,
String,
Text,
DateTime,
ForeignKey,
Boolean,
Float
)

from app.core.database import Base


class AIRequest(Base):
    __tablename__ = "ai_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    api_key_id = Column(
    Integer,
    ForeignKey("api_keys.id"),
    nullable=True,
    index=True
    )

    request_id = Column(
        String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid4())
    )

    prompt = Column(
        Text,
        nullable=False
    )

    model = Column(
        String(100),
        nullable=False
    )

    provider = Column(
        String(50),
        nullable=False
    )

    response = Column(
        Text,
        nullable=True
    )

    status = Column(
        String(20),
        nullable=False,
        default="success"
    )
    cache_hit = Column(
    Boolean,
    nullable=False,
    default=False
    )

    prompt_tokens = Column(
    Integer,
    nullable=True
)
    completion_tokens = Column(
    Integer,
    nullable=True
)   
    total_tokens = Column(
    Integer,
    nullable=True
)
    cost_usd = Column(
    Float,
    nullable=True
)

    latency_ms = Column(
        Integer,
        nullable=True
    )

    error_message = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    