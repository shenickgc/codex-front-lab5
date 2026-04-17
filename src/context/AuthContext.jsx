import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'session_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  });

  const login = ({ username, password }) => {
    if (!username || !password) {
      return { ok: false, error: 'Usuario y contraseña son requeridos.' };
    }

    const session = { username };
    setUser(session);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user],
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
