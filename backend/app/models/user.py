from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum

from pydantic import EmailStr
from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.utils import get_datetime_utc

# from .tickets import Ticket

class UserRole(str, Enum):
    EMPLOYE = "employe"
    TECHNICIEN = "technicien"
    ADMIN = "admin"

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    role: UserRole = Field(default=UserRole.EMPLOYE, index=True)
    full_name: str | None = Field(default=None, max_length=255)

class User(UserBase,table=True):

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True)
    hashed_password: str
    role: UserRole = Field(default=UserRole.EMPLOYE, index=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    reported_tickets: list["Ticket"] = Relationship(
        back_populates="reporter",
        sa_relationship_kwargs={"foreign_keys": "[Ticket.reporter_id]"},
    )
    assigned_tickets: list["Ticket"] = Relationship(
        back_populates="assignee",
        sa_relationship_kwargs={"foreign_keys": "[Ticket.assignee_id]"},
    )

    def is_admin(self)->bool:
        return self.role== UserRole.ADMIN