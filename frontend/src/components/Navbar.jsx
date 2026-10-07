import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck,
  Search,
  Ticket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ theme, toggleTheme, showToast }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    showToast('Session terminée', 'info');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-base-100 border-b border-base-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <Link to={isAdmin ? "/dashboard" : "/tickets"} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center shadow-xs">
              <span className="font-extrabold text-xl tracking-tighter">H</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight font-sans text-base-content">HelpDesk</span>
                <span className="badge badge-sm badge-neutral font-mono text-[10px] tracking-wide uppercase">Support</span>
              </div>
              <p className="text-[11px] text-base-content/60 hidden sm:block">
                Gestion des billets & requêtes
              </p>
            </div>
          </Link>

          {/* Quick Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher des billets (titre, référence)..."
                className="input input-sm w-full pl-9 pr-4 bg-base-200/60 border-base-300 focus:border-slate-800 focus:bg-base-100 rounded-full text-xs transition-all"
                onClick={() => navigate('/tickets')}
              />
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content"
              aria-label="Changer de thème"
            >
              {theme === 'helpdeskDark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* User Dropdown */}
            {user ? (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar btn-sm border border-base-300">
                  <div className="w-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs uppercase">
                    {user.full_name ? user.full_name.charAt(0) : user.email.charAt(0)}
                  </div>
                </label>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-2xl w-60 border border-base-300">
                  <li className="menu-title px-3 py-2 border-b border-base-200 mb-1">
                    <p className="font-semibold text-sm text-base-content leading-none">{user.full_name || 'Utilisateur'}</p>
                    <p className="text-[11px] text-base-content/60 truncate mt-1">{user.email}</p>
                    <div className="mt-1.5">
                      {user.is_superuser ? (
                        <span className="badge badge-xs badge-neutral gap-1 font-mono">
                          <ShieldCheck className="w-3 h-3" /> Super-Admin
                        </span>
                      ) : (
                        <span className="badge badge-xs badge-ghost gap-1 font-mono text-[10px]">
                          Utilisateur
                        </span>
                      )}
                    </div>
                  </li>
                  
                  {isAdmin && (
                    <li>
                      <Link to="/dashboard" className="gap-2 py-2">
                        Tableau de bord
                      </Link>
                    </li>
                  )}
                  
                  <li>
                    <Link to="/tickets" className="gap-2 py-2">
                      <Ticket className="w-4 h-4" /> Mes Billets
                    </Link>
                  </li>

                  <li>
                    <Link to="/profile" className="gap-2 py-2">
                      <UserIcon className="w-4 h-4" /> Mon Profil
                    </Link>
                  </li>

                  <div className="divider my-1"></div>
                  <li>
                    <button onClick={handleLogout} className="gap-2 text-rose-500 hover:bg-rose-500/10 py-2">
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </li>
                </ul>
              </div>
            ) : null}

          </div>

        </div>
      </div>
    </header>
  );
};
