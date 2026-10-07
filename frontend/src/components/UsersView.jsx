import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Trash2, 
  Mail,
  User as UserIcon,
  Shield
} from 'lucide-react';
import { apiDeleteUser } from '../services/api';

export const UsersView = ({ 
  users = [], 
  openUserModal, 
  onUserDeleted, 
  showToast 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      roleFilter === 'all' ||
      (roleFilter === 'admin' && u.is_superuser) ||
      (roleFilter === 'standard' && !u.is_superuser);

    return matchesSearch && matchesRole;
  });

  const handleDelete = async (user) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.email} ?`)) {
      const res = await apiDeleteUser(user.id);
      if (res.success) {
        showToast(`Utilisateur ${user.email} supprimé`, 'info');
        onUserDeleted(user.id);
      } else {
        showToast("Erreur lors de la suppression", 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content flex items-center gap-2">
            Gestion des Utilisateurs
            <span className="badge badge-neutral badge-sm font-mono">{filteredUsers.length}</span>
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Administration des comptes d'accès et des privilèges HelpDesk (<code className="font-mono text-[11px]">/api/v1/users/</code>)
          </p>
        </div>

        <button
          onClick={() => openUserModal(null)}
          className="btn btn-primary btn-sm rounded-xl gap-2 normal-case shadow-xs"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          Ajouter un Utilisateur
        </button>
      </div>

      {/* Filter and Search Bar (Clean flat card) */}
      <div className="p-4 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-sm w-full pl-9 rounded-xl text-xs bg-base-200/50 border-base-300 focus:border-slate-800 focus:bg-base-100"
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select select-sm select-bordered rounded-xl text-xs bg-base-100"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Super-administrateurs</option>
            <option value="standard">Utilisateurs standards</option>
          </select>
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xs overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="border-b border-base-200 text-base-content/60 text-xs">
              <th>Utilisateur</th>
              <th>Statut du compte</th>
              <th>Rôle API</th>
              <th>Identifiant unique</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 text-xs">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-base-content/50">
                  Aucun utilisateur correspondant trouvé
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-base-200/40">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {u.full_name ? u.full_name.charAt(0) : u.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-base-content">{u.full_name || 'Sans nom'}</p>
                        <p className="text-base-content/60 text-[11px] font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {u.is_active !== false ? (
                      <span className="badge badge-sm badge-success text-white font-medium gap-1 text-[11px]">
                        <CheckCircle className="w-3 h-3" /> Actif
                      </span>
                    ) : (
                      <span className="badge badge-sm badge-ghost font-medium gap-1 text-[11px]">
                        <XCircle className="w-3 h-3" /> Inactif
                      </span>
                    )}
                  </td>
                  <td>
                    {u.is_superuser ? (
                      <span className="badge badge-sm badge-neutral font-mono text-[10px] gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Super-Admin
                      </span>
                    ) : (
                      <span className="badge badge-sm badge-outline text-[10px] font-mono">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="font-mono text-[11px] text-base-content/50 truncate max-w-xs">
                    {u.id}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openUserModal(u)}
                        className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-primary"
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-rose-500"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
