import React, { useEffect } from 'react';
import { useApp } from '../../Contexts/AppContext';
import { FaHeart, FaEye, FaTrash, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import style from '../../Styles/pages/Favourites.module.css';

export default function Favorites() {
  const { favorites, removeFromFavorites } = useApp();

  // Debug effect to see what's in favorites
  useEffect(() => {
    console.log('=== FAVORITES DEBUG ===');
    console.log('Favorites data:', favorites);
    console.log('Favorites items:', favorites?.items);
    console.log('======================');
  }, [favorites]);

  // Safe access to favorites
  const favoriteProperties = favorites?.items || [];

  const handleRemoveFavorite = (propertyId) => {
    removeFromFavorites(propertyId);
  };

  // Enhanced helper function to get property display data
  const getPropertyData = (property) => {
    console.log('Processing favorite property:', property);
    
    // Handle favorites with accommodation structure (from shortlist approach)
    if (property.details || property.location) {
      const imageUrl = property.media?.CoverImage?.url 
        ? `http://localhost:1337${property.media.CoverImage.url}`
        : property.media?.url 
        ? `http://localhost:1337${property.media.url}`
        : '/default-property.jpg';
      
      return {
        id: property.id,
        title: property.name || property.location?.Address || 'Unknown Property',
        location: property.location?.Address || property.location || 'Location not specified',
        price: property.details?.price || property.price || 'N/A',
        bedrooms: property.details?.Bedrooms || property.bedrooms || '0',
        bathrooms: property.details?.Bathrooms || property.bathrooms || '0',
        area: property.details?.Area || property.area || 'N/A',
        image: imageUrl,
        isAvailable: !(property.details?.isFull || property.isFull)
      };
    }
    
    // Fallback for other item structures
    return {
      id: property.id || 'no-id',
      title: property.title || property.name || 'Unknown Property',
      location: property.location?.Address || property.location || 'Location not specified',
      price: property.price || 'N/A',
      bedrooms: property.bedrooms || property.details?.Bedrooms || '0',
      bathrooms: property.bathrooms || property.details?.Bathrooms || '0',
      area: property.area || property.details?.Area || 'N/A',
      image: property.image || property.media?.url || '/default-property.jpg',
      isAvailable: !property.details?.isFull
    };
  };

  return (
    <div className={style.container}>
      <div className={style.header}>
        <h1>My Favorites</h1>
        <p>Properties you've liked and saved for later</p>
        
        {/* Debug info */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <strong>Debug Info:</strong> 
          Favorites Count: {favoriteProperties.length} items
        </div>
      </div>

      <div className={style.favoritesGrid}>
        {favoriteProperties.length === 0 ? (
          <div className={style.emptyState}>
            <FaHeart className={style.emptyIcon} />
            <h3>No favorites yet</h3>
            <p>Start browsing properties and add them to your favorites!</p>
            <Link to="/listings" className={style.browseButton}>
              Browse Properties
            </Link>
          </div>
        ) : (
          favoriteProperties.map((property, index) => {
            const propertyData = getPropertyData(property);
            console.log(`Rendering property ${index}:`, propertyData);
            
            return (
              <div key={propertyData.id || index} className={style.propertyCard}>
                <div className={style.propertyImage}>
                  <img 
                    src={propertyData.image} 
                    alt={propertyData.title}
                    onError={(e) => {
                      console.log('Image failed to load:', propertyData.image);
                      e.target.src = '/default-property.jpg';
                    }}
                    onLoad={() => console.log('Image loaded successfully:', propertyData.image)}
                  />
                  <div className={style.propertyActions}>
                    <button 
                      onClick={() => handleRemoveFavorite(propertyData.id)}
                      className={style.removeButton}
                      aria-label="Remove from favorites"
                    >
                      <FaTrash />
                    </button>
                    <Link 
                      to={`/property/${propertyData.id}`}
                      className={style.viewButton}
                      aria-label="View property details"
                    >
                      <FaEye />
                    </Link>
                  </div>
                  <div className={style.favoriteBadge}>
                    <FaHeart />
                  </div>
                </div>
                
                <div className={style.propertyDetails}>
                  <h3 className={style.propertyTitle}>
                    {propertyData.title}
                  </h3>
                  
                  <p className={style.propertyLocation}>
                    {propertyData.location}
                  </p>
                  
                  <div className={style.propertyPrice}>
                    ${propertyData.price}/month
                  </div>
                  
                  <div className={style.propertyFeatures}>
                    <span>
                      <FaBed /> 
                      {propertyData.bedrooms} beds
                    </span>
                    <span>
                      <FaBath /> 
                      {propertyData.bathrooms} baths
                    </span>
                    <span>
                      <FaRulerCombined /> 
                      {propertyData.area} sqft
                    </span>
                  </div>
                  
                  <div className={style.propertyMeta}>
                    <span className={`${style.availability} ${
                      propertyData.isAvailable ? style.available : style.notAvailable
                    }`}>
                      {propertyData.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>

                  <div className={style.propertyActionsFooter}>
                    <Link 
                      to={`/property/${propertyData.id}`}
                      className={style.viewDetailsBtn}
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleRemoveFavorite(propertyData.id)}
                      className={style.removeFavBtn}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bulk Actions */}
      {favoriteProperties.length > 0 && (
        <div className={style.bulkActions}>
          <button 
            className={style.clearAllBtn}
            onClick={() => {
              if (window.confirm('Are you sure you want to remove all favorites?')) {
                favoriteProperties.forEach(property => removeFromFavorites(property.id));
              }
            }}
          >
            <FaTrash />
            Clear All Favorites
          </button>
        </div>
      )}
    </div>
  );
}