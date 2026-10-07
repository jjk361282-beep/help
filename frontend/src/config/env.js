/**
 * Centralisation des variables d'environnement pour le déploiement HelpDesk
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
export const APP_NAME = 'HelpDesk';
