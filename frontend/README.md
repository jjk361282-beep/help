# HelpDesk • Support & Gestion de Billets (FastAPI)

Plateforme web moderne, sobre et performante pour la gestion de billets d'assistance et d'utilisateurs, conçue selon la spécification `openapi.json` FastAPI.

---

## 🛠️ Stack Technique

- **Framework** : [React.js](https://react.dev/) (v18, ESM)
- **Routage** : [React Router](https://reactrouter.com/) (v7)
- **Gestionnaire de paquets** : [pnpm](https://pnpm.io/)
- **CSS & Design System** : [TailwindCSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) (Thèmes `helpdeskLight` & `helpdeskDark`, design plat sans dégradé de couleur)
- **Iconographie** : [Lucide React](https://lucide.dev/)
- **Bundler & Dev Server** : [Vite](https://vitejs.dev/)

---

## 🚦 Routage & Gestion des Rôles (API FastAPI)

L'application respecte strictement les permissions de l'API et affiche uniquement ce dont chaque rôle a besoin :

| Route | Rôle requis | Description |
| :--- | :--- | :--- |
| **`/login`** | Public | Authentification OAuth2 Bearer, inscription, récupération de mot de passe et boutons de connexion rapide démo (Admin / Utilisateur). |
| **`/tickets`** | Tous | Création, recherche et suivi de billets support. (La suppression est réservée aux administrateurs). |
| **`/dashboard`** | **Admin uniquement** (`is_superuser: true`) | Vue d'ensemble, métriques de support (taux de résolution, incidents critiques) et création rapide. Les utilisateurs standards sont automatiquement redirigés vers `/tickets`. |
| **`/users`** | **Admin uniquement** (`is_superuser: true`) | Administration des comptes d'accès (`/api/v1/users/`). Masqué dans la navigation et verrouillé par `AdminRoute` pour les utilisateurs standards. |
| **`/profile`** | Tous | Consultation et mise à jour des informations de compte et mot de passe (`/api/v1/users/me`). |

> **Note relative à l'API** : Conformément aux spécifications, aucune sonde ni vérification de santé d'API ("health check") n'est exposée dans l'interface, même pour l'administrateur. L'application communique de façon transparente avec le backend.

---

## ⚙️ Variables d'Environnement & Déploiement

La configuration est isolée du code pour un déploiement facile en tout environnement.

1. Créez un fichier `.env` basé sur `.env.example` :
```bash
cp .env.example .env
```

2. Ajustez la variable `VITE_API_URL` :
```env
# URL du backend FastAPI
VITE_API_URL=http://localhost:8000
```
Pour un déploiement en production, remplacez simplement par l'URL de votre serveur (ex: `https://api.helpdesk.votre-domaine.com`).

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
pnpm install
```

### 2. Démarrage en développement
```bash
pnpm run dev
```
L'application est accessible sur : **`http://localhost:5173/`**

### 3. Compilation pour la production
```bash
pnpm run build
```
Les fichiers prêts pour le déploiement sont générés dans le répertoire `dist/`.
