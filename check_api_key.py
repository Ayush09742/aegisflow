from sqlalchemy import text

from app.core.database import engine


with engine.connect() as connection:
    result = connection.execute(
        text(
            """
            SELECT id, user_id, name, is_active
            FROM api_keys
            WHERE id = 4
            """
        )
    )

    print(result.fetchone())