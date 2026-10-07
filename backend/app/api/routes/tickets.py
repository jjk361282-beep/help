import secrets
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import SessionDep
from app.models.tickets import Attachment, Category, Ticket, TicketEvent, TicketStatus
from app.models.user import User
from app.models import (
    AttachmentRead,
    CategoryRead,
    CategoryRead,
    CategoryUpdate,
    TicketsIn,
    TicketEventRead,
    TicketsOut,
    TicketUpdate,
)
from app.utils import get_datetime_utc

router = APIRouter(prefix="/tickets", tags=["Tickets & Catégories"])


def generate_ticket_reference() -> str:
    """Génère une référence unique pour le ticket (ex: TCK-A1B2C3)."""
    return f"TCK-{secrets.token_hex(3).upper()}"


# ==========================================
# CATEGORIES CONTROLLERS
# ==========================================

@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryRead, db: SessionDep):
    db_category = Category.model_validate(payload)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.get("/categories", response_model=list[CategoryRead])
def list_categories(db: SessionDep):
    categories = db.exec(select(Category)).all()
    return categories


@router.patch("/categories/{category_id}", response_model=CategoryRead)
def update_category(category_id: UUID, payload: CategoryUpdate, db: SessionDep):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Catégorie non trouvée")

    category_data = payload.model_dump(exclude_unset=True)
    for key, value in category_data.items():
        setattr(category, key, value)

    db.add(category)
    db.commit()
    db.refresh(category)
    return category


# ==========================================
# TICKETS CONTROLLERS
# ==========================================

@router.post("", response_model=TicketsOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: TicketsIn,
    current_user_id: UUID,  # À remplacer par la dépendance d'authentification actuelle
    db: SessionDep,
):
    # Vérification de l'existence de la catégorie
    category = db.get(Category, payload.category_id)
    if not category or not category.is_active:
        raise HTTPException(status_code=400, detail="Catégorie invalide ou inactive")

    ticket_data = payload.model_dump()
    ticket = Ticket(
        **ticket_data,
        reference=generate_ticket_reference(),
        reporter_id=current_user_id,
        status=TicketStatus.NOUVEAU,
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # Log de création de l'événement
    event = TicketEvent(
        ticket_id=ticket.id,
        actor_id=current_user_id,
        event_type="CREATED",
        new_value=ticket.status.value,
    )
    db.add(event)
    db.commit()

    return ticket


@router.get("", response_model=list[TicketsOut])
def list_tickets(
    status_filter: TicketStatus | None = None,
    category_id: UUID | None = None,
    db: SessionDep
):
    query = select(Ticket)
    if status_filter:
        query = query.where(Ticket.status == status_filter)
    if category_id:
        query = query.where(Ticket.category_id == category_id)

    tickets = db.exec(query).all()
    return tickets


@router.get("/{ticket_id}", response_model=TicketsOut)
def get_ticket(ticket_id: UUID, db: SessionDep):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    return ticket


@router.patch("/{ticket_id}", response_model=TicketsOut)
def update_ticket(
    ticket_id: UUID,
    payload: TicketUpdate,
    current_user_id: UUID,  # À remplacer par votre système d'authentification
    db: SessionDep
):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")

    update_data = payload.model_dump(exclude_unset=True)

    # Gestion des changements de statut et dates associées
    if "status" in update_data and update_data["status"] != ticket.status:
        old_status = ticket.status.value
        new_status = update_data["status"]

        if new_status == TicketStatus.RESOLU:
            ticket.resolved_at = get_datetime_utc()
        elif new_status == TicketStatus.CLOS:
            ticket.closed_at = get_datetime_utc()

        # Log d'événement pour le changement de statut
        event = TicketEvent(
            ticket_id=ticket.id,
            actor_id=current_user_id,
            event_type="STATUS_CHANGED",
            old_value=old_status,
            new_value=new_status.value if isinstance(new_status, TicketStatus) else str(new_status),
        )
        db.add(event)

    # Mise à jour des attributs
    for key, value in update_data.items():
        setattr(ticket, key, value)

    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


# ==========================================
# ATTACHMENTS & EVENTS CONTROLLERS
# ==========================================

@router.get("/{ticket_id}/attachments", response_model=list[AttachmentRead])
def get_ticket_attachments(ticket_id: UUID, db: SessionDep):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    return ticket.attachments


@router.get("/{ticket_id}/events", response_model=list[TicketEventRead])
def get_ticket_events(ticket_id: UUID, db: SessionDep):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    return ticket.events