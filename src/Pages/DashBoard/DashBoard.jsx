import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import style from '../../Styles/pages/DashBoard.module.css';
import { 
  FaHome, 
  FaHeart, 
  FaBookmark, 
  FaShoppingCart, 
  FaEye, 
  FaUser,
  FaDollarSign,
  FaChartLine,
  FaCalendarAlt,
  FaCog,
  FaBell,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaBookmark as FaBookmarkSolid
} from 'react-icons/fa';
import { useApp } from '../../Contexts/AppContext';

export default function Dashboard() {
  const { user, favorites, bookmarks, shortlist, listings } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentActivity, setRecentActivity] = useState([]);
  const [userStats, setUserStats] = useState({
    totalViews: 0,
    totalFavorites: 0,
    totalBookmarks: 0,
    totalShortlists: 0,
    activeListings: 0,
    pendingListings: 0
  });

  // Helper function to get property display data
  const getPropertyData = (property) => {
    console.log('Processing property in dashboard:', property);
    
    // Handle properties with accommodation structure
    if (property.details || property.location) {
      return {
        id: property.id,
        title: property.name || property.location?.Address || 'Untitled Property',
        location: property.location?.Address || 'Location not specified',
        price: property.details?.price || property.price || 'N/A',
        bedrooms: property.details?.Bedrooms || property.bedrooms || '0',
        bathrooms: property.details?.Bathrooms || property.bathrooms || '0',
        area: property.details?.Area || property.area || 'N/A',
        image: property.media?.CoverImage?.url 
          ? `http://localhost:1337${property.media.CoverImage.url}`
          : property.image || '/default-property.jpg',
        isAvailable: !(property.details?.isFull || property.isFull),
        views: property.views || Math.floor(Math.random() * 100),
        favorites: property.favorites || Math.floor(Math.random() * 20),
        type: property.type || 'accommodation'
      };
    }
    
    // Fallback for other item structures
    return {
      id: property.id || 'no-id',
      title: property.title || property.name || 'Untitled Property',
      location: property.location?.Address || property.location || 'Location not specified',
      price: property.price || 'N/A',
      bedrooms: property.bedrooms || '0',
      bathrooms: property.bathrooms || '0',
      area: property.area || 'N/A',
      image: property.image || '/default-property.jpg',
      isAvailable: true,
      views: property.views || Math.floor(Math.random() * 100),
      favorites: property.favorites || Math.floor(Math.random() * 20),
      type: property.type || 'property'
    };
  };

  // Generate recent activity from user actions
  useEffect(() => {
    const activities = [];
    const now = new Date();
    
    // Add favorites activity
    if (favorites?.items && favorites.items.length > 0) {
      const recentFav = favorites.items[0];
      const propertyData = getPropertyData(recentFav);
      activities.push({
        id: `fav-${recentFav.id}`,
        type: 'favorite',
        property: propertyData.title,
        time: 'Recently',
        icon: <FaHeart />,
        color: '#e74c3c'
      });
    }
    
    // Add shortlist activity
    if (shortlist?.items && shortlist.items.length > 0) {
      const recentShortlist = shortlist.items[0];
      const propertyData = getPropertyData(recentShortlist);
      activities.push({
        id: `shortlist-${recentShortlist.id}`,
        type: 'shortlist',
        property: propertyData.title,
        time: 'Recently',
        icon: <FaShoppingCart />,
        color: '#9b59b6'
      });
    }
    
    // Add bookmarks activity
    if (bookmarks?.items && bookmarks.items.length > 0) {
      const recentBookmark = bookmarks.items[0];
      const propertyData = getPropertyData(recentBookmark);
      activities.push({
        id: `bookmark-${recentBookmark.id}`,
        type: 'bookmark',
        property: propertyData.title,
        time: 'Recently',
        icon: <FaBookmarkSolid />,
        color: '#3498db'
      });
    }
    
    // Add some mock activities if no real data
    if (activities.length === 0) {
      activities.push(
        {
          id: 'mock-1',
          type: 'view',
          property: 'Start browsing properties',
          time: 'Just now',
          icon: <FaEye />,
          color: '#3498db'
        },
        {
          id: 'mock-2',
          type: 'favorite',
          property: 'Add properties to favorites',
          time: 'Today',
          icon: <FaHeart />,
          color: '#e74c3c'
        }
      );
    }
    
    setRecentActivity(activities.slice(0, 4));
  }, [favorites, shortlist, bookmarks]);

  // Calculate real-time stats
  useEffect(() => {
    const userListings = listings || [];
    
    const calculatedStats = {
      totalViews: userListings.reduce((sum, listing) => sum + (listing.views || 0), 0),
      totalFavorites: favorites?.items?.length || 0,
      totalBookmarks: bookmarks?.items?.length || 0,
      totalShortlists: shortlist?.items?.length || 0,
      activeListings: userListings.filter(l => l.status === 'active').length,
      pendingListings: userListings.filter(l => l.status === 'pending').length
    };
    
    setUserStats(calculatedStats);
  }, [favorites, bookmarks, shortlist, listings]);

  // Real quick stats from user data
  const quickStats = [
    {
      title: 'Total Views',
      value: userStats.totalViews.toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: <FaEye />,
      color: '#3498db'
    },
    {
      title: 'Favorites',
      value: userStats.totalFavorites,
      change: favorites?.items?.length > 0 ? '+5%' : '+0%',
      trend: favorites?.items?.length > 0 ? 'up' : 'neutral',
      icon: <FaHeart />,
      color: '#e74c3c'
    },
    {
      title: 'Shortlists',
      value: userStats.totalShortlists,
      change: shortlist?.items?.length > 0 ? '+3%' : '+0%',
      trend: shortlist?.items?.length > 0 ? 'up' : 'neutral',
      icon: <FaShoppingCart />,
      color: '#9b59b6'
    },
    {
      title: 'Active Listings',
      value: userStats.activeListings,
      change: userStats.activeListings > 0 ? '+2%' : '+0%',
      trend: userStats.activeListings > 0 ? 'up' : 'neutral',
      icon: <FaHome />,
      color: '#27ae60'
    }
  ];

  // User's listings data (you'll need to implement this in your context)
  const userListings = listings || [
    {
      id: 1,
      title: 'Modern Studio Near Campus',
      status: 'active',
      price: 1200,
      views: 156,
      favorites: 12,
      date: '2024-01-15',
      image: '/default-property.jpg',
      details: { Bedrooms: 1, Bathrooms: 1 }
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', color: '#27ae60', icon: <FaCheckCircle /> },
      pending: { label: 'Pending', color: '#f39c12', icon: <FaClock /> },
      rejected: { label: 'Rejected', color: '#e74c3c', icon: <FaExclamationTriangle /> }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span 
        className={style.statusBadge}
        style={{ backgroundColor: config.color }}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className={style.Dashboard}>
      {/* Header */}
      <div className={style.dashboardHeader}>
        <div className={style.headerContent}>
          <h1>Welcome back, {user?.name || 'Student'}!</h1>
          <p>Manage your property searches and listings in one place.</p>
        </div>
        <div className={style.headerActions}>
          <Link to="/listings/create" className={style.primaryButton}>
            <FaPlus />
            Add New Property
          </Link>
          <button className={style.iconButton}>
            <FaBell />
          </button>
          <button className={style.iconButton}>
            <FaCog />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={style.tabNavigation}>
        <button 
          className={`${style.tab} ${activeTab === 'overview' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine />
          Overview
        </button>
        <button 
          className={`${style.tab} ${activeTab === 'listings' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          <FaHome />
          My Listings
        </button>
        <button 
          className={`${style.tab} ${activeTab === 'saved' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <FaHeart />
          Saved Items
        </button>
        <button 
          className={`${style.tab} ${activeTab === 'analytics' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaDollarSign />
          Analytics
        </button>
      </div>

      {/* Main Content */}
      <div className={style.dashboardContent}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={style.overviewGrid}>
            {/* Quick Stats */}
            <div className={style.statsGrid}>
              {quickStats.map((stat, index) => (
                <div key={index} className={style.statCard}>
                  <div className={style.statIcon} style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className={style.statInfo}>
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                  </div>
                  <div className={`${style.statChange} ${style[stat.trend]}`}>
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className={style.activityCard}>
              <h2>Recent Activity</h2>
              <div className={style.activityList}>
                {recentActivity.map(activity => (
                  <div key={activity.id} className={style.activityItem}>
                    <div 
                      className={style.activityIcon}
                      style={{ backgroundColor: activity.color }}
                    >
                      {activity.icon}
                    </div>
                    <div className={style.activityDetails}>
                      <p>
                        You {activity.type}ed <strong>{activity.property}</strong>
                      </p>
                      <span className={style.activityTime}>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Listings Preview */}
            <div className={style.listingsPreview}>
              <div className={style.sectionHeader}>
                <h2>My Listings</h2>
                <Link to="/dashboard/listings" className={style.viewAllLink}>
                  View All
                </Link>
              </div>
              <div className={style.listingsGrid}>
                {userListings.slice(0, 2).map(listing => {
                  const propertyData = getPropertyData(listing);
                  return (
                    <div key={listing.id} className={style.listingCard}>
                      <div className={style.listingImage}>
                        <img src={propertyData.image} alt={propertyData.title} />
                        {getStatusBadge(listing.status)}
                      </div>
                      <div className={style.listingInfo}>
                        <h3>{propertyData.title}</h3>
                        <div className={style.listingPrice}>${propertyData.price}/month</div>
                        <div className={style.listingStats}>
                          <span>👁️ {propertyData.views} views</span>
                          <span>❤️ {propertyData.favorites} favorites</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {userListings.length === 0 && (
                  <div className={style.emptyListings}>
                    <FaHome />
                    <p>No listings yet</p>
                    <Link to="/listings/create" className={style.createLink}>
                      Create Your First Listing
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={style.quickActions}>
              <h2>Quick Actions</h2>
              <div className={style.actionGrid}>
                <Link to="/listings/create" className={style.actionCard}>
                  <FaPlus />
                  <span>Add Property</span>
                </Link>
                <Link to="/saved" className={style.actionCard}>
                  <FaHeart />
                  <span>View Saved</span>
                </Link>
                <Link to="/listings" className={style.actionCard}>
                  <FaSearch />
                  <span>Browse Properties</span>
                </Link>
                <Link to="/profile" className={style.actionCard}>
                  <FaUser />
                  <span>Edit Profile</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className={style.listingsTab}>
            <div className={style.tabHeader}>
              <h2>My Property Listings</h2>
              <Link to="/listings/create" className={style.primaryButton}>
                <FaPlus />
                Add New Property
              </Link>
            </div>

            <div className={style.listingsTable}>
              <div className={style.tableHeader}>
                <span>Property</span>
                <span>Status</span>
                <span>Price</span>
                <span>Views</span>
                <span>Favorites</span>
                <span>Date</span>
                <span>Actions</span>
              </div>
              
              {userListings.length > 0 ? (
                userListings.map(listing => {
                  const propertyData = getPropertyData(listing);
                  return (
                    <div key={listing.id} className={style.tableRow}>
                      <div className={style.propertyCell}>
                        <img src={propertyData.image} alt={propertyData.title} />
                        <div className={style.propertyInfo}>
                          <h4>{propertyData.title}</h4>
                          <span className={style.propertyMeta}>
                            {propertyData.bedrooms} beds • {propertyData.bathrooms} baths
                          </span>
                        </div>
                      </div>
                      <div className={style.statusCell}>
                        {getStatusBadge(listing.status)}
                      </div>
                      <div className={style.priceCell}>${propertyData.price}</div>
                      <div className={style.viewsCell}>{propertyData.views}</div>
                      <div className={style.favoritesCell}>{propertyData.favorites}</div>
                      <div className={style.dateCell}>
                        {new Date(listing.date).toLocaleDateString()}
                      </div>
                      <div className={style.actionsCell}>
                        <button className={style.actionBtn} title="Edit">
                          <FaEdit />
                        </button>
                        <button className={style.actionBtn} title="Delete">
                          <FaTrash />
                        </button>
                        <button className={style.actionBtn} title="View">
                          <FaEye />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={style.emptyTable}>
                  <FaHome />
                  <h3>No listings yet</h3>
                  <p>Start by creating your first property listing</p>
                  <Link to="/listings/create" className={style.primaryButton}>
                    <FaPlus />
                    Create Listing
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Items Tab */}
        {activeTab === 'saved' && (
          <div className={style.savedTab}>
            <div className={style.tabHeader}>
              <h2>Your Saved Properties</h2>
              <div className={style.savedStats}>
                <span>{userStats.totalFavorites} Favorites</span>
                <span>{userStats.totalBookmarks} Bookmarks</span>
                <span>{userStats.totalShortlists} Shortlisted</span>
              </div>
            </div>

            <div className={style.savedGrid}>
              {/* Favorites Section */}
              <div className={style.savedSection}>
                <h3>
                  <FaHeart />
                  Favorite Properties ({userStats.totalFavorites})
                </h3>
                <div className={style.propertiesGrid}>
                  {favorites?.items?.slice(0, 3).map(item => {
                    const property = getPropertyData(item);
                    return (
                      <div key={property.id} className={style.propertyCard}>
                        <div className={style.propertyImage}>
                          <img 
                            src={property.image} 
                            alt={property.title}
                            onError={(e) => {
                              e.target.src = '/default-property.jpg';
                            }}
                          />
                          <div className={style.favoriteBadge}>
                            <FaHeart />
                          </div>
                        </div>
                        <div className={style.propertyInfo}>
                          <h4>{property.title}</h4>
                          <p>{property.location}</p>
                          <div className={style.propertyPrice}>${property.price}/month</div>
                          <div className={style.propertyFeatures}>
                            <span><FaBed /> {property.bedrooms} beds</span>
                            <span><FaBath /> {property.bathrooms} baths</span>
                          </div>
                          <div className={style.propertyMeta}>
                            <span className={property.isAvailable ? style.available : style.notAvailable}>
                              {property.isAvailable ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {userStats.totalFavorites === 0 && (
                  <div className={style.emptyState}>
                    <FaHeart />
                    <p>No favorite properties yet</p>
                    <Link to="/listings" className={style.browseLink}>
                      Browse Properties
                    </Link>
                  </div>
                )}
                {userStats.totalFavorites > 3 && (
                  <Link to="/saved?tab=favorites" className={style.viewAllLink}>
                    View All Favorites →
                  </Link>
                )}
              </div>

              {/* Shortlist Section */}
              <div className={style.savedSection}>
                <h3>
                  <FaShoppingCart />
                  Shortlisted Properties ({userStats.totalShortlists})
                </h3>
                <div className={style.propertiesGrid}>
                  {shortlist?.items?.slice(0, 3).map(item => {
                    const property = getPropertyData(item);
                    return (
                      <div key={property.id} className={style.propertyCard}>
                        <div className={style.propertyImage}>
                          <img 
                            src={property.image} 
                            alt={property.title}
                            onError={(e) => {
                              e.target.src = '/default-property.jpg';
                            }}
                          />
                          <div className={style.shortlistBadge}>
                            <FaShoppingCart />
                          </div>
                        </div>
                        <div className={style.propertyInfo}>
                          <h4>{property.title}</h4>
                          <p>{property.location}</p>
                          <div className={style.propertyPrice}>${property.price}/month</div>
                          <div className={style.propertyFeatures}>
                            <span><FaBed /> {property.bedrooms} beds</span>
                            <span><FaBath /> {property.bathrooms} baths</span>
                          </div>
                          <div className={style.propertyMeta}>
                            <span className={property.isAvailable ? style.available : style.notAvailable}>
                              {property.isAvailable ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {userStats.totalShortlists === 0 && (
                  <div className={style.emptyState}>
                    <FaShoppingCart />
                    <p>No shortlisted properties yet</p>
                    <Link to="/listings" className={style.browseLink}>
                      Browse Properties
                    </Link>
                  </div>
                )}
                {userStats.totalShortlists > 3 && (
                  <Link to="/saved?tab=shortlist" className={style.viewAllLink}>
                    View All Shortlisted →
                  </Link>
                )}
              </div>

              {/* Bookmarks Section */}
              <div className={style.savedSection}>
                <h3>
                  <FaBookmarkSolid />
                  Bookmarked Properties ({userStats.totalBookmarks})
                </h3>
                <div className={style.propertiesGrid}>
                  {bookmarks?.items?.slice(0, 3).map(item => {
                    const property = getPropertyData(item);
                    return (
                      <div key={property.id} className={style.propertyCard}>
                        <div className={style.propertyImage}>
                          <img 
                            src={property.image} 
                            alt={property.title}
                            onError={(e) => {
                              e.target.src = '/default-property.jpg';
                            }}
                          />
                          <div className={style.bookmarkBadge}>
                            <FaBookmarkSolid />
                          </div>
                        </div>
                        <div className={style.propertyInfo}>
                          <h4>{property.title}</h4>
                          <p>{property.location}</p>
                          <div className={style.propertyPrice}>${property.price}/month</div>
                          <div className={style.propertyFeatures}>
                            <span><FaBed /> {property.bedrooms} beds</span>
                            <span><FaBath /> {property.bathrooms} baths</span>
                          </div>
                          <div className={style.propertyMeta}>
                            <span className={property.isAvailable ? style.available : style.notAvailable}>
                              {property.isAvailable ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {userStats.totalBookmarks === 0 && (
                  <div className={style.emptyState}>
                    <FaBookmarkSolid />
                    <p>No bookmarked properties yet</p>
                    <Link to="/listings" className={style.browseLink}>
                      Browse Properties
                    </Link>
                  </div>
                )}
                {userStats.totalBookmarks > 3 && (
                  <Link to="/saved?tab=bookmarks" className={style.viewAllLink}>
                    View All Bookmarks →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className={style.analyticsTab}>
            <div className={style.tabHeader}>
              <h2>Property Analytics</h2>
              <div className={style.analyticsPeriod}>
                <select>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
            </div>

            <div className={style.analyticsGrid}>
              <div className={style.analyticsCard}>
                <h3>Performance Overview</h3>
                <div className={style.performanceStats}>
                  <div className={style.performanceItem}>
                    <span>Total Views</span>
                    <strong>{userStats.totalViews.toLocaleString()}</strong>
                    <span className={style.positive}>+12%</span>
                  </div>
                  <div className={style.performanceItem}>
                    <span>Total Favorites</span>
                    <strong>{userStats.totalFavorites}</strong>
                    <span className={userStats.totalFavorites > 0 ? style.positive : style.neutral}>
                      {userStats.totalFavorites > 0 ? '+5%' : '+0%'}
                    </span>
                  </div>
                  <div className={style.performanceItem}>
                    <span>Engagement Rate</span>
                    <strong>{userStats.totalViews > 0 ? '8.5%' : '0%'}</strong>
                    <span className={userStats.totalViews > 0 ? style.positive : style.neutral}>
                      {userStats.totalViews > 0 ? '+2.1%' : '+0%'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={style.analyticsCard}>
                <h3>Top Performing Properties</h3>
                <div className={style.topListings}>
                  {favorites?.items?.slice(0, 3).map((item, index) => {
                    const property = getPropertyData(item);
                    return (
                      <div key={property.id} className={style.topListing}>
                        <span className={style.rank}>{index + 1}</span>
                        <div className={style.listingInfo}>
                          <h4>{property.title}</h4>
                          <span>{property.views} views</span>
                        </div>
                        <div className={style.listingStats}>
                          <span>❤️ {property.favorites}</span>
                        </div>
                      </div>
                    );
                  })}
                  {(!favorites?.items || favorites.items.length === 0) && (
                    <div className={style.emptyAnalytics}>
                      <p>No favorite properties yet</p>
                      <span>Start saving properties to see analytics</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}