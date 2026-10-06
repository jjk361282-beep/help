from sqlmodel import SQLModel, Field, Relationship, TEXT
from typing import Optional
from enum import Enum
from datetime import UTC, datetime
from uuid import UUID, uuid4
from sqlalchemy import DateTime, Text
from .user import User


from app.utils import get_datetime_utc

class TicketUrgency(str, Enum):
    BLOQUANT = "bloquant"
    GENANT = "genant"
    MINEUR = "mineur"


class TicketStatus(str, Enum):
    NOUVEAU = "nouveau"
    EN_COURS = "en_cours"
    RESOLU = "resolu"
    CLOS = "clos"


class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: UUID = Field(default=uuid4, primary_key=True)
    name: str = Field(max_length=100, unique=True, index=True)
    is_active: bool = Field(default=True)

    tickets: list["Ticket"] = Relationship(back_populates="category")


class Ticket(SQLModel, table=True):
    """
    table pour les tickets creer
    """
    __tablename__ = "tickets"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    reference: str = Field(max_length=20, unique=True, index=True)
    title: str = Field(max_length=200)
    description: str = Field(sa_type=Text)
    urgency: TicketUrgency = Field(default=TicketUrgency.GENANT, index=True)
    status: TicketStatus = Field(default=TicketStatus.NOUVEAU, index=True)

    category_id: UUID = Field(foreign_key="categories.id", index=True)
    # la personne qui a signialer le tickets
    reporter_id: UUID = Field(foreign_key="users.id", index=True)
    # le techn affecte
    assignee_id: UUID |None = Field(
        default=None, foreign_key="users.id", index=True
    )
    # note de la resolution
    resolution_note: str|None = Field(default=None, sa_type=Text)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    # date de reolutiom
    resolved_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    # date de creation
    closed_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    category: Category = Relationship(back_populates="tickets")
    reporter: User = Relationship(
        back_populates="reported_tickets",
        sa_relationship_kwargs={"foreign_keys": "[Ticket.reporter_id]"},
    )
    assignee: User | None = Relationship(
        back_populates="assigned_tickets",
        sa_relationship_kwargs={"foreign_keys": "[Ticket.assignee_id]"},
    )


    attachments: list["Attachment"] = Relationship(  # noqa: UP037
        back_populates="ticket",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    events: list["TicketEvent"] = Relationship(
        back_populates="ticket",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )



class Attachment(SQLModel, table=True):
    __tablename__ = "attachments"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    ticket_id: UUID = Field(foreign_key="tickets.id", index=True)
    uploaded_by: UUID = Field(foreign_key="users.id")
    file_name: str = Field(max_length=255)
    file_url: str = Field(max_length=500)
    mime_type: str = Field(max_length=100)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )

    ticket: "Ticket" = Relationship(back_populates="attachments")

class TicketEvent(SQLModel, table=True):
    __tablename__ = "ticket_events"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    ticket_id: UUID = Field(foreign_key="tickets.id", index=True)
    actor_id: UUID | None = Field(default=None, foreign_key="users.id")
    event_type: str = Field(max_length=250)
    old_value: str | None = Field(default=None, max_length=255)
    new_value: str | None = Field(default=None, max_length=255)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )

    # Indispensable pour correspondre à back_populates="ticket" dans Ticket
    ticket: "Ticket" = Relationship(back_populates="events")