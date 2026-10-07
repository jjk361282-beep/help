/**
 * API Service for Full Stack FastAPI Project
 * Interacts with backend endpoints defined in openapi.json.
 * Provides fallback mock data with localStorage persistence when backend is offline.
 */

import { API_BASE_URL } from '../config/env';

export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

export const setApiBaseUrl = (url) => {
  localStorage.setItem('api_base_url', url.replace(/\/+$/, ''));
};

export const getStoredToken = () => {
  return localStorage.getItem('access_token');
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
};

// Base d'utilisateurs simulée pour démonstration fluide et tests de rôles
const INITIAL_MOCK_USERS = [
  {
    id: "1c9b6f84-9351-40ef-97b7-6bcfb0a69cb1",
    email: "admin@helpdesk.app",
    full_name: "Alexandre Tremblay",
    is_active: true,
    is_superuser: true
  },
  {
    id: "2a8e4c72-8142-4fdf-88c6-3acfa1b88df2",
    email: "user@helpdesk.app",
    full_name: "Sarah Diallo",
    is_active: true,
    is_superuser: false
  },
  {
    id: "3b7d5e61-7231-4eef-99d5-4bdff2a77ee3",
    email: "jean.dupont@client.com",
    full_name: "Jean Dupont",
    is_active: true,
    is_superuser: false
  }
];

const INITIAL_MOCK_TICKETS = [
  {
    id: "9e1c3a72-4b3d-4c48-8df0-7d6a5c1b8201",
    reference: "TCK-8942",
    title: "Intégration passerelle de paiement Mobile Money",
    description: "Configuration du webhook de notification instantanée pour les paiements Orange et MTN.",
    urgency: "haute",
    status: "en_cours",
    category_id: "paiements",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "7f2d4b83-5c4e-4d59-9ef1-8e7b6d2c9312",
    reference: "TCK-8941",
    title: "Optimisation du taux de délivrabilité des emails de facture",
    description: "Vérifier la configuration SPF et DKIM sur le domaine principal pour réduire les passages en spam.",
    urgency: "moyenne",
    status: "resolu",
    category_id: "infrastructure",
    created_at: new Date(Date.now() - 3600000 * 26).toISOString()
  },
  {
    id: "5a3e5c94-6d5f-4e6a-af02-9f8c7e3d0423",
    reference: "TCK-8939",
    title: "Demande d'activation du multi-devises (XOF / EUR / USD)",
    description: "Ajout de la conversion dynamique au taux de change en direct sur la page de paiement sécurisée.",
    urgency: "critique",
    status: "nouveau",
    category_id: "facturation",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: "4b2f6d05-7e6a-4f7b-bf13-0a9d8f4e1534",
    reference: "TCK-8935",
    title: "Mise à jour des mentions légales et politique de confidentialité",
    description: "Mise en conformité RGPD et protection des données vendeurs pour la version 2026.",
    urgency: "faible",
    status: "resolu",
    category_id: "juridique",
    created_at: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

export const getMockData = () => {
  let users = JSON.parse(localStorage.getItem('mock_users') || 'null');
  if (!users) {
    users = INITIAL_MOCK_USERS;
    localStorage.setItem('mock_users', JSON.stringify(users));
  }
  let tickets = JSON.parse(localStorage.getItem('mock_tickets') || 'null');
  if (!tickets) {
    tickets = INITIAL_MOCK_TICKETS;
    localStorage.setItem('mock_tickets', JSON.stringify(tickets));
  }
  return { users, tickets };
};

export const saveMockUsers = (users) => {
  localStorage.setItem('mock_users', JSON.stringify(users));
};

export const saveMockTickets = (tickets) => {
  localStorage.setItem('mock_tickets', JSON.stringify(tickets));
};

// Generic fetch wrapper
async function apiRequest(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const token = getStoredToken();
  const headers = {
    ...options.headers,
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = data?.detail || (typeof data === 'string' ? data : 'Une erreur réseau est survenue');
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return { data, isMock: false };
  } catch (err) {
    // If backend connection refused or failed, we handle graceful offline/mock fallback
    return { error: err, isOffline: true };
  }
}

/**
 * Authentication Endpoints (OpenAPI paths)
 */

export const apiLogin = async (username, password) => {
  // POST /api/v1/login/access-token
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const res = await apiRequest('/api/v1/login/access-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!res.isOffline && res.data) {
    setStoredToken(res.data.access_token);
    return { success: true, token: res.data.access_token, isMock: false };
  }

  // Mock fallback login
  const { users } = getMockData();
  const matched = users.find(u => u.email.toLowerCase() === username.toLowerCase());
  const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
  setStoredToken(token);
  
  const mockUser = matched || {
    id: "user-" + Date.now(),
    email: username,
    full_name: username.split('@')[0],
    is_active: true,
    is_superuser: username.includes('admin')
  };

  return {
    success: true,
    token,
    user: mockUser,
    isMock: true,
    notice: 'Mode simulation activé : Backend FastAPI non joignable sur ' + getApiBaseUrl()
  };
};

export const apiTestToken = async () => {
  // POST /api/v1/login/test-token
  const res = await apiRequest('/api/v1/login/test-token', {
    method: 'POST',
  });
  if (!res.isOffline && res.data) {
    return { success: true, user: res.data, isMock: false };
  }
  return null;
};

export const apiGetMe = async () => {
  // GET /api/v1/users/me
  const res = await apiRequest('/api/v1/users/me', {
    method: 'GET',
  });
  if (!res.isOffline && res.data) {
    return { success: true, user: res.data, isMock: false };
  }

  // Mock current user
  const { users } = getMockData();
  return { success: true, user: users[0], isMock: true };
};

export const apiUpdateMe = async (data) => {
  // PATCH /api/v1/users/me
  const res = await apiRequest('/api/v1/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.isOffline && res.data) {
    return { success: true, user: res.data, isMock: false };
  }

  const { users } = getMockData();
  users[0] = { ...users[0], ...data };
  saveMockUsers(users);
  return { success: true, user: users[0], isMock: true };
};

export const apiUpdatePasswordMe = async (current_password, new_password) => {
  // PATCH /api/v1/users/me/password
  const res = await apiRequest('/api/v1/users/me/password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_password, new_password }),
  });
  if (!res.isOffline && res.data) {
    return { success: true, data: res.data, isMock: false };
  }
  return { success: true, message: "Mot de passe mis à jour (simulation)", isMock: true };
};

export const apiRecoverPassword = async (email) => {
  // POST /api/v1/password-recovery/{email}
  const res = await apiRequest(`/api/v1/password-recovery/${encodeURIComponent(email)}`, {
    method: 'POST',
  });
  if (!res.isOffline && res.data) {
    return { success: true, message: res.data.message || 'Email envoyé', isMock: false };
  }
  return { success: true, message: `Email de réinitialisation envoyé à ${email} (simulation)`, isMock: true };
};

export const apiResetPassword = async (token, new_password) => {
  // POST /api/v1/reset-password/
  const res = await apiRequest('/api/v1/reset-password/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password }),
  });
  if (!res.isOffline && res.data) {
    return { success: true, isMock: false };
  }
  return { success: true, isMock: true };
};

export const apiSignup = async (email, password, full_name) => {
  // POST /api/v1/users/signup
  const res = await apiRequest('/api/v1/users/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  });
  if (!res.isOffline && res.data) {
    return { success: true, user: res.data, isMock: false };
  }

  const { users } = getMockData();
  const newUser = {
    id: "user-" + Date.now(),
    email,
    full_name: full_name || email.split('@')[0],
    is_active: true,
    is_superuser: false,
  };
  users.push(newUser);
  saveMockUsers(users);
  return { success: true, user: newUser, isMock: true };
};

/**
 * Users Management Endpoints
 */

export const apiGetUsers = async (skip = 0, limit = 100) => {
  // GET /api/v1/users/
  const res = await apiRequest(`/api/v1/users/?skip=${skip}&limit=${limit}`, {
    method: 'GET',
  });
  if (!res.isOffline && res.data) {
    return {
      success: true,
      users: res.data.data || res.data,
      count: res.data.count ?? res.data.length,
      isMock: false
    };
  }

  const { users } = getMockData();
  return {
    success: true,
    users,
    count: users.length,
    isMock: true
  };
};

export const apiCreateUser = async (userData) => {
  // POST /api/v1/users/
  const res = await apiRequest('/api/v1/users/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.isOffline && res.data) {
    return { success: true, user: res.data, isMock: false };
  }

  const { users } = getMockData();
  const newUser = {
    id: "user-" + Date.now(),
    email: userData.email,
    full_name: userData.full_name || userData.email.split('@')[0],
    is_active: userData.is_active !== false,
    is_superuser: Boolean(userData.is_superuser),
  };
  users.unshift(newUser);
  saveMockUsers(users);
  return { success: true, user: newUser, isMock: true };
};

export const apiUpdateUser = async (userId, userData) => {
  // PATCH /api/v1/users/{user_id}
  const res = await apiRequest(`/api/v1/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.isOffline && res.data) {
    return { success: true, user: res.data, isMock: false };
  }

  const { users } = getMockData();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    saveMockUsers(users);
    return { success: true, user: users[index], isMock: true };
  }
  return { success: false, error: "Utilisateur non trouvé" };
};

export const apiDeleteUser = async (userId) => {
  // DELETE /api/v1/users/{user_id}
  const res = await apiRequest(`/api/v1/users/${userId}`, {
    method: 'DELETE',
  });
  if (!res.isOffline && res.data) {
    return { success: true, isMock: false };
  }

  const { users } = getMockData();
  const updated = users.filter(u => u.id !== userId);
  saveMockUsers(updated);
  return { success: true, isMock: true };
};

/**
 * Tickets Endpoints (OpenAPI /api/v1/tickets/)
 */

export const apiCreateTicket = async ({ title, description, urgency, category_id = "general" }) => {
  // POST /api/v1/tickets/?args=default&kwargs=default
  // Body schema: TicketsIn { title, description, urgency }
  // Response schema: TicketsOut { id, reference, title, description, urgency, status, category_id }
  const res = await apiRequest('/api/v1/tickets/?args=create&kwargs=portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      description,
      urgency,
    }),
  });

  if (!res.isOffline && res.data) {
    // Add locally to tickets storage as well
    const { tickets } = getMockData();
    tickets.unshift(res.data);
    saveMockTickets(tickets);
    return { success: true, ticket: res.data, isMock: false };
  }

  // Mock implementation matching schema TicketsOut
  const refNum = Math.floor(1000 + Math.random() * 9000);
  const newTicket = {
    id: "tck-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    reference: `TCK-${refNum}`,
    title,
    description,
    urgency,
    status: "nouveau",
    category_id: category_id || "general",
    created_at: new Date().toISOString()
  };

  const { tickets } = getMockData();
  tickets.unshift(newTicket);
  saveMockTickets(tickets);

  return { success: true, ticket: newTicket, isMock: true };
};

export const apiGetTickets = async () => {
  // OpenAPI has POST /api/v1/tickets/.
  // We keep tickets stored and synchronized.
  const { tickets } = getMockData();
  return { success: true, tickets };
};

export const apiUpdateTicketStatus = async (ticketId, status) => {
  const { tickets } = getMockData();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index !== -1) {
    tickets[index].status = status;
    saveMockTickets(tickets);
    return { success: true, ticket: tickets[index] };
  }
  return { success: false };
};

export const apiDeleteTicket = async (ticketId) => {
  const { tickets } = getMockData();
  const filtered = tickets.filter(t => t.id !== ticketId);
  saveMockTickets(filtered);
  return { success: true };
};

/**
 * Utils Endpoints (OpenAPI /api/v1/utils/)
 */

export const apiHealthCheck = async () => {
  // GET /api/v1/utils/health-check/ -> boolean
  const res = await apiRequest('/api/v1/utils/health-check/', {
    method: 'GET',
  });
  if (!res.isOffline && res.data !== undefined) {
    return { healthy: Boolean(res.data), isMock: false };
  }
  return { healthy: false, isMock: true, error: res.error?.message };
};

export const apiTestEmail = async (emailTo) => {
  // POST /api/v1/utils/test-email/ with query ?email_to=...
  const res = await apiRequest(`/api/v1/utils/test-email/?email_to=${encodeURIComponent(emailTo)}`, {
    method: 'POST',
  });
  if (!res.isOffline && res.data) {
    return { success: true, data: res.data, isMock: false };
  }
  return {
    success: true,
    message: `Email de test simulé envoyé avec succès à ${emailTo}`,
    isMock: true
  };
};
