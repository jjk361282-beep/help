import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Toast } from '../components/Toast';
import { NewTicketModal } from '../components/NewTicketModal';
import { UserModal } from '../components/UserModal';
import { apiGetTickets, apiGetUsers } from '../services/api';
import { LayoutDashboard, Ticket, Users, UserCheck } from 'lucide-react';

export const AppLayout = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Active theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('helpdesk_theme') || 'helpdeskLight';
  });

  // Global Data states
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modals
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('helpdesk_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'helpdeskLight' ? 'helpdeskDark' : 'helpdeskLight');
  };

  // Chargement des données selon les privilèges de l'utilisateur
  const loadData = async () => {
    setDataLoading(true);
    try {
      // Les tickets sont accessibles à tous
      const ticketsPromise = apiGetTickets();

      // Les utilisateurs ne sont appelés que si l'utilisateur est admin
      const usersPromise = isAdmin ? apiGetUsers() : Promise.resolve({ users: [] });

      const [ticketsRes, usersRes] = await Promise.all([ticketsPromise, usersPromise]);

      if (ticketsRes?.tickets) {
        setTickets(ticketsRes.tickets);
      }
      if (usersRes?.users) {
        setUsers(usersRes.users);
      }
    } catch (err) {
      console.error("Erreur de chargement des données :", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, isAdmin]);

  // Ticket handlers
  const handleTicketCreated = (newTicket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  const handleTicketUpdated = (updatedTicket, action = 'update') => {
    if (action === 'add') {
      setTickets(prev => [updatedTicket, ...prev]);
    } else {
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    }
  };

  const handleTicketDeleted = (deletedId) => {
    setTickets(prev => prev.filter(t => t.id !== deletedId));
  };

  // User handlers
  const handleOpenUserModal = (user = null) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };

  const handleUserSaved = (savedUser) => {
    setUsers(prev => {
      const exists = prev.some(u => u.id === savedUser.id);
      if (exists) {
        return prev.map(u => u.id === savedUser.id ? savedUser : u);
      }
      return [savedUser, ...prev];
    });
  };

  const handleUserDeleted = (deletedId) => {
    setUsers(prev => prev.filter(u => u.id !== deletedId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200/50 text-base-content selection:bg-primary selection:text-primary-content">
      
      {/* Toast banner */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top sticky Navbar */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        showToast={showToast}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        
        {/* Desktop Sidebar */}
        <Sidebar
          ticketsCount={tickets.length}
          openNewTicketModal={() => setIsNewTicketOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 py-6 min-w-0">
          <Outlet context={{
            tickets,
            users,
            dataLoading,
            openNewTicketModal: () => setIsNewTicketOpen(true),
            openUserModal: handleOpenUserModal,
            onTicketCreated: handleTicketCreated,
            onTicketUpdated: handleTicketUpdated,
            onTicketDeleted: handleTicketDeleted,
            onUserSaved: handleUserSaved,
            onUserDeleted: handleUserDeleted,
            showToast
          }} />
        </main>

      </div>

      {/* Bottom Mobile Navigation Bar (Respecte les rôles de l'API) */}
      <div className="lg:hidden sticky bottom-0 z-40 bg-base-100 border-t border-base-300 px-4 py-2 flex items-center justify-around">
        {isAdmin && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-3 rounded-xl ${
              isActive ? 'text-primary font-bold' : 'text-base-content/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Accueil</span>
          </NavLink>
        )}

        <NavLink
          to="/tickets"
          className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-3 rounded-xl relative ${
            isActive ? 'text-primary font-bold' : 'text-base-content/60'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Billets</span>
          {tickets.length > 0 && (
            <span className="badge badge-xs badge-neutral absolute top-0 right-2">{tickets.length}</span>
          )}
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-3 rounded-xl ${
              isActive ? 'text-primary font-bold' : 'text-base-content/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Membres</span>
          </NavLink>
        )}

        <NavLink
          to="/profile"
          className={({ isActive }) => `flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-3 rounded-xl ${
            isActive ? 'text-primary font-bold' : 'text-base-content/60'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Profil</span>
        </NavLink>
      </div>

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onTicketCreated={handleTicketCreated}
        showToast={showToast}
      />

      {isAdmin && (
        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          userToEdit={userToEdit}
          onUserSaved={handleUserSaved}
          showToast={showToast}
        />
      )}

    </div>
  );
};
