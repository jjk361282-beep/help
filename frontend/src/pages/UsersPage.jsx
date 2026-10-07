import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { UsersView } from '../components/UsersView';

export const UsersPage = () => {
  const { 
    users, 
    openUserModal, 
    onUserDeleted, 
    showToast 
  } = useOutletContext();

  return (
    <UsersView
      users={users}
      openUserModal={openUserModal}
      onUserDeleted={onUserDeleted}
      showToast={showToast}
    />
  );
};
