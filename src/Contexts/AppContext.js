// Contexts/AppContext.js
import React, { createContext, useContext, useReducer } from 'react';

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
  listings: []
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
  SET_LISTINGS: 'SET_LISTINGS'
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
        user: action.payload
      };

    case ACTION_TYPES.SET_LISTINGS:
      return {
        ...state,
        listings: action.payload
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
  const setUser = (user) => dispatch({ type: ACTION_TYPES.SET_USER, payload: user });
  const setListings = (listings) => dispatch({ type: ACTION_TYPES.SET_LISTINGS, payload: listings });

  // Helper functions to check state - FIXED: Use documentId for accommodations
  const isFavorite = (itemId) => 
    state.favorites.items.some(item => item.id === itemId);
  
  const isBookmarked = (itemId) => 
    state.bookmarks.items.some(item => item.id === itemId);
  
  const isInShortlist = (itemId) => 
    state.shortlist.items.some(item => item.id === itemId);

  // Toggle functions for easier use
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
    
    // Actions
    addToFavorites,
    removeFromFavorites,
    addToBookmarks,
    removeFromBookmarks,
    addToShortlist,
    removeFromShortlist,
    setUser,
    setListings,
    
    // Helper functions
    isFavorite,
    isBookmarked,
    isInShortlist,
    toggleFavorite,
    toggleBookmark,
    toggleShortlist, // Added for consistency
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