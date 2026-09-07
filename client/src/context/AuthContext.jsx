import { createContext, useContext, useEffect, useState } from 'react';
import {
  getCurrentUser,
  getStoredToken,
  login as apiLogin,
  register as apiRegister,
  setStoredToken,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setStoredToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(credentials) {
    const result = await apiLogin(credentials);
    setStoredToken(result.token);
    setUser(result.user);
    return result.user;
  }

  async function register(payload) {
    const result = await apiRegister(payload);
    setStoredToken(result.token);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    setStoredToken(null);
    setUser(null);
  }

  function updateUser(nextUser) {
    setUser(nextUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
