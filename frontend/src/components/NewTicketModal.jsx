import React, { useState } from 'react';
import { X, Send, AlertTriangle, Tag, Layers, Check } from 'lucide-react';
import { apiCreateTicket } from '../services/api';

export const NewTicketModal = ({ isOpen, onClose, onTicketCreated, showToast }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('moyenne');
  const [category, setCategory] = useState('support');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Veuillez remplir le titre et la description', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiCreateTicket({
        title: title.trim(),
        description: description.trim(),
        urgency,
        category_id: category,
      });

      if (res.success) {
        showToast(
          res.isMock 
            ? `Billet ${res.ticket.reference} créé (Mode simulation)` 
            : `Billet ${res.ticket.reference} créé via l'API FastAPI !`, 
          'success'
        );
        onTicketCreated(res.ticket);
        setTitle('');
        setDescription('');
        setUrgency('moyenne');
        onClose();
      } else {
        showToast("Erreur lors de la création du billet", "error");
      }
    } catch (err) {
      showToast(err.message || "Erreur de communication", "error");
    } finally {
      setLoading(false);
    }
  };

  const urgencyOptions = [
    { id: 'faible', label: 'Faible', color: 'badge-ghost' },
    { id: 'moyenne', label: 'Moyenne', color: 'badge-info' },
    { id: 'haute', label: 'Haute', color: 'badge-warning' },
    { id: 'critique', label: 'Critique', color: 'badge-error' },
  ];

  const categoryOptions = [
    { id: 'support', label: 'Support Technique' },
    { id: 'facturation', label: 'Facturation & Paiement' },
    { id: 'compte', label: 'Gestion de Compte' },
    { id: 'infrastructure', label: 'Infrastructure & API' },
    { id: 'general', label: 'Demande Générale' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-base-100 rounded-3xl border border-base-200 shadow-2xl w-full max-w-lg overflow-hidden transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-200">
          <div>
            <h3 className="font-bold text-lg text-base-content">Créer un nouveau Billet</h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Consomme le endpoint <code className="text-[11px] font-mono bg-base-200 px-1.5 py-0.5 rounded">POST /api/v1/tickets/</code>
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-base-content"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          {/* Title input */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs text-base-content/80">Titre du billet (max 200 car.)</span>
              <span className="label-text-alt text-base-content/40">{title.length}/200</span>
            </label>
            <input
              type="text"
              maxLength={200}
              placeholder="ex: Problème d'accès à l'API ou activation de compte"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full rounded-xl text-sm focus:input-primary"
              required
            />
          </div>

          {/* Description input */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs text-base-content/80">Description détaillée</span>
              <span className="label-text-alt text-base-content/40">{description.length}/200</span>
            </label>
            <textarea
              maxLength={200}
              rows={3}
              placeholder="Expliquez la nature de la demande ou l'incident rencontré..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full rounded-xl text-sm focus:textarea-primary resize-none"
              required
            ></textarea>
          </div>

          {/* Urgency selector */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs text-base-content/80">Niveau d'Urgence</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {urgencyOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setUrgency(opt.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    urgency === opt.id
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                      : 'border-base-300 hover:bg-base-200/50 text-base-content/70'
                  }`}
                >
                  <span className="capitalize">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category selector */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs text-base-content/80">Catégorie</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select select-bordered w-full rounded-xl text-sm focus:select-primary"
            >
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm rounded-xl normal-case"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm rounded-xl normal-case gap-2 px-5 shadow-md shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Créer le Billet
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
