import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Save, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfileView = ({ showToast }) => {
  const { user, updateProfile, updatePassword } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile({
        full_name: fullName.trim(),
        email: email.trim(),
      });
      if (res.success) {
        showToast('Profil mis à jour avec succès', 'success');
      } else {
        showToast(res.error || 'Erreur lors de la mise à jour', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Veuillez remplir les champs de mot de passe', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Les nouveaux mots de passe ne correspondent pas', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await updatePassword(currentPassword, newPassword);
      if (res.success) {
        showToast('Mot de passe changé avec succès', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast("Échec de la modification du mot de passe", 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">
          Mon Profil & Sécurité
        </h1>
        <p className="text-xs text-base-content/60 mt-0.5">
          Gérez vos informations personnelles et vos identifiants d'accès API (<code className="font-mono text-[11px]">/api/v1/users/me</code>)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Card: User Badge & Summary */}
        <div className="p-6 rounded-3xl bg-base-100 border border-base-200/90 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-black text-2xl uppercase shadow-lg">
            {user?.full_name ? user.full_name.charAt(0) : user?.email?.charAt(0) || 'U'}
          </div>

          <div>
            <h2 className="font-bold text-base text-base-content">
              {user?.full_name || 'Utilisateur'}
            </h2>
            <p className="text-xs text-base-content/60 font-mono mt-0.5">
              {user?.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {user?.is_superuser && (
              <span className="badge badge-sm badge-primary gap-1 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Administrateur
              </span>
            )}
            <span className="badge badge-sm badge-success text-white font-medium text-[11px]">
              Actif
            </span>
          </div>

          <div className="w-full pt-4 border-t border-base-200 text-left text-xs text-base-content/60 flex flex-col gap-2">
            <div>
              <span className="font-semibold block text-[10px] uppercase text-base-content/40">Identifiant Unique (UUID)</span>
              <span className="font-mono text-[11px] truncate block">{user?.id || 'id-session'}</span>
            </div>
            <div>
              <span className="font-semibold block text-[10px] uppercase text-base-content/40">Droits d'accès</span>
              <span>{user?.is_superuser ? 'Accès complet (Lecture / Écriture / Administration)' : 'Accès utilisateur standard'}</span>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Form Sections */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Edit Profile Info Form */}
          <div className="p-6 rounded-3xl bg-base-100 border border-base-200/90 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm text-base-content">Informations Générales</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content/80">Nom complet</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input input-sm input-bordered rounded-xl text-xs focus:input-primary"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content/80">Adresse Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-sm input-bordered rounded-xl text-xs focus:input-primary"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary btn-sm rounded-xl px-5 normal-case gap-2"
                >
                  {savingProfile ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Enregistrer le profil
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="p-6 rounded-3xl bg-base-100 border border-base-200/90 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm text-base-content">Modifier le Mot de Passe</h2>
            </div>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content/80">Mot de passe actuel</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input input-sm input-bordered rounded-xl text-xs focus:input-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content/80">Nouveau mot de passe</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input input-sm input-bordered rounded-xl text-xs focus:input-primary"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content/80">Confirmer le mot de passe</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input input-sm input-bordered rounded-xl text-xs focus:input-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn btn-outline btn-sm rounded-xl px-5 normal-case gap-2"
                >
                  {savingPassword ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Mettre à jour le mot de passe
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
