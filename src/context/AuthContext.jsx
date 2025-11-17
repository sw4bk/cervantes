import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, isAuthenticated, getToken, setAuthErrorHandler } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = isAuthenticated();
      setAuthenticated(hasToken);
      setLoading(false);
    };

    checkAuth();

    // Configurar el manejador de errores de autenticación
    setAuthErrorHandler(() => {
      setAuthenticated(false);
      // Redirigir usando window.location para evitar problemas con useNavigate en contexto
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    });
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      setAuthenticated(true);
      return response;
    } catch (error) {
      setAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setAuthenticated(false);
    // Redirigir usando window.location para evitar problemas con useNavigate en contexto
    window.location.href = '/login';
  };

  const value = {
    authenticated,
    loading,
    login,
    logout,
    token: getToken(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
