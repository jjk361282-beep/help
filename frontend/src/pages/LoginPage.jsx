import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LifeBuoy, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  KeyRound
} from 'lucide-react';
import { apiRecoverPassword } from '../services/api';

export const LoginPage = () => {
  const { user, login, signup, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Si déjà connecté, rediriger selon les permissions
  if (isAuthenticated && user) {
    const destination = location.state?.from?.pathname || (user.is_superuser ? '/dashboard' : '/tickets');
    return <Navigate to={destination} replace />;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        const dest = res.user?.is_superuser ? '/dashboard' : '/tickets';
        navigate(dest, { replace: true });
      } else {
        setErrorMsg(res.error || 'Identifiants invalides');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Tous les champs requis doivent être renseignés.');
      return;
    }

    setLoading(true);
    try {
      const res = await signup(email.trim(), password, fullName.trim());
      if (res.success) {
        navigate('/tickets', { replace: true });
      } else {
        setErrorMsg(res.error || "Impossible de créer le compte");
      }
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Veuillez renseigner votre email');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRecoverPassword(email.trim());
      setSuccessMsg(res.message || 'Instructions de réinitialisation envoyées');
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de la récupération');
    } finally {
      setLoading(false);
    }
  };

  // Remplissage rapide et connexion démo
  const handleQuickDemoLogin = async (demoRole) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const demoEmail = demoRole === 'admin' ? 'admin@helpdesk.app' : 'user@helpdesk.app';
    const demoPass = 'demo1234';

    setEmail(demoEmail);
    setPassword(demoPass);

    try {
      const res = await login(demoEmail, demoPass);
      if (res.success) {
        const dest = demoRole === 'admin' ? '/dashboard' : '/tickets';
        navigate(dest, { replace: true });
      } else {
        setErrorMsg(res.error || 'Erreur lors de la connexion démo');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col justify-center items-center p-4 sm:p-6 text-base-content">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center shadow-sm">
          <span className="font-extrabold text-2xl tracking-tighter">H</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">HelpDesk</h1>
          <p className="text-xs text-base-content/60 mt-0.5">Portail d'assistance et de gestion des requêtes</p>
        </div>
      </div>

      {/* Main Auth Card (Chariow Clean Flat Style - Sans dégradé) */}
      <div className="w-full max-w-md bg-base-100 rounded-3xl border border-base-300 shadow-sm p-6 sm:p-8">
        
        {/* Tab switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-base-200/70 rounded-2xl mb-6 text-xs font-medium">
          <button
            onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-base-100 text-base-content font-semibold shadow-xs'
                : 'text-base-content/60 hover:text-base-content'
            }`}
          >
            Connexion
          </button>
          {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={() => { setTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'signup'
                ? 'bg-base-100 text-base-content font-semibold shadow-xs'
                : 'text-base-content/60 hover:text-base-content'
            }`}
          >
            S'inscrire
          </button>
          {/** biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={() => { setTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'forgot'
                ? 'bg-base-100 text-base-content font-semibold shadow-xs'
                : 'text-base-content/60 hover:text-base-content'
            }`}
          >
            Aide
          </button>
        </div>

        {/* Feedback message alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Connexion */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold text-base-content/70">Adresse Email</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-sm w-full pl-10 rounded-xl text-xs bg-base-200/50 border-base-300 focus:border-slate-800 focus:bg-base-100"
                />
              </div>
            </div>

            <div className="form-control">
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-semibold text-base-content/70">Mot de passe</span>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-[11px] text-base-content/50 hover:text-base-content transition-colors"
                >
                  Oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-sm w-full pl-10 rounded-xl text-xs bg-base-200/50 border-base-300 focus:border-slate-800 focus:bg-base-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm w-full mt-2 rounded-xl normal-case font-semibold text-xs gap-2"
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : <ArrowRight className="w-4 h-4" />}
              Se connecter
            </button>
          </form>
        )}

        {/* Tab 2: S'inscrire */}
        {tab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold text-base-content/70">Nom complet</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input input-sm w-full pl-10 rounded-xl text-xs bg-base-200/50 border-base-300 focus:border-slate-800 focus:bg-base-100"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold text-base-content/70">Adresse Email</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="jean.dupont@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-sm w-full pl-10 rounded-xl text-xs bg-base-200/50 border-base-300 focus:border-slate-800 focus:bg-base-100"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold text-base-content/70">Mot de passe</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Au moins 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-sm w-full pl-10 rounded-xl text-xs bg-base-200/50 border-base-300 focus:border-slate-800 focus:bg-base-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm w-full mt-2 rounded-xl normal-case font-semibold text-xs gap-2"
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : <ArrowRight className="w-4 h-4" />}
              Créer mon compte
            </button>
          </form>
        )}

        {/* Tab 3: Récupération */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
            <p className="text-xs text-base-content/70 leading-relaxed">
              Saisissez l'adresse email associée à votre compte. Un lien de réinitialisation vous sera envoyé.
            </p>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold text-base-content/70">Adresse Email</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-sm w-full pl-10 rounded-xl text-xs bg-base-200/50 border-base-300 focus:border-slate-800 focus:bg-base-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm w-full mt-2 rounded-xl normal-case font-semibold text-xs gap-2"
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : <KeyRound className="w-4 h-4" />}
              Envoyer les instructions
            </button>
          </form>
        )}

        {/* Test Accounts Demonstration Box (Chariow minimal styling) */}
        <div className="mt-8 pt-6 border-t border-base-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider">
              Accès Démo Rapide (Gestion des Rôles)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              disabled={loading}
              className="p-3 rounded-2xl border border-base-300 bg-base-200/40 hover:bg-base-200 hover:border-slate-400 transition-all text-left flex flex-col gap-1 group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-base-content">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Admin</span>
              </div>
              <span className="text-[10px] text-base-content/60 leading-tight">
                Super-administrateur (Accès total : billets, utilisateurs, stats)
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('user')}
              disabled={loading}
              className="p-3 rounded-2xl border border-base-300 bg-base-200/40 hover:bg-base-200 hover:border-slate-400 transition-all text-left flex flex-col gap-1 group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-base-content">
                <UserCheck className="w-3.5 h-3.5 text-secondary" />
                <span>Utilisateur</span>
              </div>
              <span className="text-[10px] text-base-content/60 leading-tight">
                Utilisateur standard (Accès ciblé : billets & profil uniquement)
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer text */}
      <p className="mt-6 text-[11px] text-base-content/50 text-center">
        HelpDesk • Système conforme OpenAPI 3.1 & FastAPI
      </p>

    </div>
  );
};
