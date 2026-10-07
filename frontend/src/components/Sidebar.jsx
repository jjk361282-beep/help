import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  UserCheck, 
  Plus, 
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ ticketsCount = 0, openNewTicketModal }) => {
  const { user, isAdmin } = useAuth();

  // Menu conditionné strictement par le rôle (OpenAPI / FastAPI)
  const menuItems = [
    ...(isAdmin ? [{
      to: '/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: null,
    }] : []),
    {
      to: '/tickets',
      label: 'Billets & Requêtes',
      icon: Ticket,
      badge: ticketsCount > 0 ? ticketsCount : null,
    },
    ...(isAdmin ? [{
      to: '/users',
      label: 'Utilisateurs',
      icon: Users,
      badge: null,
    }] : []),
    {
      to: '/profile',
      label: 'Mon Profil',
      icon: UserCheck,
      badge: null,
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6 py-6">
      
      {/* Quick Create Action Button */}
      <button
        onClick={openNewTicketModal}
        className="btn btn-primary w-full shadow-xs rounded-2xl gap-2 font-medium normal-case tracking-tight"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        Nouveau Billet
      </button>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1">
        <p className="px-3 text-[11px] font-semibold text-base-content/40 uppercase tracking-wider mb-1">
          Menu {isAdmin ? 'Administration' : 'Support'}
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-primary text-primary-content font-semibold shadow-xs'
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-200/80'
              }`}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-primary-content' : 'text-base-content/50'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span className={`badge badge-sm rounded-full font-mono text-[11px] ${
                      isActive ? 'badge-ghost text-primary-content bg-white/20 border-transparent' : 'badge-neutral'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Help & Support Card (Solid flat design without gradients) */}
      <div className="mt-auto p-4 rounded-2xl bg-base-100 border border-base-300 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-base-content">Support HelpDesk</span>
        </div>
        <p className="text-[11px] text-base-content/60 leading-relaxed">
          {isAdmin 
            ? "Accès complet aux données et gestion des comptes utilisateurs." 
            : "Consultez le statut de vos requêtes ou soumettez un nouveau ticket."}
        </p>
      </div>

    </aside>
  );
};
