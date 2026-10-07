import React, { useState } from 'react';
import { 
  Ticket, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  LayoutGrid, 
  List, 
  Calendar,
  Layers,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUpdateTicketStatus, apiDeleteTicket } from '../services/api';

export const TicketsView = ({ 
  tickets = [], 
  openNewTicketModal, 
  onTicketUpdated, 
  onTicketDeleted, 
  showToast 
}) => {
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Filtrage des tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      (ticket.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || (ticket.urgency || '').toLowerCase() === urgencyFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const handleStatusChange = async (ticket, newStatus) => {
    const res = await apiUpdateTicketStatus(ticket.id, newStatus);
    if (res.success) {
      showToast(`Statut du billet ${ticket.reference} passé à : ${newStatus}`, 'info');
      onTicketUpdated({ ...ticket, status: newStatus }, 'update');
    }
  };

  const handleDelete = async (ticket) => {
    if (!isAdmin) {
      showToast("Seul un administrateur peut supprimer des billets", "error");
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le billet ${ticket.reference} ?`)) {
      const res = await apiDeleteTicket(ticket.id);
      if (res.success) {
        showToast(`Billet ${ticket.reference} supprimé`, 'info');
        onTicketDeleted(ticket.id);
      }
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critique':
        return <span className="badge badge-sm badge-error text-white font-medium">Critique</span>;
      case 'haute':
        return <span className="badge badge-sm badge-warning text-white font-medium">Haute</span>;
      case 'moyenne':
        return <span className="badge badge-sm badge-info text-white font-medium">Moyenne</span>;
      default:
        return <span className="badge badge-sm badge-ghost font-medium">Faible</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolu':
        return <span className="badge badge-sm badge-success text-white font-medium">Résolu</span>;
      case 'en_cours':
        return <span className="badge badge-sm badge-neutral font-medium">En cours</span>;
      default:
        return <span className="badge badge-sm badge-outline font-medium">Nouveau</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content flex items-center gap-2">
            Billets & Requêtes
            <span className="badge badge-neutral badge-sm font-mono">{filteredTickets.length}</span>
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            {isAdmin 
              ? "Gestion centralisée de tous les billets support" 
              : "Suivi de vos demandes d'assistance et déclarations d'incidents"}
          </p>
        </div>

        <button
          onClick={openNewTicketModal}
          className="btn btn-primary btn-sm rounded-xl gap-2 normal-case shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Nouveau Billet
        </button>
      </div>

      {/* Filter and Search Bar (Clean flat card without gradients) */}
      <div className="p-4 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par titre, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-sm w-full pl-9 rounded-xl text-xs bg-base-200/50 border-base-300 focus:border-slate-800 focus:bg-base-100"
          />
        </div>

        {/* Filters and View mode */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-sm select-bordered rounded-xl text-xs bg-base-100"
          >
            <option value="all">Tous les statuts</option>
            <option value="nouveau">Nouveau</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolu</option>
          </select>

          {/* Urgency filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="select select-sm select-bordered rounded-xl text-xs bg-base-100"
          >
            <option value="all">Toutes urgences</option>
            <option value="critique">Critique</option>
            <option value="haute">Haute</option>
            <option value="moyenne">Moyenne</option>
            <option value="faible">Faible</option>
          </select>

          {/* View Toggle */}
          <div className="join border border-base-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`join-item btn btn-xs ${viewMode === 'cards' ? 'btn-primary' : 'btn-ghost'}`}
              aria-label="Vue grille"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`join-item btn btn-xs ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              aria-label="Vue tableau"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Main Content: Cards or Table */}
      {filteredTickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-base-100 border border-base-300 flex flex-col items-center justify-center gap-3">
          <Ticket className="w-10 h-10 text-base-content/20" />
          <p className="text-sm font-semibold text-base-content/80">Aucun billet trouvé</p>
          <p className="text-xs text-base-content/50 max-w-sm">
            Modifiez vos filtres ou créez une nouvelle requête pour obtenir de l'aide.
          </p>
          <button
            onClick={openNewTicketModal}
            className="btn btn-primary btn-sm rounded-xl normal-case mt-2"
          >
            Nouveau Billet
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => (
            <div 
              key={ticket.id}
              className="p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-base-content/80">
                    {ticket.reference}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getUrgencyBadge(ticket.urgency)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-base-content line-clamp-2">
                  {ticket.title}
                </h3>

                <p className="text-xs text-base-content/70 line-clamp-3 leading-relaxed">
                  {ticket.description}
                </p>
              </div>

              {/* Card Footer with actions */}
              <div className="pt-3 border-t border-base-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-base-content/50">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'Récemment'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status update (disponible pour admin, ou affichage simple pour user) */}
                  {isAdmin ? (
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket, e.target.value)}
                      className="select select-bordered select-xs rounded-lg text-xs"
                    >
                      <option value="nouveau">Nouveau</option>
                      <option value="en_cours">En cours</option>
                      <option value="resolu">Résolu</option>
                    </select>
                  ) : null}

                  {/* Suppression (Réservée exclusivement à l'Admin) */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(ticket)}
                      className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-rose-500"
                      title="Supprimer le billet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      ) : (
        
        /* Table View */
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xs overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="border-b border-base-200 text-base-content/60 text-xs">
                <th>Référence</th>
                <th>Titre & Description</th>
                <th>Urgence</th>
                <th>Statut</th>
                <th>Date</th>
                {isAdmin && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 text-xs">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-base-200/40">
                  <td className="font-mono font-bold text-base-content/90 whitespace-nowrap">
                    {ticket.reference}
                  </td>
                  <td className="max-w-md">
                    <p className="font-semibold text-base-content">{ticket.title}</p>
                    <p className="text-base-content/60 truncate text-[11px]">{ticket.description}</p>
                  </td>
                  <td>{getUrgencyBadge(ticket.urgency)}</td>
                  <td>
                    {isAdmin ? (
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket, e.target.value)}
                        className="select select-bordered select-xs rounded-lg text-xs"
                      >
                        <option value="nouveau">Nouveau</option>
                        <option value="en_cours">En cours</option>
                        <option value="resolu">Résolu</option>
                      </select>
                    ) : (
                      getStatusBadge(ticket.status)
                    )}
                  </td>
                  <td className="text-base-content/60 whitespace-nowrap">
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('fr-FR') : 'Récemment'}
                  </td>
                  {isAdmin && (
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(ticket)}
                        className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-rose-500"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      )}

    </div>
  );
};
