import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, FaPlus, FaEdit, FaTrash, FaEye, FaChartLine,
  FaDollarSign, FaBell, FaCheckCircle,
  FaClock, FaExclamationTriangle, FaEnvelope,
  FaMapMarkerAlt, FaThumbsUp, FaHeart, FaPhone,
  FaCalendarAlt
} from 'react-icons/fa';
import style from '../../Styles/pages/LandLordDash.module.css';
import { useApp } from '../../Contexts/AppContext';
import { useAuth } from '../../Contexts/AuthContext';
import AddPropertyModal from '../../Hooks/AddPropertyModal';
import EditPropertyModal from '../../Hooks/EditPropertyModal';
import { Link } from 'react-router-dom';

/**
 * Landlord Dashboard Component
 * Comprehensive dashboard for landlords to manage properties, track performance,
 * and handle student inquiries
 */
export default function LandlordDashboard() {
  // Context hooks for user authentication and application state
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    userAccommodations,
    loading: contextLoading,
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
    refreshAccommodations,
    landlordInquiries,
    updateInquiry,
    refreshInquiries
  } = useApp();
  
  // Component state management
  const [activeTab, setActiveTab] = useState('overview');           // Currently active dashboard tab
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false); // Add property modal visibility
  const [showEditPropertyForm, setShowEditPropertyForm] = useState(false); // Edit property modal visibility
  const [editingProperty, setEditingProperty] = useState(null);     // Property being edited
  const [showSuccess, setShowSuccess] = useState(false);            // Success message visibility
  const [isLoading, setIsLoading] = useState(false);                // Loading state for operations
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);    // Count of new/unread inquiries
  const [replyingTo, setReplyingTo] = useState(null);               // Inquiry ID being replied to
  const [replyMessage, setReplyMessage] = useState('');             // Reply message content
  const [showDatePicker, setShowDatePicker] = useState(false);      // Date picker visibility
  const [selectedDate, setSelectedDate] = useState('');             // Selected date from calendar
  
  // Dashboard statistics state
  const [stats, setStats] = useState({
    totalProperties: 0,     // Total number of properties listed
    activeListings: 0,      // Number of active property listings
    pendingListings: 0,     // Number of pending property listings
    totalViews: 0,          // Total views across all properties
    totalFavorites: 0,      // Total favorites across all properties
    totalLikes: 0,          // Total likes across all properties
    monthlyRevenue: 0,      // Estimated monthly revenue from properties
    occupancyRate: 0        // Occupancy rate percentage
  });

  // Get landlord properties from context
  const landlordProperties = userAccommodations || [];

  /**
   * Update dashboard statistics when user accommodations change
   * Calculates various metrics for the overview dashboard
   */
  useEffect(() => {
    if (userAccommodations) {
      updateStats(userAccommodations);
    }
  }, [userAccommodations]);

  /**
   * Calculate and update comprehensive dashboard statistics
   * @param {Array} listingsData - Array of property listings
   */
  const updateStats = (listingsData) => {
    const totalProperties = listingsData.length;
    const activeListings = listingsData.filter(l => l.status === 'active' || !l.status).length;
    const pendingListings = listingsData.filter(l => l.status === 'pending').length;
    const totalViews = listingsData.reduce((sum, listing) => sum + (listing.views || 0), 0);
    const totalFavorites = listingsData.reduce((sum, listing) => sum + (listing.favorites || 0), 0);
    const totalLikes = listingsData.reduce((sum, listing) => sum + (listing.likes || 0), 0);
    
    // Calculate monthly revenue from active, available properties
    const monthlyRevenue = listingsData
      .filter(l => (l.status === 'active' || !l.status) && !l.details?.isFull)
      .reduce((sum, listing) => sum + (parseFloat(listing.details?.price) || 0), 0);
    
    // Calculate occupancy rate (percentage of full properties)
    const occupancyRate = totalProperties > 0 ? 
      ((listingsData.filter(l => l.details?.isFull).length / totalProperties) * 100).toFixed(1) : 0;

    setStats({
      totalProperties,
      activeListings,
      pendingListings,
      totalViews,
      totalFavorites,
      totalLikes,
      monthlyRevenue,
      occupancyRate
    });
  };

  /**
   * Handle creation of new property listing
   * @param {Object} propertyData - Property data from form
   */
  const handleAddProperty = async (propertyData) => {
    try {
      const result = await createAccommodation(propertyData, user);
      
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setShowAddPropertyForm(false);
        await refreshAccommodations();
      } else {
        alert(`Failed to create property: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to create property. Please try again.');
    }
  };

  /**
   * Prepare property for editing by opening edit modal
   * @param {Object} property - Property object to edit
   */
  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setShowEditPropertyForm(true);
  };

  /**
   * Handle updating existing property listing
   * @param {string} propertyId - ID of property to update
   * @param {Object} propertyData - Updated property data
   */
  const handleUpdateProperty = async (propertyId, propertyData) => {
    try {
      const result = await updateAccommodation(propertyId, propertyData, user);
      
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setShowEditPropertyForm(false);
        setEditingProperty(null);
        await refreshAccommodations();
      } else {
        alert(`Failed to update property: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to update property. Please try again.');
    }
  };

  /**
   * Handle deletion of property listing with confirmation
   * @param {string} listingId - ID of property to delete
   */
  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        const result = await deleteAccommodation(listingId, user);
        
        if (result.success) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          await refreshAccommodations();
        } else {
          alert(`Failed to delete property: ${result.error}`);
        }
      } catch (error) {
        alert('Failed to delete property. Please try again.');
      }
    }
  };

  /**
   * Process landlord inquiries and count new/unread ones
   * Updates notification badge count
   */
  useEffect(() => {
    if (landlordInquiries && landlordInquiries.length > 0) {
      // Count new inquiries (state === 'unread')
      const newInquiries = landlordInquiries.filter(inquiry => 
        inquiry.state === 'unread'
      ).length;
      
      setNewInquiriesCount(newInquiries);
    } else {
      setNewInquiriesCount(0);
    }
  }, [landlordInquiries]);

  /**
   * Refresh inquiries data when user changes
   */
  useEffect(() => {
    if (user && user.id) {
      refreshInquiries?.();
    }
  }, [user, refreshInquiries]);

  /**
   * Handle updating inquiry state (mark as read, in progress, done)
   * @param {string} inquiryId - ID of inquiry to update
   * @param {Object} updates - State updates to apply
   */
  const handleUpdateInquiry = async (inquiryId, updates) => {
    try {
      const result = await updateInquiry(inquiryId, updates);
      
      if (result.success) {
        await refreshInquiries();
      } else {
        alert(`Failed to update inquiry: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to update inquiry. Please try again.');
    }
  };

  /**
   * Handle replying to student inquiry with optional date suggestion
   * @param {string} inquiryId - ID of inquiry to reply to
   */
  const handleReply = async (inquiryId) => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message');
      return;
    }

    try {
      const updates = {
        state: 'in_progress',
        landlordReply: replyMessage
      };

      // Include counter date if selected
      if (selectedDate) {
        updates.counterDate = selectedDate;
      }

      const result = await updateInquiry(inquiryId, updates);
      
      if (result.success) {
        alert('Reply sent to student!');
        setReplyingTo(null);
        setReplyMessage('');
        setSelectedDate('');
        setShowDatePicker(false);
        await refreshInquiries();
      } else {
        alert('Failed to send reply: ' + result.error);
      }
    } catch (error) {
      alert('Failed to send reply. Please try again.');
    }
  };

  /**
   * Handle suggesting alternative date for viewing
   * Opens date picker modal instead of native prompt
   * @param {string} inquiryId - ID of inquiry to update
   */
  const handleSuggestDate = (inquiryId) => {
    setReplyingTo(inquiryId);
    setShowDatePicker(true);
    setReplyMessage(''); // Clear any existing reply message
  };

  /**
   * Handle marking inquiry as completed
   * @param {string} inquiryId - ID of inquiry to mark as done
   */
  const handleMarkAsDone = async (inquiryId) => {
    const result = await updateInquiry(inquiryId, {
      state: 'done'
    });
    
    if (result.success) {
      alert('Inquiry marked as completed!');
      await refreshInquiries();
    } else {
      alert('Failed to mark as done: ' + result.error);
    }
  };

  /**
   * Create status badge for property listings
   * @param {string} status - Property status (active, pending, rejected)
   * @returns {JSX} Styled status badge component
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', color: '#27ae60', icon: <FaCheckCircle /> },
      pending: { label: 'Pending', color: '#f39c12', icon: <FaClock /> },
      rejected: { label: 'Rejected', color: '#e74c3c', icon: <FaExclamationTriangle /> }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <span className={style.statusBadge} style={{ backgroundColor: config.color }}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  /**
   * Create status badge for inquiries
   * @param {string} state - Inquiry state (unread, in-progress, done)
   * @returns {JSX} Styled inquiry status badge component
   */
  const getInquiryStatusBadge = (state) => {
    const statusConfig = {
      unread: { label: 'Unread', color: '#3498db', icon: <FaBell /> },
      'in-progress': { label: 'In Progress', color: '#f39c12', icon: <FaClock /> },
      done: { label: 'Done', color: '#27ae60', icon: <FaCheckCircle /> }
    };
    
    const config = statusConfig[state] || statusConfig.unread;
    
    return (
      <span className={style.inquiryStatus} style={{ backgroundColor: config.color }}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  /**
   * Format image URL for display
   * Handles both absolute URLs and relative paths
   * @param {string} url - Image URL from backend
   * @returns {string} Formatted image URL
   */
  const formatImageUrl = (url) => {
    if (!url) return '/default-property.jpg';
    
    // If URL already has http/https, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If URL starts with /uploads, prepend backend URL
    if (url.startsWith('/uploads')) {
      return `http://localhost:1337${url}`;
    }
    
    // Return default image for invalid URLs
    return '/default-property.jpg';
  };

  /**
   * Quick stats configuration for dashboard overview
   * Each stat card shows key metrics with trends
   */
  const quickStats = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      change: '+2',
      trend: 'up',
      icon: <FaHome />,
      color: '#3498db'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      change: '+15%',
      trend: 'up',
      icon: <FaDollarSign />,
      color: '#27ae60'
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes.toLocaleString(),
      change: '+23%',
      trend: 'up',
      icon: <FaThumbsUp />,
      color: '#e74c3c'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      change: '+18%',
      trend: 'up',
      icon: <FaEye />,
      color: '#9b59b6'
    }
  ];

  /**
   * Check if user has landlord permissions
   * Redirects non-landlord users to appropriate dashboard
   */
  if (user && (user.role?.name !== 'landlord' && !user.landlord)) {
    return (
      <div className={style.accessDenied}>
        <div className={style.deniedContent}>
          <h1>🚫 Access Denied</h1>
          <p>This dashboard is only available for registered landlords.</p>
          <p>Your current role: <strong>{user.role?.name || 'User'}</strong></p>
          <div className={style.deniedActions}>
            <button 
              className={style.primaryButton}
              onClick={() => navigate('/DashBoard')}
            >
              Go to Student Dashboard
            </button>
            <button 
              className={style.secondaryButton}
              onClick={() => navigate('/listings')}
            >
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={style.LandlordDashboard}>
      {/* Success Notification Toast */}
      {showSuccess && (
        <div className={style.successMessage}>
          <FaCheckCircle />
          {editingProperty ? 'Property updated successfully!' : 'Property added successfully!'}
        </div>
      )}

      {/* Loading Overlay */}
      {(isLoading || contextLoading) && (
        <div className={style.loadingState}>
          <div className={style.loadingSpinner}></div>
          Loading your properties...
        </div>
      )}

      {/* Add Property Modal */}
      {showAddPropertyForm && (
        <AddPropertyModal
          onClose={() => setShowAddPropertyForm(false)}
          onSave={handleAddProperty}
          userId={user?.id}
        />
      )}

      {/* Edit Property Modal */}
      {showEditPropertyForm && editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => {
            setShowEditPropertyForm(false);
            setEditingProperty(null);
          }}
          onSave={handleUpdateProperty}
        />
      )}

      {/* Date Picker Modal for Suggesting New Dates */}
      {showDatePicker && (
        <div className={style.datePickerModal}>
          <div className={style.datePickerContent}>
            <h3>📅 Select Suggested Date</h3>
            <p>Choose a new date to suggest to the student:</p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={style.dateInput}
            />
            <div className={style.datePickerActions}>
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  setSelectedDate('');
                }}
                className={style.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedDate) {
                    setShowDatePicker(false);
                    // Auto-populate reply message with date suggestion
                    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                    setReplyMessage(`I'd like to suggest ${formattedDate} as an alternative viewing date. Would this work for you?`);
                  }
                }}
                className={style.confirmButton}
                disabled={!selectedDate}
              >
                Confirm Date
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dashboard Header Section */}
      <div className={style.dashboardHeader}>
        <div className={style.headerContent}>
          <h1>Landlord Dashboard</h1>
          <p>Manage your properties and track performance</p>
          {user && (
            <div className={style.userWelcome}>
              <p>Welcome, {user.username || user.email}! 👋</p>
              <span className={style.roleBadge}>🏠 Landlord</span>
            </div>
          )}
        </div>
        <div className={style.headerActions}>
          <button 
            className={style.primaryButton}
            onClick={() => setShowAddPropertyForm(true)}
            disabled={isLoading}
          >
            <FaPlus />
            Add New Property
          </button>
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
          className={`${style.tab} ${activeTab === 'properties' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          <FaHome />
          My Properties ({landlordProperties.length})
        </button>
        <button 
          className={`${style.tab} ${activeTab === 'inquiries' ? style.activeTab : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          <FaEnvelope />
          Inquiries ({newInquiriesCount})
        </button>
      </div>

      {/* Main Dashboard Content Area */}
      <div className={style.dashboardContent}>
        {/* Overview Tab - Dashboard Home with Quick Stats */}
        {activeTab === 'overview' && (
          <div className={style.overviewGrid}>
            {/* Quick Stats Cards Section */}
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

            {/* Quick Actions Section - Dashboard Shortcuts */}
            <div className={style.quickActions}>
              <h2>Quick Actions</h2>
              <div className={style.actionGrid}>
                <button 
                  className={style.actionCard}
                  onClick={() => setShowAddPropertyForm(true)}
                  disabled={isLoading}
                >
                  <FaPlus />
                  <span>Add Property</span>
                </button>
                <button 
                  className={style.actionCard}
                  onClick={() => setActiveTab('properties')}
                >
                  <FaEdit />
                  <span>Manage Properties</span>
                </button>
                <button 
                  className={style.actionCard}
                  onClick={() => setActiveTab('inquiries')}
                >
                  <FaEnvelope />
                  <span>View Inquiries</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab - Manage Property Listings */}
        {activeTab === 'properties' && (
          <div className={style.propertiesTab}>
            <div className={style.tabHeader}>
              <h2>My Properties ({landlordProperties.length})</h2>
              <button 
                className={style.primaryButton}
                onClick={() => setShowAddPropertyForm(true)}
                disabled={isLoading}
              >
                <FaPlus />
                Add New Property
              </button>
            </div>

            {isLoading ? (
              <div className={style.loadingState}>
                <div className={style.loadingSpinner}></div>
                Loading your properties...
              </div>
            ) : (
              <div className={style.propertiesGrid}>
                {/* Property Listing Cards */}
                {landlordProperties.map(listing => (
                  <div key={listing.id} className={style.propertyCard}>
                    <div className={style.propertyImage}>
                      <img 
                        src={formatImageUrl(listing.media?.CoverImage?.url)}
                        alt={listing.name} 
                        onError={(e) => {
                          e.target.src = '/default-property.jpg';
                        }}
                      />
                      <div className={style.propertyStatus}>
                        {getStatusBadge(listing.status || 'active')}
                      </div>
                    </div>

                    {/* Property Metrics Bar */}
                    <div className={style.propertyMetrics}>
                      <div className={style.metric}>
                        <FaEye />
                        <span>{listing.views || 0} views</span>
                      </div>
                      <div className={style.metric}>
                        <FaHeart />
                        <span>{listing.favorites || 0} favorites</span>
                      </div>
                      <div className={style.metric}>
                        <FaThumbsUp />
                        <span>{listing.likes || 0} likes</span>
                      </div>
                    </div>
                    
                    {/* Property Information Section */}
                    <div className={style.propertyInfo}>
                      <h3>{listing.name}</h3>
                      <p className={style.propertyAddress}>
                        <FaMapMarkerAlt />
                        {listing.location?.Address}, {listing.location?.City}
                      </p>
                      
                      <div className={style.propertyStats}>
                        <div className={style.stat}>
                          <strong>${listing.details?.price || 0}</strong>
                          <span>per month</span>
                        </div>
                        <div className={style.stat}>
                          <strong>{listing.likes || 0}</strong>
                          <span>likes</span>
                        </div>
                      </div>
                      
                      {/* Property Action Buttons */}
                      <div className={style.propertyActions}>
                        <button 
                          className={style.editBtn}
                          onClick={() => handleEditProperty(listing)}
                          title="Edit property"
                        >
                          <FaEdit />
                          Edit
                        </button>
                        <Link 
                          to={`/Single/${listing.id}`}
                          className={`${style.viewBtn} ${style.linkButton}`}
                          title="View property details"
                        >
                          <FaEye />
                          View
                        </Link>
                        <button 
                          className={style.deleteBtn}
                          onClick={() => handleDeleteListing(listing.id)}
                          title="Delete property"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty State for Properties */}
                {landlordProperties.length === 0 && !isLoading && (
                  <div className={style.emptyState}>
                    <FaHome className={style.emptyIcon} />
                    <h3>No properties listed yet</h3>
                    <p>Start by creating your first property listing to attract tenants</p>
                    <button 
                      className={style.primaryButton}
                      onClick={() => setShowAddPropertyForm(true)}
                    >
                      <FaPlus />
                      Create Your First Listing
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Inquiries Tab - Manage Student Inquiries */}
        {activeTab === 'inquiries' && (
          <div className={style.inquiriesTab}>
            <div className={style.tabHeader}>
              <h2>Property Inquiries</h2>
              <div className={style.inquiryStats}>
                <span className={style.totalInquiries}>
                  Total Inquiries: {landlordInquiries?.length || 0}
                </span>
                <span className={style.newInquiries}>
                  New: {landlordInquiries?.filter(inq => inq.state === 'unread').length || 0}
                </span>
              </div>
            </div>

            <div className={style.inquiriesList}>
              {/* Display Inquiries Grouped by Property */}
              {landlordInquiries && landlordInquiries.length > 0 ? (
                // Group inquiries by property for better organization
                (() => {
                  const inquiriesByProperty = {};
                  landlordInquiries.forEach(inquiry => {
                    const propertyId = inquiry.accommodation?.id || 'unknown';
                    if (!inquiriesByProperty[propertyId]) {
                      inquiriesByProperty[propertyId] = {
                        property: inquiry.accommodation,
                        inquiries: []
                      };
                    }
                    inquiriesByProperty[propertyId].inquiries.push(inquiry);
                  });

                  return Object.values(inquiriesByProperty).map(({ property, inquiries }) => {
                    const propertyName = property?.name || 'Unnamed Property';
                    const propertyLocation = property?.location ? 
                      `${property.location.Address}, ${property.location.City}` : 
                      'Location not specified';

                    return (
                      <div key={property?.id} className={style.propertyInquiriesSection}>
                        {/* Property Header Section */}
                        <div className={style.propertyHeader}>
                          <div className={style.propertyInfo}>
                            <h3>{propertyName}</h3>
                            <p className={style.propertyAddress}>📍 {propertyLocation}</p>
                            {property?.details?.price && (
                              <p className={style.propertyPrice}>💰 ${property.details.price}/month</p>
                            )}
                          </div>
                          <div className={style.inquiryCount}>
                            <span className={style.countBadge}>
                              {inquiries.length} inquiry{inquiries.length !== 1 ? 'ies' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Property Image - FIXED: Using formatImageUrl function */}
                        {property?.media?.CoverImage?.url && (
                          <div className={style.propertyImage}>
                            <img 
                              src={formatImageUrl(property.media.CoverImage.url)} 
                              alt={propertyName}
                              onError={(e) => {
                                e.target.src = '/default-property.jpg';
                              }}
                            />
                          </div>
                        )}

                        {/* Individual Inquiries for Property */}
                        <div className={style.propertyInquiries}>
                          {inquiries.map(inquiry => {
                            // Normalize inquiry data structure
                            const inquiryData = {
                              id: inquiry.documentId || inquiry.id,
                              documentId: inquiry.documentId || inquiry.id,
                              
                              // Student data
                              student: inquiry.student || {},
                              
                              // Inquiry attributes
                              userName: inquiry.userName || 'Unknown Student',
                              userEmail: inquiry.userEmail || 'No email',
                              userPhone: inquiry.userPhone || 'No phone',
                              message: inquiry.message || 'No message',
                              preferredDate: inquiry.preferredDate,
                              state: inquiry.state || 'unread',
                              landlordReply: inquiry.landlordReply,
                              counterDate: inquiry.counterDate,
                              createdAt: inquiry.createdAt,
                            };

                            const currentState = inquiryData.state;

                            return (
                              <div key={inquiryData.id} className={style.inquiryItem}>
                                {/* Inquiry Header with Student Info */}
                                <div className={style.inquiryHeader}>
                                  <div className={style.studentInfo}>
                                    <h4>👤 Inquiry from {inquiryData.userName}</h4>
                                    <div className={style.contactInfo}>
                                      <span>📧 {inquiryData.userEmail}</span>
                                      <span>📞 {inquiryData.userPhone}</span>
                                      {inquiryData.student?.firstName && (
                                        <span className={style.studentDetails}>
                                          🎓 {inquiryData.student.firstName} {inquiryData.student.lastName}
                                          {inquiryData.student.studentId && ` (ID: ${inquiryData.student.studentId})`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className={style.inquiryMeta}>
                                    {getInquiryStatusBadge(currentState)}
                                    <span className={style.inquiryDate}>
                                      {inquiryData.createdAt ? new Date(inquiryData.createdAt).toLocaleDateString() : 'Recently'}
                                    </span>
                                  </div>
                                </div>

                                {/* Inquiry Details Section */}
                                <div className={style.inquiryDetails}>
                                  <div className={style.messageSection}>
                                    <h5>💬 Student's Message:</h5>
                                    <p className={style.message}>{inquiryData.message}</p>
                                  </div>
                                  
                                  {inquiryData.preferredDate && (
                                    <div className={style.preferredDate}>
                                      <h5>📅 Preferred Viewing Date:</h5>
                                      <p>{new Date(inquiryData.preferredDate).toLocaleDateString()}</p>
                                    </div>
                                  )}

                                  {/* Landlord Reply Display */}
                                  {inquiryData.landlordReply && (
                                    <div className={style.landlordReply}>
                                      <h5>🏠 Your Response:</h5>
                                      <div className={style.replyContent}>
                                        <p>{inquiryData.landlordReply}</p>
                                        {inquiryData.counterDate && (
                                          <p className={style.counterDate}>
                                            <strong>🔄 Suggested Date:</strong> {new Date(inquiryData.counterDate).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Inquiry Action Buttons */}
                                <div className={style.inquiryActions}>
                                  <div className={style.actionButtons}>
                                    {/* Mark as In Progress Button */}
                                    {currentState === 'unread' && (
                                      <button 
                                        onClick={() => handleUpdateInquiry(inquiryData.documentId, { state: 'in-progress' })}
                                        className={style.markReadBtn}
                                      >
                                        <FaCheckCircle />
                                        Mark as In Progress
                                      </button>
                                    )}
                                    
                                    {/* Mark as Done Button */}
                                    {currentState === 'in-progress' && (
                                      <button 
                                        onClick={() => handleUpdateInquiry(inquiryData.documentId, { state: 'done' })}
                                        className={style.markDoneBtn}
                                      >
                                        <FaCheckCircle />
                                        Mark as Done
                                      </button>
                                    )}
                                    
                                    {/* Reply Action Button */}
                                    {!inquiryData.landlordReply ? (
                                      <button 
                                        onClick={() => {
                                          setReplyingTo(inquiryData.documentId);
                                          setReplyMessage('');
                                          setSelectedDate('');
                                        }}
                                        className={style.replyBtn}
                                      >
                                        <FaEnvelope />
                                        Reply to Student
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => {
                                          setReplyingTo(inquiryData.documentId);
                                          setReplyMessage(inquiryData.landlordReply || '');
                                          setSelectedDate(inquiryData.counterDate || '');
                                        }}
                                        className={style.editReplyBtn}
                                      >
                                        <FaEdit />
                                        Edit Reply
                                      </button>
                                    )}
                                    
                                    {/* Suggest New Date Button */}
                                    <button 
                                      onClick={() => handleSuggestDate(inquiryData.documentId)}
                                      className={style.suggestDateBtn}
                                    >
                                      <FaCalendarAlt />
                                      Suggest New Date
                                    </button>
                                    
                                    {/* Contact Student Button */}
                                    <a 
                                      href={`tel:${inquiryData.userPhone}`}
                                      className={style.callStudentBtn}
                                    >
                                      <FaPhone />
                                      Call Student
                                    </a>
                                  </div>
                                </div>

                                {/* Reply Form for Current Inquiry */}
                                {replyingTo === inquiryData.documentId && (
                                  <div className={style.replyForm}>
                                    <h5>✍️ Your Reply to Student:</h5>
                                    <div className={style.dateSuggestionSection}>
                                      <label>
                                        <FaCalendarAlt /> Suggested Date (Optional):
                                      </label>
                                      <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={style.inlineDateInput}
                                      />
                                      {selectedDate && (
                                        <span className={style.selectedDatePreview}>
                                          📅 {new Date(selectedDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                          })}
                                        </span>
                                      )}
                                    </div>
                                    <textarea
                                      value={replyMessage}
                                      onChange={(e) => setReplyMessage(e.target.value)}
                                      placeholder="Type your response to the student..."
                                      rows={4}
                                    />
                                    <div className={style.replyActions}>
                                      <button 
                                        onClick={() => handleReply(inquiryData.documentId)}
                                        className={style.sendReplyBtn}
                                        disabled={!replyMessage.trim()}
                                      >
                                        <FaEnvelope />
                                        Send Reply
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setReplyingTo(null);
                                          setReplyMessage('');
                                          setSelectedDate('');
                                        }}
                                        className={style.cancelReplyBtn}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()
              ) : (
                /* Empty State for Inquiries */
                <div className={style.emptyState}>
                  <FaEnvelope className={style.emptyIcon} />
                  <h3>No property inquiries yet</h3>
                  <p>When students inquire about your properties, they'll appear here organized by property.</p>
                  <div className={style.emptyTips}>
                    <h4>💡 Tips to get more inquiries:</h4>
                    <ul>
                      <li>Add high-quality photos of your property</li>
                      <li>Set competitive pricing</li>
                      <li>Write detailed property descriptions</li>
                      <li>Respond quickly to inquiries when they come in</li>
                    </ul>
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