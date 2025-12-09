// AuthContext.js - FIXED VERSION with missing functions
import React, { createContext, useState, useContext, useEffect } from 'react';

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

  // 🔄 Check auth on app start
  useEffect(() => {
    const token = localStorage.getItem("jwt") || localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
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

  // 🔐 Login
  const login = async (identifier, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:1337/api/auth/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        localStorage.setItem('jwt', result.jwt);
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser({
          ...result.user,
          role: result.user.role?.name || result.user.role || null
        });
        
        return { success: true, data: result };
      } else {
        throw new Error(result.error?.message || 'Login failed');
      }
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 🆕 ADD THIS: Temp Register (stores data locally, sends verification email)
  const tempRegister = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📝 Step 1: Saving temp registration data');
      
      // Store in localStorage temporarily
      const tempData = {
        ...userData,
        timestamp: Date.now(),
        verificationSent: false
      };
      
      localStorage.setItem('temp_registration', JSON.stringify(tempData));
      
      // Send verification email via Strapi's built-in endpoint
      const verificationResponse = await fetch('http://localhost:1337/api/auth/send-email-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email })
      });
      
      const result = await verificationResponse.json();
      
      if (verificationResponse.ok) {
        return {
          success: true,
          message: 'Verification email sent! Please check your inbox.',
          email: userData.email
        };
      } else {
        throw new Error(result.error?.message || 'Failed to send verification email');
      }
    } catch (err) {
      console.error('Temp registration error:', err);
      const message = err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 🆕 ADD THIS: Complete Registration after email verification
  const completeRegistration = async (confirmationToken) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔐 Step 2: Completing registration with token');
      
      // Get temp data from localStorage
      const tempDataStr = localStorage.getItem('temp_registration');
      if (!tempDataStr) {
        throw new Error('Registration data not found. Please register again.');
      }
      
      const tempData = JSON.parse(tempDataStr);
      
      // First verify the email confirmation token
      const verifyResponse = await fetch(`http://localhost:1337/api/auth/email-confirmation?confirmation=${confirmationToken}`);
      
      if (!verifyResponse.ok) {
        throw new Error('Invalid or expired verification link');
      }
      
      // Now register the user with Strapi
      const registerResponse = await fetch('http://localhost:1337/api/auth/local/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: tempData.username,
          email: tempData.email,
          password: tempData.password,
          phone: tempData.phone,
          role: tempData.role,
          firstName: tempData.firstName,
          lastName: tempData.lastName,
          fullName: tempData.fullName,
          companyName: tempData.companyName,
          address: tempData.address
        })
      });
      
      const registerResult = await registerResponse.json();
      
      if (registerResponse.ok) {
        // Clear temp data
        localStorage.removeItem('temp_registration');
        
        // Store JWT and user
        localStorage.setItem('jwt', registerResult.jwt);
        localStorage.setItem('user', JSON.stringify(registerResult.user));
        
        setUser({
          ...registerResult.user,
          role: registerResult.user.role?.name || registerResult.user.role || null
        });
        
        return {
          success: true,
          user: registerResult.user,
          message: 'Registration completed successfully!'
        };
      } else {
        throw new Error(registerResult.error?.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Complete registration error:', err);
      const message = err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 🆕 ADD THIS: Forgot Password Function
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:1337/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: 'Password reset instructions sent to your email!'
        };
      } else {
        throw new Error(result.error?.message || 'Failed to send reset instructions');
      }
    } catch (err) {
      const message = err.message || 'Password reset failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 🆕 ADD THIS: Check if user has pending registration
  const hasPendingRegistration = () => {
    const tempData = localStorage.getItem('temp_registration');
    if (!tempData) return false;
    
    const data = JSON.parse(tempData);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // Check if temp data is less than 1 hour old
    return data.timestamp > oneHourAgo;
  };

  // 🆕 ADD THIS: Get pending email
  const getPendingEmail = () => {
    const tempData = localStorage.getItem('temp_registration');
    if (!tempData) return null;
    
    const data = JSON.parse(tempData);
    return data.email;
  };

  // 🆕 ADD THIS: Resend verification email
  const resendVerificationEmail = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:1337/api/auth/send-email-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: 'Verification email resent!'
        };
      } else {
        throw new Error(result.error?.message || 'Failed to resend verification email');
      }
    } catch (err) {
      const message = err.message || 'Failed to resend email';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    localStorage.removeItem('temp_registration');
    setUser(null);
    setError(null);
  };

  // 🔑 Reset Password
  const resetPassword = async (code, password, passwordConfirmation) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:1337/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password, passwordConfirmation })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        return { success: true, data: result };
      } else {
        throw new Error(result.error?.message || 'Password reset failed');
      }
    } catch (err) {
      const message = err.message || 'Password reset failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Get user role
  const getUserRole = () => {
    if (!user) return null;
    
    if (user.role) {
      if (typeof user.role === 'string') return user.role;
      if (user.role.name) return user.role.name;
      if (user.role.type) return user.role.type;
    }
    
    return 'authenticated';
  };

  const hasRole = (roleName) => getUserRole() === roleName;
  const isAuthenticated = () => !!user && !loading;

  const value = {
    user,
    loading,
    error,
    login,
    tempRegister,           // 🆕 Added
    completeRegistration,   // 🆕 Added
    forgotPassword,         // 🆕 Fixed - now exists
    resetPassword,
    logout,
    hasPendingRegistration, // 🆕 Added
    getPendingEmail,        // 🆕 Added
    resendVerificationEmail, // 🆕 Added
    getUserRole,
    hasRole,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;