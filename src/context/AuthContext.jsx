import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  loginRequest,
  profileRequest,
  registerRequest,
} from '../services/authService';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'session_user';
const TOKEN_STORAGE_KEY = 'session_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const { user: profile } = await profileRequest();
        setUser(profile);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      } catch (error) {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    restoreSession();
  }, []);

  const login = async ({ email, password }) => {
    if (!email || !password) {
      return { ok: false, error: 'Correo y contrasena son requeridos.' };
    }

    try {
      const { token, user: sessionUser } = await loginRequest({ email, password });

      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error.response?.data?.message || 'No se pudo iniciar sesion.',
      };
    }
  };

  const register = async ({ name, email, password }) => {
    if (!name || !email || !password) {
      return { ok: false, error: 'Nombre, correo y contrasena son obligatorios.' };
    }

    try {
      const { token, user: sessionUser } = await registerRequest({
        name,
        email,
        password,
      });

      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error.response?.data?.message || 'No se pudo completar el registro.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [isBootstrapping, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.');
  }

  return context;
}
