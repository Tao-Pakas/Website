import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import style from '../../Styles/pages/SavedPage.module.css';
import { FaShoppingCart, FaTrash, FaEye, FaSearch, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import { useApp } from '../../Contexts/AppContext';

export default function SavedPage() {
  const { shortlist, removeFromShortlist } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Debug effect to see what's in context
  useEffect(() => {
    console.log('=== SAVED PAGE DEBUG ===');
    console.log('Shortlist:', shortlist);
    console.log('======================');
  }, [shortlist]);

  // Simple property data function
  const getPropertyData = (item) => {
    console.log('Processing item:', item);
    
    // Handle shortlist items with accommodation structure
    if (item.details || item.location) {
      return {
        id: item.id,
        title: item.name || item.location?.Address || 'Unknown Property',
        location: item.location?.Address || 'Location not specified',
        price: item.details?.price || 'N/A',
        bedrooms: item.details?.Bedrooms || '0',
        bathrooms: item.details?.Bathrooms || '0',
        area: item.details?.Area || 'N/A',
        image: item.media?.CoverImage?.url 
          ? `http://localhost:1337${item.media.CoverImage.url}`
          : '/default-property.jpg',
        isAvailable: !item.details?.isFull,
        addedDate: item.addedDate || new Date().toISOString()
      };
    }
    
    // Fallback for other item structures
    return {
      id: item.id || 'no-id',
      title: item.title || item.name || 'Unknown Property',
      location: item.location?.Address || 'Location not specified',
      price: item.price || 'N/A',
      bedrooms: item.bedrooms || '0',
      bathrooms: item.bathrooms || '0',
      area: item.area || 'N/A',
      image: item.image || '/default-property.jpg',
      isAvailable: true,
      addedDate: item.addedDate || new Date().toISOString()
    };
  };

  const filterItems = (items) => {
    if (!items || !Array.isArray(items)) {
      console.log('No items array found');
      return [];
    }
    
    return items.filter(item => {
      const property = getPropertyData(item);
      const searchLower = searchTerm.toLowerCase();
      return (
        property.title.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower) ||
        property.price.toString().includes(searchTerm)
      );
    });
  };

  const getActiveItems = () => {
    const items = shortlist?.items || [];
    console.log('Shortlist items:', items);
    return filterItems(items);
  };

  const handleRemoveItem = (itemId) => {
    removeFromShortlist(itemId);
  };

  const handleClearAll = () => {
    const activeItems = getActiveItems();
    if (activeItems.length === 0) return;
    
    if (window.confirm('Are you sure you want to remove all items from your shortlist?')) {
      activeItems.forEach(item => {
        const propertyId = item.id;
        handleRemoveItem(propertyId);
      });
    }
  };

  const activeItems = getActiveItems();

  // Debug view to see what's happening
  if (!shortlist) {
    return (
      <div className={style.SavedPage}>
        <div className={style.error}>
          <h2>Context Not Loaded</h2>
          <p>The application context is not available. Make sure you're wrapped in AppProvider.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={style.SavedPage}>
      <div className={style.header}>
        <h1>Your Shortlist</h1>
        <p>Properties you're considering for your next home</p>
        
        {/* Debug info */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <strong>Shortlist Count:</strong> {shortlist?.items?.length || 0} items
        </div>
      </div>

      {/* Search Bar */}
      <div className={style.searchSection}>
        <div className={style.searchContainer}>
          <FaSearch className={style.searchIcon} />
          <input
            type="text"
            placeholder="Search your shortlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={style.searchInput}
          />
        </div>
        <div className={style.resultsCount}>
          {activeItems.length} {activeItems.length === 1 ? 'item' : 'items'} found
        </div>
      </div>

      {/* Items Grid */}
      <div className={style.itemsGrid}>
        {activeItems.length > 0 ? (
          activeItems.map((item, index) => {
            const property = getPropertyData(item);
            
            return (
              <div key={property.id || index} className={style.itemCard}>
                <div className={style.itemImage}>
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className={style.propertyImage}
                    onError={(e) => {
                      e.target.src = '/default-property.jpg';
                    }}
                  />
                  <div className={style.itemActions}>
                    <button 
                      className={style.actionBtn}
                      onClick={() => handleRemoveItem(property.id)}
                      aria-label="Remove from shortlist"
                    >
                      <FaTrash />
                    </button>
                    <Link 
                      to={`/property/${property.id}`}
                      className={style.actionBtn}
                      aria-label="View property details"
                    >
                      <FaEye />
                    </Link>
                  </div>
                  <div className={style.itemBadge}>
                    <FaShoppingCart />
                  </div>
                </div>
                
                <div className={style.itemDetails}>
                  <h3 className={style.itemTitle}>{property.title}</h3>
                  <p className={style.itemLocation}>{property.location}</p>
                  <div className={style.itemPrice}>${property.price}/month</div>
                  
                  <div className={style.itemFeatures}>
                    <span><FaBed /> {property.bedrooms} beds</span>
                    <span><FaBath /> {property.bathrooms} baths</span>
                    <span><FaRulerCombined /> {property.area} sqft</span>
                  </div>
                  
                  <div className={style.itemMeta}>
                    <span className={style.itemDate}>
                      Added recently
                    </span>
                    <span className={`${style.availability} ${
                      property.isAvailable ? style.available : style.notAvailable
                    }`}>
                      {property.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>

                  <div className={style.itemActionsFooter}>
                    <Link 
                      to={`/property/${property.id}`}
                      className={style.viewDetailsBtn}
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleRemoveItem(property.id)}
                      className={style.removeBtn}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={style.emptyState}>
            <div className={style.emptyIcon}>
              <FaShoppingCart />
            </div>
            <h3>No properties in your shortlist yet</h3>
            <p>
              Properties you're considering will appear here. Start browsing and add some properties to your shortlist!
            </p>
            <Link to="/listings" className={style.browseButton}>
              Browse Properties
            </Link>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {activeItems.length > 0 && (
        <div className={style.bulkActions}>
          <button 
            className={style.clearAllBtn}
            onClick={handleClearAll}
          >
            <FaTrash />
            Clear All Shortlist
          </button>
        </div>
      )}
    </div>
  );
}