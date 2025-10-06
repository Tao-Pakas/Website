// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  }, [key, value]);

  return [value, setValue];
};

// hooks/useFavorites.js
export const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage('favorites', {});

  const toggleFavorite = (propertyId) => {
    setFavorites(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  const isFavorite = (propertyId) => !!favorites[propertyId];
  
  const favoriteCount = Object.values(favorites).filter(Boolean).length;

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    favoriteCount
  };
};

// hooks/useBookmarks.js
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useLocalStorage('bookmarks', {});

  const toggleBookmark = (propertyId) => {
    setBookmarks(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  const isBookmarked = (propertyId) => !!bookmarks[propertyId];
  
  const bookmarkedCount = Object.values(bookmarks).filter(Boolean).length;

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
    bookmarkedCount
  };
};

// hooks/useShortlist.js
export const useShortlist = () => {
  const [shortlist, setShortlist] = useLocalStorage('shortlist', []);

  const addToShortlist = (property) => {
    setShortlist(prev => {
      const exists = prev.find(item => item.id === property.id);
      if (exists) return prev; // Already in shortlist
      return [...prev, property];
    });
  };

  const removeFromShortlist = (propertyId) => {
    setShortlist(prev => prev.filter(item => item.id !== propertyId));
  };

  const isInShortlist = (propertyId) => 
    shortlist.some(item => item.id === propertyId);

  const shortlistCount = shortlist.length;

  return {
    shortlist,
    addToShortlist,
    removeFromShortlist,
    isInShortlist,
    shortlistCount
  };
};