from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128
    )


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=128
    )

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(
        min_length=1,
        max_length=500
    )

    new_password: str = Field(
        min_length=8,
        max_length=128
    )


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: EmailStr


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_active: bool

class OAuthExchangeRequest(BaseModel):
    code: str = Field(
        min_length=1,
        max_length=500
    )