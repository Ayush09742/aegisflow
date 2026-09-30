from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.ai_request import AIRequest
from app.models.api_key import APIKey
from app.models.user import User
from app.schemas.requests import RequestResponse

from app.api.dependencies.auth import authenticate_api_key


router = APIRouter(
    prefix="/v1",
    tags=["Requests"]
)


@router.get(
    "/requests",
    response_model=list[RequestResponse]
)
def get_requests(
    db: Session = Depends(get_db),
    api_key: APIKey = Depends(authenticate_api_key)
):
    requests = (
        db.query(AIRequest)
        .filter(
            AIRequest.api_key_id == api_key.id
        )
        .order_by(
            AIRequest.created_at.desc()
        )
        .all()
    )

    return requests


@router.get(
    "/user/requests",
    response_model=list[RequestResponse]
)
def get_user_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    requests = (
        db.query(AIRequest)
        .join(
            APIKey,
            AIRequest.api_key_id == APIKey.id
        )
        .filter(
            APIKey.user_id == current_user.id
        )
        .order_by(
            AIRequest.created_at.desc()
        )
        .all()
    )

    return requests