import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiLogin,
  apiSignup,
  apiGetMe,
  apiUpdateMe,
  apiUpdatePasswordMe,
  getStoredToken,
  setStoredToken,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  // Initialisation de la session au chargement
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const existingToken = getStoredToken();
      if (existingToken) {
        try {
          const meRes = await apiGetMe();
          if (meRes?.user) {
            setUser(meRes.user);
            setToken(existingToken);
          } else {
            // Jeton expiré ou invalide
            setStoredToken(null);
            setToken(null);
            setUser(null);
          }
        } catch {
          setStoredToken(null);
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await apiLogin(username, password);
      if (res.success) {
        setToken(res.token);
        if (res.user) {
          setUser(res.user);
        } else {
          const me = await apiGetMe();
          setUser(me?.user || null);
        }
        return { success: true, isMock: res.isMock, user: res.user || user, notice: res.notice };
      }
      return { success: false, error: 'Identifiants incorrects' };
    } catch (err) {
      return { success: false, error: err.message || 'Erreur lors de la connexion' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, fullName) => {
    setLoading(true);
    try {
      const res = await apiSignup(email, password, fullName);
      if (res.success) {
        return await login(email, password);
      }
      return { success: false, error: "Échec de l'inscription" };
    } catch (err) {
      return { success: false, error: err.message || "Erreur d'inscription" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await apiUpdateMe(data);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: "Impossible de mettre à jour le profil" };
  };

  const updatePassword = async (currentPassword, newPassword) => {
    return await apiUpdatePasswordMe(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        updatePassword,
        isAuthenticated: Boolean(user),
        isAdmin: Boolean(user?.is_superuser),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
