from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Float
)

from app.core.database import Base


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    key_hash = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    rate_limit = Column(
        Integer,
        nullable=False,
        default=10
    )

    monthly_budget_usd = Column(
        Float,
        nullable=True
    )

    is_admin = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )