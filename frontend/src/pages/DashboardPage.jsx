import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { DashboardView } from '../components/DashboardView';

export const DashboardPage = () => {
  const { tickets, users, openNewTicketModal, onTicketUpdated, showToast } = useOutletContext();

  return (
    <DashboardView
      tickets={tickets}
      users={users}
      openNewTicketModal={openNewTicketModal}
      onTicketUpdated={onTicketUpdated}
      showToast={showToast}
    />
  );
};
