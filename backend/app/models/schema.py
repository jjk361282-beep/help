from datetime import datetime
from app.models.tickets import TicketUrgency, TicketStatus
import sqlmodel
from app.models.user import UserRole
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
    title: str
    description: str
    urgency: TicketUrgency = TicketUrgency.GENANT
    category_id: UUID

class TicketsOut(SQLModel):
    id: UUID
    reference: str
    title: str
    description: str
    urgency: TicketUrgency
    status: TicketStatus
    category_id: UUID
    reporter_id: UUID
    assignee_id: UUID | None = None
    resolution_note: str | None = None
    created_at: datetime | None = None
    resolved_at: datetime | None = None
    closed_at: datetime | None = None

class TicketUpdate(SQLModel):
    title: str | None = None
    description: str | None = None
    urgency: TicketUrgency | None = None
    status: TicketStatus | None = None
    category_id: UUID | None = None
    assignee_id: UUID | None = None
    resolution_note: str | None = None



class CategoryOut(SQLModel):
    name: str
    Ticktes: list[TicketsOut]
    count: int


# ==========================================
# CATEGORY SCHEMAS
# ==========================================



class CategoryUpdate(SQLModel):
    name: str | None = None
    is_active: bool | None = None

class CategoryRead(SQLModel):
    id: UUID
    name: str
    is_active: bool


class CategoryIn(SQLModel):
    name: str
    is_active: bool


# ==========================================
# ATTACHMENT SCHEMAS
# ==========================================

class AttachmentRead(SQLModel):
    id: UUID
    ticket_id: UUID
    uploaded_by: UUID
    file_name: str
    file_url: str
    mime_type: str
    created_at: datetime | None = None



# ==========================================
# TICKET EVENT SCHEMAS
# ==========================================

class TicketEventRead(SQLModel):
    id: UUID
    ticket_id: UUID
    actor_id: UUID | None = None
    event_type: str
    old_value: str | None = None
    new_value: str | None = None
    created_at: datetime | None = None

