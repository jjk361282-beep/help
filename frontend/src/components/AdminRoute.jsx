import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-base-100">
        <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-lg animate-pulse">
          H
        </div>
        <p className="text-xs font-medium text-base-content/60">Vérification des droits d'accès...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Si l'utilisateur n'est pas admin, redirection sécurisée vers les billets autorisés
    return <Navigate to="/tickets" replace />;
  }

  return children;
};
