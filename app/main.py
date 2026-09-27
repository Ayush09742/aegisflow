from fastapi import FastAPI

from app.core.database import Base, engine

from app.models.ai_request import AIRequest
from app.models.api_key import APIKey

from app.api.routes.chat import router as chat_router
from app.api.routes.usage import router as usage_router
from app.api.routes.api_keys import router as api_keys_router
from app.api.routes.health import router as health_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AegisFlow",
    version="0.2.0",
    description="AI Gateway and Infrastructure Layer"
)


app.include_router(chat_router)
app.include_router(usage_router)
app.include_router(api_keys_router)
app.include_router(health_router)