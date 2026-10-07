import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { TicketsView } from '../components/TicketsView';

export const TicketsPage = () => {
  const { 
    tickets, 
    openNewTicketModal, 
    onTicketUpdated, 
    onTicketDeleted, 
    showToast 
  } = useOutletContext();

  return (
    <TicketsView
      tickets={tickets}
      openNewTicketModal={openNewTicketModal}
      onTicketUpdated={onTicketUpdated}
      onTicketDeleted={onTicketDeleted}
      showToast={showToast}
    />
  );
};
