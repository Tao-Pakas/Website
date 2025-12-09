import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import style from '../../Styles/pages/DashBoard.module.css';
import { 
  FaHeart, FaShoppingCart, FaEye, FaUser,
  FaChartLine, FaSearch, FaBed, FaBath,
  FaMapMarkerAlt, FaEnvelope, FaCheckCircle, 
  FaBell, FaThumbsUp, FaPhone,
  FaCartPlus
} from 'react-icons/fa';
import { useApp } from '../../Contexts/AppContext';
import { useAuth } from '../../Contexts/AuthContext';

/**
 * Student Dashboard Component
 * Main dashboard for students to manage their property searches, shortlists, and inquiries
 */
export default function Dashboard() {
  // Context hooks for user data and application state
  const { user, shortlist, userInquiries, refreshInquiries, getLikedProperties } = useApp();
  const { getUserRole } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview'); // Currently active tab
  const [recentActivity, setRecentActivity] = useState([]); // Recent user activities
  const [userStats, setUserStats] = useState({
    totalShortlists: 0,     // Number of properties in shortlist
    propertiesViewed: 0,    // Estimated properties viewed
    totalLikes: 0          // Number of properties liked
  });

  /**
   * Redirect landlords to landlord dashboard and refresh inquiries
   * Runs when user changes or on component mount
   */
  useEffect(() => {
    if (user) {
      const userRole = getUserRole();
      // Redirect landlords to their specialized dashboard
      if (userRole === 'landlord' || user.landlord) {
        window.location.href = '/LandlordDash';
        return;
      }
      // Refresh inquiries data for students
      refreshInquiries?.();
    }
  }, [user, getUserRole, refreshInquiries]);

  /**
   * Calculate number of new/unread inquiries for notification badge
   */
  const newInquiriesCount = userInquiries?.filter(inquiry => 
    inquiry.state === 'unread'
  ).length || 0;

  /**
   * Helper function to normalize property data for consistent display
   * Handles different property data structures from various sources
   */
  const getPropertyData = (property) => {
    // Handle properties with details/location structure
    if (property.details || property.location) {
      return {
        id: property.id,
        title: property.name || property.location?.Address || 'Untitled Property',
        location: property.location?.Address || 'Location not specified',
        price: property.details?.price || property.price || 'N/A',
        bedrooms: property.details?.Bedrooms || property.bedrooms || '0',
        bathrooms: property.details?.Bathrooms || property.bathrooms || '0',
        distance: property.details?.distance || 'N/A',
        likes: property.likes || 0,
        image: property.media?.CoverImage?.url 
          ? `http://localhost:1337${property.media.CoverImage.url}`
          : property.image || '/default-property.jpg',
        isAvailable: !(property.details?.isFull || property.isFull),
        type: property.details?.Category || 'accommodation'
      };
    }
    
    // Handle basic property structure
    return {
      id: property.id || 'no-id',
      title: property.title || property.name || 'Untitled Property',
      location: property.location?.Address || property.location || 'Location not specified',
      price: property.price || 'N/A',
      bedrooms: property.bedrooms || '0',
      bathrooms: property.bathrooms || '0',
      distance: property.distance || 'N/A',
      likes: property.likes || 0,
      image: property.image || '/default-property.jpg',
      isAvailable: true,
      type: property.type || 'property'
    };
  };

  /**
   * Status badge component for inquiries
   * Returns styled badge based on inquiry state
   */
  const getStatusBadge = (state) => {
    const statusConfig = {
      unread: { label: 'Unread', color: '#3498db', icon: <FaBell /> },
      'in-progress': { label: 'In Progress', color: '#f39c12', icon: <FaCheckCircle /> },
      done: { label: 'Done', color: '#27ae60', icon: <FaCheckCircle /> }
    };
    
    const config = statusConfig[state] || statusConfig.unread;
    
    return (
      <span className={style.statusBadge} style={{ backgroundColor: config.color }}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  /**
   * Generate recent activity from user actions
   * Creates activity items from shortlists and likes
   */
  useEffect(() => {
    const activities = [];
    
    // Add recent shortlist activity
    if (shortlist && shortlist.length > 0) {
      const recentShortlist = shortlist[0];
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
    
    // Add recent like activity
    const likedProperties = getLikedProperties();
    if (likedProperties && likedProperties.length > 0) {
      const recentLike = likedProperties[0];
      activities.push({
        id: `like-${recentLike}`,
        type: 'like',
        property: 'a property',
        time: 'Recently',
        icon: <FaThumbsUp />,
        color: '#3498db'
      });
    }
    
    // Add helpful tips if no activity exists
    if (activities.length === 0) {
      activities.push(
        {
          id: 'help-1',
          type: 'browse',
          property: 'Start browsing properties',
          time: 'Just now',
          icon: <FaSearch />,
          color: '#3498db'
        },
        {
          id: 'help-2',
          type: 'like',
          property: 'Like properties you\'re interested in',
          time: 'Next',
          icon: <FaThumbsUp />,
          color: '#3498db'
        },
        {
          id: 'help-3',
          type: 'shortlist',
          property: 'Shortlist properties you like',
          time: 'Then',
          icon: <FaCartPlus />,
          color: '#e74c3c'
        }
      );
    }
    
    // Set recent activities (limit to 4)
    setRecentActivity(activities.slice(0, 4));
  }, [shortlist, getLikedProperties]); // Removed favorites from dependencies

  /**
   * Calculate student-specific statistics
   * Updates user stats when shortlist or liked properties change
   */
  useEffect(() => {
    const likedProperties = getLikedProperties();
    const calculatedStats = {
      totalShortlists: shortlist?.length || 0,
      // Estimate properties viewed based on likes and shortlists
      propertiesViewed: Math.max((shortlist?.length || 0) * 3, (likedProperties?.length || 0) * 2),
      totalLikes: likedProperties?.length || 0
    };
    
    setUserStats(calculatedStats);
  }, [shortlist, getLikedProperties]);

  /**
   * Quick stats configuration for dashboard overview
   * Each stat includes icon, color, and display information
   */
  const quickStats = [
    {
      title: 'Properties Viewed',
      value: userStats.propertiesViewed,
      change: '+8%',
      trend: 'up',
      icon: <FaEye />,
      color: '#3498db',
      description: 'Properties you\'ve explored'
    },
    {
      title: 'Likes',
      value: userStats.totalLikes,
      change: userStats.totalLikes > 0 ? '+5%' : '+0%',
      trend: userStats.totalLikes > 0 ? 'up' : 'neutral',
      icon: <FaThumbsUp />,
      color: '#2ecc71',
      description: 'Properties you liked'
    },
    {
      title: 'Shortlisted',
      value: userStats.totalShortlists,
      change: shortlist?.length > 0 ? '+2%' : '+0%',
      trend: shortlist?.length > 0 ? 'up' : 'neutral',
      icon: <FaShoppingCart />,
      color: '#9b59b6',
      description: 'Top choices'
    }
  ];

  // Get user role for conditional rendering
  const userRole = getUserRole();

  return (
    <div className={style.Dashboard}>
      {/* Dashboard Header Section */}
      <div className={style.dashboardHeader}>
        <div className={style.headerContent}>
          <h1>Welcome back, {user?.username || 'Student'}! 🎓</h1>
          <p>Find your perfect student accommodation</p>
          <div className={style.studentBadge}>
            <span>Student Dashboard</span>
          </div>
        </div>
        <div className={style.headerActions}>
          <Link to="/listings" className={style.primaryButton}>
            <FaSearch />
            Browse Properties
          </Link>
        </div>
      </div>

      {/* Tab Navigation Bar */}
      <div className={style.tabNavigation}>
        <button 
          className={`${style.tab} ${activeTab === 'overview' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine />
          Overview
        </button>
        <button 
          className={`${style.tab} ${activeTab === 'shortlist' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('shortlist')}
        >
          <FaShoppingCart />
          My Shortlist
        </button>
        <button 
          className={`${style.tab} ${activeTab === 'inquiries' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          <FaEnvelope />
          My Inquiries
          {newInquiriesCount > 0 && (
            <span className={style.notificationBadge}>{newInquiriesCount}</span>
          )}
        </button>
      </div>

      {/* Main Dashboard Content Area */}
      <div className={style.dashboardContent}>
        {/* Overview Tab - Dashboard Home */}
        {activeTab === 'overview' && (
          <div className={style.overviewGrid}>
            {/* Quick Stats Cards Section */}
            <div className={style.statsGrid}>
              {quickStats.map((stat, index) => (
                <div key={`stat-${index}`} className={style.statCard}>
                  <div className={style.statIcon} style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className={style.statInfo}>
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                    <span className={style.statDescription}>{stat.description}</span>
                  </div>
                  <div className={`${style.statChange} ${style[stat.trend]}`}>
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity Timeline */}
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
                        {activity.type === 'browse' ? 'Ready to' : 'You'} <strong>{activity.type}d</strong> {activity.property}
                      </p>
                      <span className={style.activityTime}>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Grid - Main navigation shortcuts */}
            <div className={style.quickActions}>
              <h2>Find Your Perfect Home</h2>
              <div className={style.actionGrid}>
                <Link to="/listings" className={style.actionCard}>
                  <FaSearch />
                  <span>Browse All Properties</span>
                  <small>Explore available accommodations</small>
                </Link>
                <Link to="/SavedPage" className={style.actionCard}>
                  <FaShoppingCart />
                  <span>Check Shortlist</span>
                  <small>Compare top choices</small>
                </Link>
                <Link to="/Settings" className={style.actionCard}>
                  <FaUser />
                  <span>Update Profile</span>
                  <small>Manage your preferences</small>
                </Link>
              </div>
            </div>

            {/* Search Tips Section - Helpful guidance for students */}
            <div className={style.tipsSection}>
              <h2>💡 Finding Student Accommodation</h2>
              <div className={style.tipsGrid}>
                <div className={style.tipCard}>
                  <h4>Like Properties</h4>
                  <p>Use the like button to show interest in properties you're considering</p>
                </div>
                <div className={style.tipCard}>
                  <h4>Set Your Budget</h4>
                  <p>Filter properties by price range to find options within your budget</p>
                </div>
                <div className={style.tipCard}>
                  <h4>Check Distance</h4>
                  <p>Look for properties within comfortable distance from campus</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shortlist Tab - View and manage shortlisted properties */}
        {activeTab === 'shortlist' && (
          <div className={style.shortlistTab}>
            <div className={style.tabHeader}>
              <h2>My Shortlist</h2>
              <p>Compare your top property choices side by side</p>
            </div>

            <div className={style.shortlistGrid}>
              {/* Display all shortlisted properties */}
              {shortlist?.map(item => {
                const property = getPropertyData(item);
                return (
                  <div key={`shortlist-${property.id}`} className={style.shortlistCard}>
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
                      <p className={style.propertyLocation}>
                        <FaMapMarkerAlt /> {property.location}
                      </p>
                      <div className={style.propertyPrice}>${property.price}/month</div>
                      <div className={style.propertyFeatures}>
                        <span><FaBed /> {property.bedrooms} beds</span>
                        <span><FaBath /> {property.bathrooms} baths</span>
                        {property.distance && <span>📍 {property.distance}km from campus</span>}
                      </div>
                      <div className={style.propertyMeta}>
                        <span className={property.isAvailable ? style.available : style.notAvailable}>
                          {property.isAvailable ? '✅ Available' : '❌ Not Available'}
                        </span>
                        <span className={style.propertyType}>{property.type}</span>
                      </div>
                      <div className={style.propertyActions}>
                        <Link 
                          to={`/Single/${property.id}`}
                          className={style.viewDetailsBtn}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Empty state for shortlist */}
              {(!shortlist || shortlist.length === 0) && (
                <div className={style.emptyState}>
                  <FaShoppingCart />
                  <h3>Your shortlist is empty</h3>
                  <p>Add properties to your shortlist to compare them and make your decision easier</p>
                  <div className={style.emptyActions}>
                    <Link to="/listings" className={style.browseButton}>
                      <FaSearch />
                      Browse Properties
                    </Link>
                    <Link to="/SavedPage" className={style.secondaryButton}>
                      <FaHeart />
                      View Saved Properties
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Comparison Table - Shows side-by-side comparison when multiple properties are shortlisted */}
            {shortlist && shortlist.length > 1 && (
              <div className={style.comparisonSection}>
                <h3>Quick Comparison</h3>
                <div className={style.comparisonTable}>
                  <div className={style.comparisonHeader}>
                    <span>Property</span>
                    <span>Price</span>
                    <span>Distance</span>
                    <span>Beds</span>
                    <span>Baths</span>
                    <span>Status</span>
                  </div>
                  {shortlist.slice(0, 3).map(item => {
                    const property = getPropertyData(item);
                    return (
                      <div key={`compare-${property.id}`} className={style.comparisonRow}>
                        <span className={style.comparisonName}>{property.title}</span>
                        <span className={style.comparisonPrice}>${property.price}</span>
                        <span className={style.comparisonDistance}>{property.distance}km</span>
                        <span className={style.comparisonBeds}>{property.bedrooms}</span>
                        <span className={style.comparisonBaths}>{property.bathrooms}</span>
                        <span className={property.isAvailable ? style.comparisonAvailable : style.comparisonUnavailable}>
                          {property.isAvailable ? 'Available' : 'Full'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inquiries Tab - Track communication with landlords */}
        {activeTab === 'inquiries' && (
          <div className={style.inquiriesTab}>
            <div className={style.tabHeader}>
              <h2>My Property Inquiries</h2>
              <p>Track your booking requests and communication with landlords</p>
              <div className={style.inquiryStats}>
                <span className={style.pendingInquiries}>
                  {userInquiries?.filter(i => i.state === 'unread' || i.state === 'in-progress').length || 0} Active
                </span>
                <span>{userInquiries?.length || 0} Total</span>
              </div>
            </div>

            <div className={style.inquiriesList}>
              {/* Display all inquiries with proper data structure handling */}
              {userInquiries?.map(inquiry => {
                // Normalize inquiry data from different structures
                const inquiryData = {
                  id: inquiry.documentId || inquiry.id,
                  documentId: inquiry.documentId || inquiry.id,
                  
                  // Accommodation data with fallbacks
                  accommodation: inquiry.accommodation || {
                    id: inquiry.propertyId,
                    name: inquiry.propertyName,
                    location: inquiry.location || {},
                    details: inquiry.details || {},
                    media: inquiry.media || {},
                    landlord: inquiry.landlord || {}
                  },
                  
                  // Inquiry attributes with fallbacks for compatibility
                  propertyName: inquiry.accommodation?.name || inquiry.propertyName || 'Unknown Property',
                  propertyId: inquiry.accommodation?.id || inquiry.propertyId,
                  userName: inquiry.userName || inquiry.attributes?.userName,
                  userEmail: inquiry.userEmail || inquiry.attributes?.userEmail,
                  userPhone: inquiry.userPhone || inquiry.attributes?.userPhone,
                  message: inquiry.message || inquiry.attributes?.message,
                  preferredDate: inquiry.preferredDate || inquiry.attributes?.preferredDate,
                  state: inquiry.state || inquiry.attributes?.state || 'unread',
                  landlordReply: inquiry.landlordReply || inquiry.attributes?.landlordReply,
                  counterDate: inquiry.counterDate || inquiry.attributes?.counterDate,
                  userId: inquiry.userId || inquiry.attributes?.userId,
                  
                  // Student data
                  student: inquiry.student || {}
                };

                const currentState = inquiryData.state;
                const accommodation = inquiryData.accommodation;
                
                return (
                  <div key={`inquiry-${inquiryData.id}`} className={`${style.inquiryCard} ${style[inquiryData.state || 'unread']}`}>
                    <div className={style.inquiryHeader}>
                      <div className={style.propertyTitle}>
                        <h3>{inquiryData.propertyName}</h3>
                        {accommodation?.landlord?.fullName && (
                          <span className={style.landlordName}>with {accommodation.landlord.fullName}</span>
                        )}
                      </div>
                      {getStatusBadge(inquiryData.state)}
                    </div>
                    
                    {/* Property Information Section */}
                    {accommodation && (
                      <div className={style.propertyInfo}>
                        <div className={style.propertyDetails}>
                          {accommodation.location?.Address && (
                            <p className={style.propertyAddress}>
                              <FaMapMarkerAlt /> {accommodation.location.Address}
                            </p>
                          )}
                          {accommodation.details?.price && (
                            <p className={style.propertyPrice}>${accommodation.details.price}/month</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className={style.inquiryDetails}>
                      {/* Inquiry Metadata */}
                      <div className={style.inquiryMeta}>
                        <span><strong>Preferred Date:</strong> {inquiryData.preferredDate ? new Date(inquiryData.preferredDate).toLocaleDateString() : 'Not specified'}</span>
                        <span><strong>Sent:</strong> {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : 'Recently'}</span>
                      </div>
                      
                      {/* Student's Original Message */}
                      <div className={style.inquiryMessage}>
                        <h4>Your Message:</h4>
                        <p>{inquiryData.message || 'No message provided'}</p>
                      </div>

                      {/* Landlord's Response Section */}
                      {inquiryData.landlordReply && (
                        <div className={style.landlordReply}>
                          <h4>🏠 Landlord's Response:</h4>
                          <div className={style.replyContent}>
                            <p>{inquiryData.landlordReply}</p>
                            {inquiryData.counterDate && (
                              <p className={style.suggestedDate}>
                                <strong>📅 Suggested Date:</strong> {new Date(inquiryData.counterDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Inquiry Status and Action Buttons */}
                      <div className={style.inquiryActions}>
                        <div className={style.statusSection}>
                          {currentState === 'unread' && (
                            <div className={style.pendingStatus}>
                              ⏳ Waiting for landlord response...
                            </div>
                          )}
                          {currentState === 'in-progress' && (
                            <div className={style.inProgressStatus}>
                              🔄 Conversation in progress
                            </div>
                          )}
                          {currentState === 'done' && (
                            <div className={style.completedStatus}>
                              ✅ Inquiry Completed
                            </div>
                          )}
                        </div>

                        <div className={style.actionButtons}>
                          {inquiryData.propertyId && (
                            <Link 
                              to={`/Single/${inquiryData.propertyId}`}
                              className={style.viewPropertyBtn}
                            >
                              <FaEye />
                              View Property
                            </Link>
                          )}
                          {accommodation?.landlord?.phoneNumber && (
                            <a 
                              href={`tel:${accommodation.landlord.phoneNumber}`}
                              className={style.callLandlordBtn}
                            >
                              <FaPhone />
                              Call Landlord
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inquiry Timeline - Visual progress indicator */}
                    <div className={style.inquiryTimeline}>
                      <div className={style.timelineItem}>
                        <div className={`${style.timelineDot} ${style.completed}`}></div>
                        <span>Inquiry Sent</span>
                        <small>{inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : 'Recently'}</small>
                      </div>
                      
                      <div className={style.timelineItem}>
                        <div className={`${style.timelineDot} ${inquiryData.landlordReply ? style.completed : style.pending}`}></div>
                        <span>Landlord Response</span>
                        <small>{inquiryData.landlordReply ? 'Received' : 'Waiting'}</small>
                      </div>
                      
                      <div className={style.timelineItem}>
                        <div className={`${style.timelineDot} ${currentState === 'done' ? style.completed : style.pending}`}></div>
                        <span>Completed</span>
                        <small>{currentState === 'done' ? 'Resolved' : 'In Progress'}</small>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Empty State for Inquiries */}
              {(!userInquiries || userInquiries.length === 0) && (
                <div className={style.emptyState}>
                  <FaEnvelope className={style.emptyIcon} />
                  <h3>No inquiries yet</h3>
                  <p>When you send booking requests to landlords, they will appear here with all the conversation history.</p>
                  <div className={style.emptyActions}>
                    <Link to="/listings" className={style.browseButton}>
                      <FaSearch />
                      Browse Properties
                    </Link>
                    <div className={style.tips}>
                      <h4>💡 Tips for better responses:</h4>
                      <ul>
                        <li>Be specific about your preferred move-in date</li>
                        <li>Mention your budget and requirements</li>
                        <li>Ask about availability and viewing options</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}