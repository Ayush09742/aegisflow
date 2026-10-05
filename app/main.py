from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine

from app.models.ai_request import AIRequest
from app.models.api_key import APIKey
from app.models.user import User
from app.models.provider_credential import ProviderCredential
from app.models.oauth_account import OAuthAccount
from app.models.password_reset_token import PasswordResetToken

from app.api.routes.chat import router as chat_router
from app.api.routes.usage import router as usage_router
from app.api.routes.api_keys import router as api_keys_router
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.requests import router as requests_router
from app.api.routes.user_api_keys import router as user_api_keys_router
from app.api.routes.providers import router as providers_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AegisFlow",
    version="0.2.0",
    description="AI Gateway and Infrastructure Layer"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://aegisflow-frontend.onrender.com",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(chat_router)
app.include_router(usage_router)
app.include_router(api_keys_router)
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(requests_router)
app.include_router(user_api_keys_router)
app.include_router(providers_router)