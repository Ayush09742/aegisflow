from app.core.database import SessionLocal
from app.models.api_key import APIKey
from app.services.api_key_service import (
    generate_api_key,
    hash_api_key
)


db = SessionLocal()

try:
    api_key = generate_api_key()

    key_record = APIKey(
        name="local-development",
        key_hash=hash_api_key(api_key),
        is_active=True
    )

    db.add(key_record)
    db.commit()

    print()
    print("AegisFlow API Key:")
    print(api_key)
    print()

finally:
    db.close()