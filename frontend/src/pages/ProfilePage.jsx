import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProfileView } from '../components/ProfileView';

export const ProfilePage = () => {
  const { showToast } = useOutletContext();

  return <ProfileView showToast={showToast} />;
};
