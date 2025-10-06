import style from '../../Styles/pages/Accommodations.module.css';
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from "@apollo/client/react";
import {FaHeart, FaRegHeart, FaShoppingCart,FaCartPlus} from 'react-icons/fa';
import { GET_ACCOMMODATIONS_DETAILS } from './Accommodations';
import { useApp } from '../../Contexts/AppContext';

export default function Accommodations() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1000); // Set high to get all data

  const { loading, error, data } = useQuery(GET_ACCOMMODATIONS_DETAILS, {
    variables: {
      pagination: {
        page: currentPage,
        pageSize: pageSize
      }
    },
    pollInterval: 5000,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: false,
  });

  // DEBUG: Check what data we're receiving
  useEffect(() => {
    console.log('=== DEBUG DATA STRUCTURE ===');
    console.log('Full data:', data);
    console.log('Accommodations:', data?.accommodations);
    console.log('Type of accommodations:', typeof data?.accommodations);
    console.log('Is array?', Array.isArray(data?.accommodations));
    if (data?.accommodations) {
      console.log('Number of accommodations:', data.accommodations.length);
      console.log('First accommodation:', data.accommodations[0]);
    }
    console.log('======================');
  }, [data]);

  // FIXED: Use data?.accommodations directly (it's already an array)
  const accommodations = data?.accommodations || [];

  // FIX: Create unique keys for each accommodation
  const accommodationsWithUniqueKeys = useMemo(() => {
    if (!accommodations.length) return [];
    
    const keyCount = {};
    
    return accommodations.map((accommodation, index) => {
      const baseKey = accommodation.documentId || `acc-${index}`;
      
      // If we've seen this key before, add a suffix
      if (keyCount[baseKey]) {
        keyCount[baseKey]++;
        return {
          ...accommodation,
          uniqueKey: `${baseKey}-${keyCount[baseKey]}`
        };
      } else {
        keyCount[baseKey] = 1;
        return {
          ...accommodation,
          uniqueKey: baseKey
        };
      }
    });
  }, [accommodations]);

  const {
    toggleFavorite,
    toggleBookmark,
    toggleShortlist,
    isFavorite,
    isBookmarked,
    isInShortlist,
    favorites
  } = useApp();

  const [recentAction, setRecentAction] = useState(null);
  const [filters, setFilters] = useState({
    distance: '',
    price: '',
    type: '',
    gender: '',
    availability: ''
  });

  const [sortBy, setSortBy] = useState('');

  // Filter and sort accommodations
  const filteredAndSortedAccommodations = useMemo(() => {
    if (!accommodationsWithUniqueKeys || accommodationsWithUniqueKeys.length === 0) {
      console.log('No accommodations available for filtering');
      return [];
    }

    console.log('Filtering', accommodationsWithUniqueKeys.length, 'accommodations');
    
    let filtered = accommodationsWithUniqueKeys.filter(accommodation => {
      const { details, location } = accommodation;
      
      // Distance filter
      if (filters.distance && details?.distance) {
        const distance = parseFloat(details.distance);
        switch (filters.distance) {
          case 'under-1km':
            if (distance > 1) return false;
            break;
          case '1km-3km':
            if (distance < 1 || distance > 3) return false;
            break;
          case 'over-3km':
            if (distance < 3) return false;
            break;
        }
      }

      // Price filter
      if (filters.price && details?.price) {
        const price = parseFloat(details.price);
        switch (filters.price) {
          case 'under-50':
            if (price > 50) return false;
            break;
          case '50-100':
            if (price < 50 || price > 100) return false;
            break;
          case '100-120':
            if (price < 100 || price > 120) return false;
            break;
          case 'over-120':
            if (price < 120) return false;
            break;
          default:
            if (price > 100) return false;
            break;
        }
      }

      // Type filter
      if (filters.type && details?.Category) {
        if (details.Category.toLowerCase() !== filters.type.toLowerCase()) {
          return false;
        }
      }

      // Gender filter
      if (filters.gender && details?.Type) {
        const accommodationGender = details.Type.toLowerCase();
        switch (filters.gender) {
          case 'male':
            if (!accommodationGender.includes('male') && accommodationGender !== 'males only') return false;
            break;
          case 'female':
            if (!accommodationGender.includes('female') && accommodationGender !== 'females only') return false;
            break;
          case 'mixed':
            if (!accommodationGender.includes('mixed')) return false;
            break;
        }
      }

      // Availability filter
      if (filters.availability) {
        const isAvailable = !details?.isFull;
        if (filters.availability === 'available' && !isAvailable) return false;
        if (filters.availability === 'unavailable' && isAvailable) return false;
      }

      return true;
    });

    // Sort accommodations
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price-low-high':
            return (a.details?.price || 0) - (b.details?.price || 0);
          case 'price-high-low':
            return (b.details?.price || 0) - (a.details?.price || 0);
          case 'distance':
            return (a.details?.distance || Infinity) - (b.details?.distance || Infinity);
          case 'name':
            return (a.location?.Address || '').localeCompare(b.location?.Address || '');
          default:
            return 0;
        }
      });
    }

    console.log('After filtering:', filtered.length, 'accommodations');
    return filtered;
  }, [accommodationsWithUniqueKeys, filters, sortBy]);

  // Change page size to get more items at once
  const increasePageSize = () => {
    setPageSize(5000); // Set even higher to ensure we get all data
    setCurrentPage(1);
  };

  // Favorite handler
  const handleFavorite = (accommodation) => {
    const property = {
      id: accommodation.documentId,
      name: accommodation.location?.Address,
      type: 'accommodation',
      details: accommodation.details,
      location: accommodation.location,
      media: accommodation.media
    };
    
    const wasFavorite = isFavorite(accommodation.documentId);
    toggleFavorite(property);
    
    setRecentAction({
      type: 'favorite',
      propertyId: accommodation.documentId,
      propertyName: accommodation.location?.Address,
      isAdded: !wasFavorite
    });
    setTimeout(() => setRecentAction(null), 3000);
  };

  const handleShortlist = (accommodation) => {
    const property = {
      id: accommodation.documentId,
      name: accommodation.location?.Address,
      type: 'accommodation',
      details: accommodation.details,
      location: accommodation.location,
      media: accommodation.media
    };
    
    const wasInShortlist = isInShortlist(accommodation.documentId);
    toggleShortlist(property);
    
    setRecentAction({
      type: 'shortlist',
      propertyId: accommodation.documentId,
      propertyName: accommodation.location?.Address,
      isAdded: !wasInShortlist
    });
    setTimeout(() => setRecentAction(null), 3000);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value === 'all' ? '' : value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      distance: '',
      price: '',
      type: '',
      gender: '',
      availability: ''
    });
    setSortBy('');
  };

  const activeFilterCount = Object.values(filters).filter(value => value !== '').length + (sortBy ? 1 : 0);

  // Show loading state
  if (loading && !data) return <div className="loading">Loading accommodations...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <>
      {/* Action Feedback Toast */}
      {recentAction && (
        <div className={style.toast}>
          {recentAction.isAdded ? '✓ Added to' : '✗ Removed from'} {' '}
          {recentAction.type === 'favorite' && 'Favorites'}
          {recentAction.type === 'shortlist' && 'Shortlist'}
          : {recentAction.propertyName}
        </div>
      )}
      
      <div className={style.AccommodationBody}>
        {/* Pagination Controls - Simplified since we're loading all data */}
        <div className={style.paginationControls}>
          <button onClick={increasePageSize} className={style.loadMoreBtn}>
            Load All Accommodations ({accommodations.length} loaded)
          </button>
          <div className={style.paginationInfo}>
            Showing all {accommodations.length} accommodations
          </div>
        </div>

        {/* Show loading during data fetch */}
        {loading && data && (
          <div className="loading">Loading more accommodations...</div>
        )}

        {/* Filters Section */}
        <div className={style.FiltersSection}>
          <div className={style.FiltersHeader}>
            <h2>Filter Accommodations</h2>
            {activeFilterCount > 0 && (
              <button className={style.clearFilters} onClick={clearAllFilters}>
                Clear All ({activeFilterCount})
              </button>
            )}
          </div>

          <div className={style.FiltersGrid}>
            {/* Distance Filter */}
            <div className={style.FilterGroup}>
              <label>Distance from Campus</label>
              <select 
                value={filters.distance} 
                onChange={(e) => handleFilterChange('distance', e.target.value)}
                className={style.FilterSelect}
              >
                <option value="all">All Distances</option>
                <option value="under-1km">Under 1km</option>
                <option value="1km-3km">1km - 3km</option>
                <option value="over-3km">Over 3km</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className={style.FilterGroup}>
              <label>Monthly Price</label>
              <select 
                value={filters.price} 
                onChange={(e) => handleFilterChange('price', e.target.value)}
                className={style.FilterSelect}
              >
                <option value="all">Any Price</option>
                <option value="under-50">Under $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-120">$100 - $120</option>
                <option value="over-120">Over $120</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className={style.FilterGroup}>
              <label>Accommodation Type</label>
              <select 
                value={filters.type} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className={style.FilterSelect}
              >
                <option value="all">All Types</option>
                <option value="boarding">Boarding</option>
                <option value="family">Family</option>
                <option value="apartment">Apartment</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div className={style.FilterGroup}>
              <label>Gender Preference</label>
              <select 
                value={filters.gender} 
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className={style.FilterSelect}
              >
                <option value="all">Any Gender</option>
                <option value="male">Males Only</option>
                <option value="female">Females Only</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div className={style.FilterGroup}>
              <label>Availability</label>
              <select 
                value={filters.availability} 
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className={style.FilterSelect}
              >
                <option value="all">All</option>
                <option value="available">Available Now</option>
                <option value="unavailable">Currently Full</option>
              </select>
            </div>

            {/* Sort By */}
            <div className={style.FilterGroup}>
              <label>Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={style.FilterSelect}
              >
                <option value="">Default</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="distance">Distance</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className={style.ActiveFilters}>
            {filters.distance && (
              <span className={style.ActiveFilter}>
                Distance: {filters.distance === 'under-1km' ? 'Under 1km' : 
                          filters.distance === '1km-3km' ? '1km-3km' : 'Over 3km'}
                <button onClick={() => handleFilterChange('distance', '')}>×</button>
              </span>
            )}
            {filters.price && (
              <span className={style.ActiveFilter}>
                Price: {filters.price === 'under-50' ? 'Under $50' : 
                       filters.price === '50-100' ? '$50 - $100' :
                       filters.price === '100-120' ? '$100-$120' : 'Over $120'}
                <button onClick={() => handleFilterChange('price', '')}>×</button>
              </span>
            )}
            {filters.type && (
              <span className={style.ActiveFilter}>
                Type: {filters.type}
                <button onClick={() => handleFilterChange('type', '')}>×</button>
              </span>
            )}
            {filters.gender && (
              <span className={style.ActiveFilter}>
                Gender: {filters.gender === 'male' ? 'Males Only' : 
                        filters.gender === 'female' ? 'Females Only' : 'Mixed'}
                <button onClick={() => handleFilterChange('gender', '')}>×</button>
              </span>
            )}
            {filters.availability && (
              <span className={style.ActiveFilter}>
                {filters.availability === 'available' ? 'Available Now' : 'Currently Full'}
                <button onClick={() => handleFilterChange('availability', '')}>×</button>
              </span>
            )}
            {sortBy && (
              <span className={style.ActiveFilter}>
                Sort: {sortBy === 'price-low-high' ? 'Price: Low to High' :
                      sortBy === 'price-high-low' ? 'Price: High to Low' :
                      sortBy === 'distance' ? 'Distance' : 'Name'}
                <button onClick={() => setSortBy('')}>×</button>
              </span>
            )}
          </div>

          {/* Results Count */}
          <div className={style.ResultsCount}>
            Showing {filteredAndSortedAccommodations.length} of {accommodations.length} accommodations
          </div>
        </div>

        {/* Listings - FIXED: Use uniqueKey for the key prop */}
        <section className={style.ListingsGrid}>
          {filteredAndSortedAccommodations.length > 0 ? (
            filteredAndSortedAccommodations.map((accommodation) => {
              const { uniqueKey, documentId, details, location, media } = accommodation;
              const imagePath = media?.CoverImage;
              const imgUrl = imagePath ? `http://localhost:1337${imagePath.url}` : "/placeholder.jpg";

              return (
                <div className={style.PopertyContainer} key={uniqueKey}>
                  <div className={style.ImageContainer}>
                    <Link to={`/Single/${documentId}`} className={style.ImageContainer}>
                      <img
                        src={imgUrl}
                        alt={location?.Address || "Accommodation"}
                        className={style.Image}
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                    </Link>
                    <div className={style.iconsContainer}>
                      <button 
                        className={`${style.iconButton} ${isFavorite(documentId) ? style.active : ''}`}
                        onClick={() => handleFavorite(accommodation)}
                      >
                        {isFavorite(documentId) ? <FaHeart color="red" /> : <FaRegHeart />}
                      </button>

                      <button 
                        className={`${style.iconButton} ${isInShortlist(documentId) ? style.active : ''}`}
                        onClick={() => handleShortlist(accommodation)}
                      >
                        {isInShortlist(documentId) ? <FaShoppingCart color="green" /> : <FaCartPlus />}
                      </button>
                    </div>
                  </div>

                  <div className={style.InfoContainer}>
                    <div className={style.InfoRow}>
                      <span className={style.Label}>Address</span>
                      <span className={style.Value}>{location?.Address}</span>
                    </div>
                    <div className={style.InfoRow}>
                      <span className={style.Label}>Price</span>
                      <span className={style.Value}>${details?.price} USD</span>
                    </div>
                    <div className={style.InfoRow}>
                      <span className={style.Label}>Available</span>
                      <span className={style.Value}>{details?.isFull ? "No" : "Yes"}</span>
                    </div>
                    <div className={style.InfoRow}>
                      <span className={style.Label}>Gender</span>
                      <span className={style.Value}>{details?.Type}</span>
                    </div>
                    {details?.distance && (
                      <div className={style.InfoRow}>
                        <span className={style.Label}>Distance</span>
                        <span className={style.Value}>{details.distance}km from campus</span>
                      </div>
                    )}
                    <Link to={`/Single/${documentId}`} className={style.submit}>
                      <button className={style.submit}>
                        View Accommodation
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={style.NoResults}>
              <h3>No accommodations found</h3>
              <p>Try adjusting your filters to see more results.</p>
              <button onClick={clearAllFilters} className={style.clearFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}