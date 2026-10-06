import sqlmodel
from app.models.user import UserRole,
from pydantic import EmailStr
from sqlmodel import SQLModel, Field
from uuid import UUID
from .user import UserBase


# schema for user


class UserPublic(UserBase):
    id: UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserUpdate(SQLModel):
    email: EmailStr | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    full_name: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateforAdmin(UserUpdate):
    role: UserRole


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# schema for auth


class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class UserToken(UserPublic):
    token: Token


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class Message(SQLModel):
    message: str


# schema for tickets


class CategoryIn(SQLModel):
    name: str = Field(max_length=100, unique=True, index=True)

class TicketsIn(SQLModel):
    title: str = Field(max_length=200)
    description: str= Field(max_length=200)
    urgency: str

class TicketsOut(SQLModel):
    id: UUID
    reference: str = Field(max_length=20, unique=True, index=True)
    title: str = Field(max_length=200)
    description: str
    urgency: str
    status: str

    category_id: str


class CategoryOut(SQLModel):
    name: str
    Ticktes: list[TicketsOut]
    count: int
