// AuthContext.js - FIXED VERSION for Strapi 5
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../Services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 Check auth on app start - FIXED for Strapi 5
  useEffect(() => {
    const token = localStorage.getItem("jwt") || localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        // FIX: Use Strapi 5 query structure
        const query = `
          query GetCurrentUser {
            me {
              id
              documentId
              username
              email
              role {
                name
                type
              }
            }
          }
        `;
        
        const response = await fetch(`${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ query }),
        });

        const result = await response.json();
        
        if (result.errors) {
          console.error("GraphQL errors:", result.errors);
          throw new Error(result.errors[0]?.message || 'Failed to fetch user');
        }

        const userData = result.data.me;
        if (userData) {
          console.log("✅ Current user fetched:", userData);
          setUser(userData);
        } else {
          console.warn("⚠️ No user data returned");
          localStorage.removeItem("jwt");
          localStorage.removeItem("authToken");
        }
      } catch (err) {
        console.error("❌ Error fetching current user:", err);
        localStorage.removeItem("jwt");
        localStorage.removeItem("authToken");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔐 Login - UPDATED for Strapi 5
  const login = async (identifier, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(identifier, password);
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      const userData = result.data.user;
      
      // Set user with proper Strapi 5 structure
      setUser({
        ...userData,
        role: userData.role?.name || userData.role || null
      });
      
      return { success: true, data: result.data };

    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 🧾 Registration - UPDATED
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.completeSignup(userData);
      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      const registeredUser = result.data.user;
      
      setUser({
        ...registeredUser,
        role: registeredUser.role?.name || registeredUser.role || null
      });
      
      return { success: true, data: result.data };

    } catch (err) {
      const message = err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  // 🔑 Forgot Password
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.forgotPassword(email);
      return { success: true, data: result.data };
    } catch (err) {
      const message = err.message || 'Password reset failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ♻️ Reset Password
  const resetPassword = async (code, password, passwordConfirmation) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.resetPassword(code, password, passwordConfirmation);
      if (result.success && result.data.user) {
        setUser(result.data.user);
      }
      return { success: true, data: result.data };
    } catch (err) {
      const message = err.message || 'Password reset failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Get user role - IMPROVED
  const getUserRole = () => {
    if (!user) return null;
    
    console.log('🔍 Role detection - user object:', user);
    
    // Handle different role structures
    if (user.role) {
      if (typeof user.role === 'string') return user.role;
      if (user.role.name) return user.role.name;
      if (user.role.type) return user.role.type;
    }
    
    return 'authenticated'; // Default fallback
  };

  const hasRole = (roleName) => getUserRole() === roleName;
  const isAuthenticated = () => !!user && !loading;

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    getUserRole,
    hasRole,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;