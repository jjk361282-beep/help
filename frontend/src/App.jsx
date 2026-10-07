import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TicketsPage } from './pages/TicketsPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';

// Redirection automatique de la racine selon le rôle
function RootRedirect() {
  const { user, isAdmin, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-base-100">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-lg animate-pulse">
          H
        </div>
        <p className="text-xs font-medium text-base-content/60">Chargement de HelpDesk...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est admin -> Dashboard, sinon -> Tickets
  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/tickets" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route publique d'authentification */}
          <Route path="/login" element={<LoginPage />} />

          {/* Espace protégé (avec Navbar, Sidebar et Gestion des Rôles) */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RootRedirect />} />
            
            {/* Tableau de bord (Réservé aux Administrateurs) */}
            <Route
              path="dashboard"
              element={
                <AdminRoute>
                  <DashboardPage />
                </AdminRoute>
              }
            />

            {/* Billets & Requêtes (Accessible à tous, vue adaptée au rôle) */}
            <Route path="tickets" element={<TicketsPage />} />

            {/* Gestion des utilisateurs (Réservé aux Administrateurs) */}
            <Route
              path="users"
              element={
                <AdminRoute>
                  <UsersPage />
                </AdminRoute>
              }
            />

            {/* Mon Profil (Accessible à tous les utilisateurs authentifiés) */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Redirection pour toute autre route inconnue */}
            <Route path="*" element={<RootRedirect />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
