import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, ShieldCheck, Mail, Lock, User } from 'lucide-react';
import { apiCreateUser, apiUpdateUser } from '../services/api';

export const UserModal = ({ isOpen, onClose, userToEdit, onUserSaved, showToast }) => {
  const isEditing = Boolean(userToEdit);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setEmail(userToEdit.email || '');
      setFullName(userToEdit.full_name || '');
      setIsActive(userToEdit.is_active !== false);
      setIsSuperuser(Boolean(userToEdit.is_superuser));
      setPassword('');
    } else {
      setEmail('');
      setFullName('');
      setPassword('');
      setIsActive(true);
      setIsSuperuser(false);
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Veuillez renseigner une adresse email valide', 'error');
      return;
    }

    if (!isEditing && !password) {
      showToast('Le mot de passe est obligatoire pour un nouvel utilisateur', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const payload = {
          email: email.trim(),
          full_name: fullName.trim(),
          is_active: isActive,
          is_superuser: isSuperuser,
        };
        if (password.trim()) {
          payload.password = password.trim();
        }

        const res = await apiUpdateUser(userToEdit.id, payload);
        if (res.success) {
          showToast(`Utilisateur ${email} mis à jour avec succès`, 'success');
          onUserSaved(res.user);
          onClose();
        } else {
          showToast(res.error || "Erreur de mise à jour", 'error');
        }
      } else {
        const payload = {
          email: email.trim(),
          password: password.trim(),
          full_name: fullName.trim(),
          is_active: isActive,
          is_superuser: isSuperuser,
        };

        const res = await apiCreateUser(payload);
        if (res.success) {
          showToast(`Nouvel utilisateur ${email} créé avec succès`, 'success');
          onUserSaved(res.user);
          onClose();
        } else {
          showToast("Erreur lors de la création", 'error');
        }
      }
    } catch (err) {
      showToast(err.message || "Erreur", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-base-100 rounded-3xl border border-base-200 shadow-2xl w-full max-w-lg overflow-hidden transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-base-200">
          <div>
            <h3 className="font-bold text-lg text-base-content">
              {isEditing ? 'Modifier l’Utilisateur' : 'Ajouter un Nouvel Utilisateur'}
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Endpoint: <code className="text-[11px] font-mono bg-base-200 px-1.5 py-0.5 rounded">
                {isEditing ? `PATCH /api/v1/users/${userToEdit.id}` : 'POST /api/v1/users/'}
              </code>
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
          
          {/* Full Name */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs text-base-content/80">Nom complet</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ex: Alexandre Tremblay"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input input-bordered w-full pl-9 rounded-xl text-sm focus:input-primary"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs text-base-content/80">Adresse Email *</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="contact@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full pl-9 rounded-xl text-sm focus:input-primary"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-xs text-base-content/80">
                {isEditing ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
              </span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full pl-9 rounded-xl text-sm focus:input-primary"
                required={!isEditing}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="label cursor-pointer p-3 rounded-xl border border-base-200 hover:bg-base-200/40">
              <div className="flex flex-col">
                <span className="label-text font-semibold text-xs">Compte Actif</span>
                <span className="text-[10px] text-base-content/50">Autoriser la connexion</span>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="toggle toggle-primary toggle-sm"
              />
            </label>

            <label className="label cursor-pointer p-3 rounded-xl border border-base-200 hover:bg-base-200/40">
              <div className="flex flex-col">
                <span className="label-text font-semibold text-xs">Super-administrateur</span>
                <span className="text-[10px] text-base-content/50">Droits d'administration</span>
              </div>
              <input
                type="checkbox"
                checked={isSuperuser}
                onChange={(e) => setIsSuperuser(e.target.checked)}
                className="toggle toggle-secondary toggle-sm"
              />
            </label>
          </div>

          {/* Footer Actions */}
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
                  <Check className="w-3.5 h-3.5" />
                  {isEditing ? 'Enregistrer les modifications' : 'Créer l’Utilisateur'}
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
