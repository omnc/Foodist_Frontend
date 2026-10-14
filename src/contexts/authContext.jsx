import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, authHeaders, setStoredCsrf } from '../lib/apiClient';

const AuthContext = createContext(null);

const pendingUsernameKey = (email) => `foodist_pending_username:${String(email).trim().toLowerCase()}`;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      // Prefer Bearer when present; cookie session still sent via credentials
      const response = await apiFetch('/auth/me', {
        headers: authHeaders({ token }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({ token: token || null, ...userData });
        if (userData.email) {
          localStorage.setItem('userEmail', userData.email);
        }
      } else if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        setUser(null);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError('Failed to verify login status');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        headers: authHeaders({ json: true }),
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Login failed',
          statuscode: response.status,
        };
      }

      if (data.token) localStorage.setItem('token', data.token);
      if (data.csrfToken) setStoredCsrf(data.csrfToken);
      localStorage.setItem('userEmail', data.user?.email || email);

      setUser({
        token: data.token,
        csrfToken: data.csrfToken,
        id: data.user?.id,
        email: data.user?.email || email,
        username: data.user?.username ?? null,
        ...data.user,
      });
      setError(null);
      await applyPendingUsername(email, data.token, data.user?.id);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /** Sign-up collects a username before any session exists, so it is saved on the first login. */
  const applyPendingUsername = async (email, token, userId) => {
    const key = pendingUsernameKey(email);
    const username = localStorage.getItem(key);
    if (!username || !userId) return;
    localStorage.removeItem(key);
    const result = await sendProfile(userId, token, { username });
    if (result.success) setUser((current) => (current ? { ...current, ...result.user } : current));
  };

  const sendProfile = async (userId, token, fields) => {
    try {
      const response = await apiFetch(`/auth/${userId}`, {
        method: 'PUT',
        headers: authHeaders({ token, json: true, mutating: true }),
        body: JSON.stringify(fields),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, error: data.error || data.message || 'Unable to update profile' };
      }
      return { success: true, user: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (fields) => {
    if (!user?.id) return { success: false, error: 'Please log in first' };
    const result = await sendProfile(user.id, localStorage.getItem('token'), fields);
    if (result.success) setUser((current) => ({ ...current, ...result.user }));
    return result;
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await apiFetch('/auth/change-password', {
        method: 'POST',
        headers: authHeaders({ token: localStorage.getItem('token'), json: true, mutating: true }),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Unable to change password',
          statuscode: response.status,
        };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (email, password, username) => {
    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        headers: authHeaders({ json: true }),
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Registration failed',
          statuscode: response.status,
        };
      }

      const { password: _ignored, ...safeUser } = data || {};
      const cleanUsername = username?.trim();
      if (cleanUsername) localStorage.setItem(pendingUsernameKey(email), cleanUsername);
      setError(null);
      return { success: true, user: safeUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setStoredCsrf('');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
