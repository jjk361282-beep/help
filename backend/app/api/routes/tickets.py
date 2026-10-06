from fastapi import APIRouter,Depends
from app.api.deps import CurrentUser,SessionDep,get_admin_active_superuser
from app.models import Ticket,TicketsOut,TicketsIn

router =APIRouter(prefix='/tickets',tags=['tickets'],dependencies=[Depends(CurrentUser)])

@router.post('/', response_model= TicketsOut)
def create_tickets(session_db:SessionDep,tickets_in:TicketsIn):
    tickets=Ticket.model_validate(tickets_in)
    session_db.add(tickets)
    session_db.commit()
    session_db.refresh(tickets)
    return tickets

