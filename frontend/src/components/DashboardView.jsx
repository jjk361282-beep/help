import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Send,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiCreateTicket, apiUpdateTicketStatus } from '../services/api';

export const DashboardView = ({ 
  tickets = [], 
  users = [], 
  openNewTicketModal, 
  onTicketUpdated, 
  showToast 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Quick ticket creation form states
  const [quickTitle, setQuickTitle] = useState('');
  const [quickUrgency, setQuickUrgency] = useState('moyenne');
  const [submittingQuick, setSubmittingQuick] = useState(false);

  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolu').length;
  const inProgressTickets = tickets.filter(t => t.status === 'en_cours').length;
  const newTickets = tickets.filter(t => t.status === 'nouveau').length;
  const activeTickets = tickets.filter(t => t.status !== 'resolu').length;
  const criticalTickets = tickets.filter(t => t.urgency === 'critique').length;
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100;

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) {
      showToast('Veuillez entrer un titre de billet', 'error');
      return;
    }

    setSubmittingQuick(true);
    try {
      const res = await apiCreateTicket({
        title: quickTitle.trim(),
        description: `Billet rapide créé depuis le tableau de bord - Urgence ${quickUrgency}`,
        urgency: quickUrgency,
        category_id: 'general'
      });

      if (res.success) {
        showToast(`Billet ${res.ticket.reference} créé avec succès !`, 'success');
        onTicketUpdated(res.ticket, 'add');
        setQuickTitle('');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingQuick(false);
    }
  };

  const handleStatusChange = async (ticket, newStatus) => {
    const res = await apiUpdateTicketStatus(ticket.id, newStatus);
    if (res.success) {
      showToast(`Statut du billet ${ticket.reference} mis à jour : ${newStatus}`, 'info');
      onTicketUpdated({ ...ticket, status: newStatus }, 'update');
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
      
      {/* Banner (Clean Flat Style - Sans dégradé) */}
      <div className="rounded-3xl bg-slate-900 text-white p-7 sm:p-8 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-200 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Console d'administration HelpDesk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              Bonjour, {user?.full_name || 'Administrateur'} 👋
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Supervisez les tickets d'assistance, gérez les priorités et administrez les utilisateurs de votre organisation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openNewTicketModal}
              className="btn btn-sm bg-white text-slate-900 hover:bg-slate-100 border-none rounded-xl font-semibold gap-2 normal-case px-4"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              Nouveau Billet
            </button>
            <button
              onClick={() => navigate('/tickets')}
              className="btn btn-sm btn-ghost bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-medium gap-2 normal-case"
            >
              <Ticket className="w-4 h-4" />
              Voir les Billets
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards (Flat solid colors without gradients) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Billets */}
        <div className="p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Total Billets
            </span>
            <div className="w-9 h-9 rounded-xl bg-base-200 text-base-content flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-base-content">
              {totalTickets}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-base-content/60">
              <span className="font-semibold text-rose-500">{criticalTickets}</span> critique{criticalTickets > 1 ? 's' : ''}
              <span>•</span>
              <span className="font-semibold text-amber-500">{activeTickets}</span> actifs
            </div>
          </div>
        </div>

        {/* Stat 2: Taux de résolution */}
        <div className="p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Résolution
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-base-content">
              {resolutionRate}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{resolvedTickets} clôturés</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Billets en cours / en attente */}
        <div className="p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              En Traitement
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-base-content">
              {inProgressTickets}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-base-content/60">
              <span className="font-semibold text-primary">{newTickets}</span> nouveaux non assignés
            </div>
          </div>
        </div>

        {/* Stat 4: Billets critiques */}
        <div className="p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Priorité Haute
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-base-content">
              {criticalTickets}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-600 font-medium">
              <span>Nécessitent une intervention rapide</span>
            </div>
          </div>
        </div>

      </div>

      {/* Two Column Grid: Recent Tickets & Quick Ticket Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Recent Tickets */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-base-content">
                Derniers Billets & Requêtes
              </h2>
              <p className="text-xs text-base-content/60">
                Tickets enregistrés et synchronisés avec l'API
              </p>
            </div>
            <button
              onClick={() => navigate('/tickets')}
              className="btn btn-ghost btn-xs text-primary font-semibold gap-1 normal-case"
            >
              <span>Tous les billets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xs overflow-hidden">
            {tickets.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <Ticket className="w-10 h-10 text-base-content/30" />
                <p className="text-sm font-medium text-base-content/60">Aucun billet pour l'instant</p>
                <button
                  onClick={openNewTicketModal}
                  className="btn btn-primary btn-sm rounded-xl normal-case"
                >
                  Créer un billet
                </button>
              </div>
            ) : (
              <div className="divide-y divide-base-200">
                {tickets.slice(0, 5).map((t) => (
                  <div 
                    key={t.id} 
                    className="p-4 hover:bg-base-200/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-base-content/80">
                          {t.reference}
                        </span>
                        {getUrgencyBadge(t.urgency)}
                        {getStatusBadge(t.status)}
                      </div>
                      <h4 className="font-semibold text-sm text-base-content truncate">
                        {t.title}
                      </h4>
                      <p className="text-xs text-base-content/60 line-clamp-1">
                        {t.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t, e.target.value)}
                        className="select select-bordered select-xs rounded-lg text-xs"
                      >
                        <option value="nouveau">Nouveau</option>
                        <option value="en_cours">En cours</option>
                        <option value="resolu">Résolu</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Quick Ticket Creation */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-base-content">
              Création Rapide
            </h2>
            <p className="text-xs text-base-content/60">
              Poster immédiatement un nouveau ticket
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-base-100 border border-base-300 shadow-xs flex flex-col gap-4">
            <form onSubmit={handleQuickSubmit} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">Objet du billet</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: Incident sur passerelle de paiement"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="input input-sm w-full rounded-xl text-xs bg-base-200/50 border-base-300 focus:border-slate-800 focus:bg-base-100"
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-semibold text-base-content/70">Niveau d'urgence</span>
                </label>
                <select
                  value={quickUrgency}
                  onChange={(e) => setQuickUrgency(e.target.value)}
                  className="select select-sm select-bordered rounded-xl text-xs"
                >
                  <option value="faible">Faible</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                  <option value="critique">Critique</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submittingQuick}
                className="btn btn-primary btn-sm w-full rounded-xl normal-case font-semibold text-xs gap-2 mt-2"
              >
                {submittingQuick ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Créer le billet
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
