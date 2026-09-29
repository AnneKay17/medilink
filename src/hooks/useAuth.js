// Custom hook for authentication
// Provides current user and auth state

import { useState } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  // Initialize user from localStorage using lazy initializer
  // This avoids calling setState in useEffect
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      setIsLoading(false);
      return userData;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  const register = async (email, password, name, role) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await authService.register(email, password, name, role);
      setUser(userData);
      setIsLoading(false);
      return userData;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};