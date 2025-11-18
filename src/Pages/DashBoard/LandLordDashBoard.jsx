import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, FaPlus, FaEdit, FaTrash, FaEye, FaChartLine,
  FaDollarSign, FaBell, FaCheckCircle,
  FaClock, FaExclamationTriangle, FaEnvelope,
  FaMapMarkerAlt, FaThumbsUp, FaHeart,FaPhone
} from 'react-icons/fa';
import style from '../../Styles/pages/LandLordDash.module.css';
import { useApp } from '../../Contexts/AppContext';
import { useAuth } from '../../Contexts/AuthContext';
import AddPropertyModal from '../../Hooks/AddPropertyModal';
import EditPropertyModal from '../../Hooks/EditPropertyModal';

export default function LandlordDashboard() {
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
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [showEditPropertyForm, setShowEditPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('all'); 
  
  // Stats state
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    pendingListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalLikes: 0,
    monthlyRevenue: 0,
    occupancyRate: 0
  });

  // Get landlord properties from context
  const landlordProperties = userAccommodations || [];

  /**
   * Update stats when user accommodations change
   */
  useEffect(() => {
    if (userAccommodations) {
      updateStats(userAccommodations);
    }
  }, [userAccommodations]);

  /**
   * Calculate and update dashboard statistics
   */
  const updateStats = (listingsData) => {
    const totalProperties = listingsData.length;
    const activeListings = listingsData.filter(l => l.status === 'active' || !l.status).length;
    const pendingListings = listingsData.filter(l => l.status === 'pending').length;
    const totalViews = listingsData.reduce((sum, listing) => sum + (listing.views || 0), 0);
    const totalFavorites = listingsData.reduce((sum, listing) => sum + (listing.favorites || 0), 0);
    const totalLikes = listingsData.reduce((sum, listing) => sum + (listing.likes || 0), 0);
    const monthlyRevenue = listingsData
      .filter(l => (l.status === 'active' || !l.status) && !l.details?.isFull)
      .reduce((sum, listing) => sum + (parseFloat(listing.details?.price) || 0), 0);
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
   * Handle adding new property
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
      console.error('Error in handleAddProperty:', error);
      alert('Failed to create property. Please try again.');
    }
  };

  /**
   * Handle editing property
   */
  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setShowEditPropertyForm(true);
  };

  /**
   * Handle updating property
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
      console.error('Error in handleUpdateProperty:', error);
      alert('Failed to update property. Please try again.');
    }
  };

  /**
   * Handle deleting property
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
        console.error('Error deleting property:', error);
        alert('Failed to delete property. Please try again.');
      }
    }
  };

  /**
   * Process landlord inquiries - FIXED VERSION
   */
useEffect(() => {
  console.log('🔄 Processing landlord inquiries in dashboard:', landlordInquiries);
  
  if (landlordInquiries && landlordInquiries.length > 0) {
    console.log('✅ landlordInquiries available:', landlordInquiries.length, 'inquiries');
    
    // Count new inquiries (state === 'unread')
    const newInquiries = landlordInquiries.filter(inquiry => 
      inquiry.state === 'unread'
    ).length;
    
    console.log(`📊 Stats - Total: ${landlordInquiries.length}, New: ${newInquiries}`);
    setNewInquiriesCount(newInquiries);
  } else {
    console.log('📭 No landlord inquiries found in dashboard');
    setNewInquiriesCount(0);
  }
}, [landlordInquiries]);

  // Refresh inquiries when user changes
  useEffect(() => {
    if (user && user.id) {
      refreshInquiries?.();
    }
  }, [user, refreshInquiries]);

  /**
   * Handle updating inquiry state
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
      console.error('Error updating inquiry:', error);
      alert('Failed to update inquiry. Please try again.');
    }
  };

  /**
   * Handle replying to inquiry
   */
  const handleReply = async (inquiryId) => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message');
      return;
    }

    try {
      const result = await updateInquiry(inquiryId, {
        state: 'in_progress',
        landlordReply: replyMessage
      });
      
      if (result.success) {
        alert('Reply sent to student!');
        setReplyingTo(null);
        setReplyMessage('');
        await refreshInquiries();
      } else {
        alert('Failed to send reply: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    }
  };

  /**
   * Handle suggesting new date for inquiry
   */
  const handleSuggestDate = async (inquiryId) => {
    const newDate = prompt('Suggest a new date (YYYY-MM-DD):', '');
    if (newDate) {
      const reply = prompt('Enter your message with the suggested date:', '');
      if (reply) {
        const result = await updateInquiry(inquiryId, {
          state: 'in_progress',
          landlordReply: reply,
          counterDate: newDate
        });
        
        if (result.success) {
          alert('Suggested date sent to student!');
          await refreshInquiries();
        } else {
          alert('Failed to suggest date: ' + result.error);
        }
      }
    }
  };

  /**
   * Handle marking inquiry as done
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
   * Handle deleting inquiry
   */
  const handleDeleteInquiry = async (inquiryId) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      // Note: You might need to implement deleteInquiry function in your context
      // For now, we'll just remove it from local state
      setInquiries(prev => prev.filter(inquiry => {
        const id = inquiry.documentId || inquiry.id;
        return id !== inquiryId;
      }));
      alert('Inquiry deleted locally. Implement backend deletion if needed.');
    }
  };

  /**
   * Get status badge for property
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
   * Get status badge for inquiry
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

  // Quick stats for overview
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

  // Check if user is a landlord
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
      {/* Success Message */}
      {showSuccess && (
        <div className={style.successMessage}>
          <FaCheckCircle />
          {editingProperty ? 'Property updated successfully!' : 'Property added successfully!'}
        </div>
      )}

      {/* Loading State */}
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
      
      {/* Dashboard Header */}
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

            {/* Quick Actions */}
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

        {/* Properties Tab */}
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
                {landlordProperties.map(listing => (
                  <div key={listing.id} className={style.propertyCard}>
                    <div className={style.propertyImage}>
                      <img 
                        src={listing.media?.CoverImage?.url || '/default-property.jpg'} 
                        alt={listing.name} 
                        onError={(e) => {
                          e.target.src = '/default-property.jpg';
                        }}
                      />
                      <div className={style.propertyStatus}>
                        {getStatusBadge(listing.status || 'active')}
                      </div>
                    </div>

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
                      
                      <div className={style.propertyActions}>
                        <button 
                          className={style.editBtn}
                          onClick={() => handleEditProperty(listing)}
                          title="Edit property"
                        >
                          <FaEdit />
                          Edit
                        </button>
                        <button 
                          className={style.viewBtn}
                          onClick={() => navigate(`/property/${listing.id}`)}
                          title="View property details"
                        >
                          <FaEye />
                          View
                        </button>
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

        {/* Inquiries Tab - FIXED VERSION */}
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
      {/* DIRECTLY USE landlordInquiries FROM CONTEXT - NOW IT'S EXTRACTED INQUIRIES */}
      {landlordInquiries && landlordInquiries.length > 0 ? (
        // Group inquiries by property for better organization
        (() => {
          // Group inquiries by property
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
                {/* Property Header */}
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

                {/* Property Image */}
                {property?.media?.CoverImage?.url && (
                  <div className={style.propertyImage}>
                    <img 
                      src={property.media.CoverImage.url} 
                      alt={propertyName}
                      onError={(e) => {
                        e.target.src = '/default-property.jpg';
                      }}
                    />
                  </div>
                )}

                {/* Inquiries for this property */}
                <div className={style.propertyInquiries}>
                  {inquiries.map(inquiry => {
                    // Extract inquiry data - now it's already flattened
                    const inquiryData = {
                      id: inquiry.documentId || inquiry.id,
                      documentId: inquiry.documentId || inquiry.id,
                      
                      // Student data
                      student: inquiry.student || {},
                      
                      // Inquiry attributes - already flattened from AppContext
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
                        {/* Inquiry Header */}
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

                        {/* Inquiry Details */}
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

                          {/* Landlord Reply Section */}
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

                        {/* Action Buttons */}
                        <div className={style.inquiryActions}>
                          <div className={style.actionButtons}>
                            {/* Mark as In Progress */}
                            {currentState === 'unread' && (
                              <button 
                                onClick={() => handleUpdateInquiry(inquiryData.documentId, { state: 'in-progress' })}
                                className={style.markReadBtn}
                              >
                                <FaCheckCircle />
                                Mark as In Progress
                              </button>
                            )}
                            
                            {/* Mark as Done */}
                            {currentState === 'in-progress' && (
                              <button 
                                onClick={() => handleUpdateInquiry(inquiryData.documentId, { state: 'done' })}
                                className={style.markDoneBtn}
                              >
                                <FaCheckCircle />
                                Mark as Done
                              </button>
                            )}
                            
                            {/* Reply Actions */}
                            {!inquiryData.landlordReply ? (
                              <button 
                                onClick={() => {
                                  setReplyingTo(inquiryData.documentId);
                                  setReplyMessage('');
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
                                }}
                                className={style.editReplyBtn}
                              >
                                <FaEdit />
                                Edit Reply
                              </button>
                            )}
                            
                            {/* Suggest New Date */}
                            <button 
                              onClick={() => handleSuggestDate(inquiryData.documentId)}
                              className={style.suggestDateBtn}
                            >
                              <FaClock />
                              Suggest New Date
                            </button>
                            
                            {/* Contact Student */}
                            <a 
                              href={`tel:${inquiryData.userPhone}`}
                              className={style.callStudentBtn}
                            >
                              <FaPhone />
                              Call Student
                            </a>
                          </div>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === inquiryData.documentId && (
                          <div className={style.replyForm}>
                            <h5>✍️ Your Reply to Student:</h5>
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
        /* Empty State */
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