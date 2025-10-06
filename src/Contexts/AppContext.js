// Contexts/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../Contexts/AuthContext';

const AppContext = createContext();

// Initial state
const initialState = {
  favorites: {
    items: [],
    favoriteCount: 0
  },
  bookmarks: {
    items: [],
    bookmarkedCount: 0
  },
  shortlist: {
    items: [],
    shortlistCount: 0
  },
  user: null,
  listings: [],
  loading: true,
  authError: null
};

// Actions
const ACTION_TYPES = {
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  ADD_TO_BOOKMARKS: 'ADD_TO_BOOKMARKS',
  REMOVE_FROM_BOOKMARKS: 'REMOVE_FROM_BOOKMARKS',
  ADD_TO_SHORTLIST: 'ADD_TO_SHORTLIST',
  REMOVE_FROM_SHORTLIST: 'REMOVE_FROM_SHORTLIST',
  SET_USER: 'SET_USER',
  SET_LISTINGS: 'SET_LISTINGS',
  SET_LOADING: 'SET_LOADING',
  SET_AUTH_ERROR: 'SET_AUTH_ERROR',
  CLEAR_AUTH_ERROR: 'CLEAR_AUTH_ERROR',
  LOGOUT: 'LOGOUT'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.ADD_TO_FAVORITES:
      const existingFavorite = state.favorites.items.find(item => item.id === action.payload.id);
      if (existingFavorite) return state;
      
      return {
        ...state,
        favorites: {
          items: [...state.favorites.items, action.payload],
          favoriteCount: state.favorites.items.length + 1
        }
      };

    case ACTION_TYPES.REMOVE_FROM_FAVORITES:
      const updatedFavorites = state.favorites.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        favorites: {
          items: updatedFavorites,
          favoriteCount: updatedFavorites.length
        }
      };

    case ACTION_TYPES.ADD_TO_BOOKMARKS:
      const existingBookmark = state.bookmarks.items.find(item => item.id === action.payload.id);
      if (existingBookmark) return state;
      
      return {
        ...state,
        bookmarks: {
          items: [...state.bookmarks.items, action.payload],
          bookmarkedCount: state.bookmarks.items.length + 1
        }
      };

    case ACTION_TYPES.REMOVE_FROM_BOOKMARKS:
      const updatedBookmarks = state.bookmarks.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        bookmarks: {
          items: updatedBookmarks,
          bookmarkedCount: updatedBookmarks.length
        }
      };

    case ACTION_TYPES.ADD_TO_SHORTLIST:
      const existingShortlist = state.shortlist.items.find(item => item.id === action.payload.id);
      if (existingShortlist) return state;
      
      return {
        ...state,
        shortlist: {
          items: [...state.shortlist.items, action.payload],
          shortlistCount: state.shortlist.items.length + 1
        }
      };

    case ACTION_TYPES.REMOVE_FROM_SHORTLIST:
      const updatedShortlist = state.shortlist.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        shortlist: {
          items: updatedShortlist,
          shortlistCount: updatedShortlist.length
        }
      };

    case ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: action.payload,
        authError: null,
        loading: false
      };

    case ACTION_TYPES.SET_LISTINGS:
      return {
        ...state,
        listings: action.payload
      };

    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTION_TYPES.SET_AUTH_ERROR:
      return {
        ...state,
        authError: action.payload,
        loading: false
      };

    case ACTION_TYPES.CLEAR_AUTH_ERROR:
      return {
        ...state,
        authError: null
      };

    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        user: null,
        authError: null,
        loading: false
      };

    default:
      return state;
  }
};

// Context Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action functions
  const addToFavorites = (item) => dispatch({ type: ACTION_TYPES.ADD_TO_FAVORITES, payload: item });
  const removeFromFavorites = (itemId) => dispatch({ type: ACTION_TYPES.REMOVE_FROM_FAVORITES, payload: itemId });
  const addToBookmarks = (item) => dispatch({ type: ACTION_TYPES.ADD_TO_BOOKMARKS, payload: item });
  const removeFromBookmarks = (itemId) => dispatch({ type: ACTION_TYPES.REMOVE_FROM_BOOKMARKS, payload: itemId });
  const addToShortlist = (item) => dispatch({ type: ACTION_TYPES.ADD_TO_SHORTLIST, payload: item });
  const removeFromShortlist = (itemId) => dispatch({ type: ACTION_TYPES.REMOVE_FROM_SHORTLIST, payload: itemId });
  const setListings = (listings) => dispatch({ type: ACTION_TYPES.SET_LISTINGS, payload: listings });
  const setLoading = (loading) => dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading });
  const setAuthError = (error) => dispatch({ type: ACTION_TYPES.SET_AUTH_ERROR, payload: error });
  const clearAuthError = () => dispatch({ type: ACTION_TYPES.CLEAR_AUTH_ERROR });

  // Authentication functions
  const setUser = (userData, token = null) => {
    if (token) {
      localStorage.setItem('authToken', token);
    }
    
    const user = userData ? {
      id: userData.id,
      name: userData.username || userData.name,
      email: userData.email,
      isLoggedIn: true,
      ...userData
    } : null;
    
    dispatch({ type: ACTION_TYPES.SET_USER, payload: user });
  };

  const login = async (identifier, password) => {
    setLoading(true);
    clearAuthError();
    
    try {
      const response = await authService.login(identifier, password);
      setUser(response.user, response.jwt);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.error?.message || 'Login failed. Please try again.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    clearAuthError();
    
    try {
      const response = await authService.register(userData);
      setUser(response.user, response.jwt);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.error?.message || 'Registration failed. Please try again.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    clearAuthError();
    
    try {
      const response = await authService.forgotPassword(email);
      setLoading(false);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.error?.message || 'Failed to send reset instructions.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (code, password, passwordConfirmation) => {
    setLoading(true);
    clearAuthError();
    
    try {
      const response = await authService.resetPassword(code, password, passwordConfirmation);
      setLoading(false);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.error?.message || 'Password reset failed.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    dispatch({ type: ACTION_TYPES.LOGOUT });
  };

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          setLoading(true);
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Helper functions to check state - MAINTAINED EXISTING FUNCTIONALITY
  const isFavorite = (itemId) => 
    state.favorites.items.some(item => item.id === itemId);
  
  const isBookmarked = (itemId) => 
    state.bookmarks.items.some(item => item.id === itemId);
  
  const isInShortlist = (itemId) => 
    state.shortlist.items.some(item => item.id === itemId);

  // Toggle functions for easier use - MAINTAINED EXISTING FUNCTIONALITY
  const toggleFavorite = (item) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  const toggleBookmark = (item) => {
    if (isBookmarked(item.id)) {
      removeFromBookmarks(item.id);
    } else {
      addToBookmarks(item);
    }
  };

  const toggleShortlist = (item) => {
    if (isInShortlist(item.id)) {
      removeFromShortlist(item.id);
    } else {
      addToShortlist(item);
    }
  };

  const contextValue = {
    // State
    ...state,
    
    // Original Actions (unchanged)
    addToFavorites,
    removeFromFavorites,
    addToBookmarks,
    removeFromBookmarks,
    addToShortlist,
    removeFromShortlist,
    setListings,
    
    // NEW: Authentication actions
    setUser,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    setLoading,
    setAuthError,
    clearAuthError,
    
    // Helper functions (unchanged)
    isFavorite,
    isBookmarked,
    isInShortlist,
    toggleFavorite,
    toggleBookmark,
    toggleShortlist,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};