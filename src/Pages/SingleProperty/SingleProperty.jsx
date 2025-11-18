import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import style from '../../Styles/pages/SingleProperty.module.css';
import { GET_PROPERTY_DETAILS } from './Sinlgle';
import { 
  FaBed, FaBath, FaRulerCombined, FaWifi, FaShieldAlt, FaSwimmingPool, 
  FaParking, FaUtensils, FaSun, FaGasPump, FaTint, FaBook, FaMapMarkerAlt,
  FaPhone, FaEnvelope, FaHeart, FaRegHeart, FaShoppingCart, FaCartPlus,
  FaStar, FaShare, FaSignInAlt, FaLock, FaThumbsUp, FaRegThumbsUp
} from 'react-icons/fa';
import { useAuth } from '../../Contexts/AuthContext';
import { useApp } from '../../Contexts/AppContext';

const API_BASE_URL = 'http://localhost:1337';

export default function SingleProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { user, getUserRole } = useAuth();
  const { 
    isFavorite, 
    isInShortlist, 
    toggleFavorite, 
    addToShortlist, 
    removeFromShortlist,
    createInquiry,
    isPropertyLiked,
    togglePropertyLike
  } = useApp();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: ''
  });
  const [phoneError, setPhoneError] = useState('');

  const validatePhoneNumber = (phone) => {
    if (!phone) return 'Phone number is required';
    
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
    
    if (cleanPhone.startsWith('0')) {
      return 'Phone number should not start with 0. Please use 263 format.';
    }
    
    if (!cleanPhone.startsWith('263')) {
      return 'Please use 263 country code format (e.g., 263771234567)';
    }
    
    if (cleanPhone.length !== 12) {
      return 'Phone number should be 12 digits including country code (e.g., 263771234567)';
    }
    
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      let formattedValue = value.replace(/[^\d]/g, '');
      
      if (value.startsWith('07') && value.length === 10) {
        formattedValue = '263' + value.slice(1);
      }
      
      const error = validatePhoneNumber(formattedValue);
      setPhoneError(error);
      
      setBookingData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLoginClick = () => {
    setShowLoginPrompt(false);
    navigate('/login');
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
    navigate('/listings');
  };

  const { loading, error, data } = useQuery(GET_PROPERTY_DETAILS, {
    variables: { documentId: id }
  });

  // 🔥 DEBUG: Add this to see what data we're getting
  React.useEffect(() => {
    if (data) {
      console.log('🔍 DEBUG: Full property data:', data);
      console.log('🔍 DEBUG: Landlord object:', data?.accommodation?.landlord);
      console.log('🔍 DEBUG: Landlord ID:', data?.accommodation?.landlord?.documentId);
      console.log('🔍 DEBUG: Landlord name:', data?.accommodation?.landlord?.fullName);
    }
  }, [data]);

  // NEW: Like handler
  const handleLike = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    const property = data?.accommodation;
    if (!property) return;
    
    try {
      await togglePropertyLike(property.documentId);
    } catch (error) {
      console.error('Error liking property:', error);
    }
  };

  const handleFavorite = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    const property = data?.accommodation;
    if (!property) return;
    
    toggleFavorite({ 
      id: property.documentId, 
      name: property.name || property.location?.Address 
    });
  };

  const handleShortlist = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    const property = data?.accommodation;
    if (!property) return;
    
    if (isInShortlist(property.documentId)) {
      removeFromShortlist(property.documentId);
    } else {
      addToShortlist(property);
    }
  };

  const handleBookingClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    // FIXED: Check if user is a student
    const userRole = getUserRole();
    if (userRole !== 'student' && !user.student) {
      alert('Only students can book viewing appointments. Please use a student account.');
      return;
    }
    
    setShowBookingForm(true);
  };
  
  // 🔥 FIXED: Complete booking submission with proper error handling
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const property = data?.accommodation;
      console.log('📤 Sending inquiry for property:', property);

      // Validate phone number
      const phoneError = validatePhoneNumber(bookingData.phone);
      if (phoneError) {
        setPhoneError(phoneError);
        return;
      }

      // 🔥 FIXED: Simplified inquiry data - no landlord targeting
      const inquiryData = {
        propertyId: property.documentId,
        propertyName: property.name,
        userName: bookingData.name || user.username,
        userEmail: bookingData.email || user.email,
        userPhone: bookingData.phone,
        message: bookingData.message,
        preferredDate: bookingData.date,
      };

      console.log('📝 Final inquiry data (NO LANDLORD TARGETING):', inquiryData);

      const result = await createInquiry(inquiryData);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setShowBookingForm(false);
        setBookingData({
          name: '',
          email: '',
          phone: '',
          date: '',
          message: ''
        });
        console.log('✅ Inquiry sent successfully to property:', property.documentId);
      } else {
        alert(`Failed to send inquiry: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Booking error:', error);
      alert('Failed to send inquiry. Please try again.');
    }
  };

  if (showLoginPrompt) {
    return (
      <div className={style.LoginRequired}>
        <div className={style.LoginPrompt}>
          <div className={style.LoginIcon}>
            <FaLock size={64} />
          </div>
          <h2>Authentication Required</h2>
          <p>Please log in to interact with properties and make bookings.</p>
          <div className={style.LoginActions}>
            <button 
              className={style.LoginButton}
              onClick={handleLoginClick}
            >
              <FaSignInAlt />
              Log In
            </button>
            <button 
              className={style.BackButton}
              onClick={handleCloseLoginPrompt}
            >
              Back to Listings
            </button>
          </div>
          <div className={style.LoginBenefits}>
            <h3>Benefits of creating an account:</h3>
            <ul>
              <li>Like and save favorite properties</li>
              <li>Shortlist accommodations</li>
              <li>Book viewing appointments</li>
              <li>Contact property owners</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className={style.loading}>Loading property details...</div>;
  if (error) {
    console.error('GraphQL Error:', error);
    return <div className={style.error}>Error loading property: {error.message}</div>;
  }

  const property = data?.accommodation;
  if (!property) return <div className={style.error}>Property not found</div>;

  // 🔥 DEBUG: Log the final property data
  console.log('🎯 Final property data for rendering:', {
    id: property.documentId,
    name: property.name,
    landlord: property.landlord,
    landlordId: property.landlord?.documentId
  });

  const getImageUrl = (url) => (url ? `${API_BASE_URL}${url}` : '');
  const coverImage = property.media?.CoverImage;
  const galleryImages = property.media?.Gallery || [];
  const roomImages = property.media?.Rooms || [];
  const allImages = [coverImage, ...galleryImages].filter(Boolean);
  const isLiked = isPropertyLiked(property.documentId);
  const likes = property.likes || 0;

  const generateDescription = () => {
    const { details, location } = property;
    const parts = [];
    
    if (details?.Category) parts.push(`a ${details.Category}`);
    if (details?.Bedrooms) parts.push(`with ${details.Bedrooms} bedroom${details.Bedrooms > 1 ? 's' : ''}`);
    if (details?.Bathrooms) parts.push(`and ${details.Bathrooms} bathroom${details.Bathrooms > 1 ? 's' : ''}`);
    if (location?.City) parts.push(`located in ${location.City}`);
    if (details?.distance) parts.push(`just ${details.distance}km from campus`);
    
    return parts.length > 0 
      ? `This is ${parts.join(', ')}. ${details?.isFull ? 'Currently fully occupied.' : 'Available for immediate occupancy.'}`
      : 'A comfortable student accommodation with modern amenities and convenient location near campus.';
  };

  // Check if current user is the property owner
  const isPropertyOwner = user && property.landlord?.documentId === user.landlord?.id;

  // Facilities data with availability status
  const facilities = [
    { 
      icon: FaWifi, 
      label: 'WiFi', 
      available: property.details?.Facilities?.wifi || false 
    },
    { 
      icon: FaSun, 
      label: 'Solar Power', 
      available: property.details?.Facilities?.solar || false 
    },
    { 
      icon: FaGasPump, 
      label: 'Gas', 
      available: property.details?.Facilities?.gas || false 
    },
    { 
      icon: FaShieldAlt, 
      label: 'Security', 
      available: property.details?.Facilities?.security || false 
    },
    { 
      icon: FaUtensils, 
      label: 'Kitchen', 
      available: property.details?.Facilities?.kitchen || false 
    },
    { 
      icon: FaSwimmingPool, 
      label: 'Swimming Pool', 
      available: property.details?.Facilities?.SwimmingPool || false 
    },
    { 
      icon: FaParking, 
      label: 'Parking', 
      available: property.details?.Facilities?.parking !== false 
    },
    { 
      icon: FaTint, 
      label: 'Laundry', 
      available: property.details?.Facilities?.laundry !== false 
    },
    { 
      icon: FaBook, 
      label: 'Study Area', 
      available: property.details?.Facilities?.studyArea !== false 
    }
  ];

  return (
    <div className={style.SinglePropertyBody}>
      {/* Success Message */}
      {showSuccess && (
        <div className={style.successMessage}>
          ✅ Inquiry sent successfully! The landlord will contact you soon.
        </div>
      )}

      {/* Authentication Badge */}
      {user && (
        <div className={style.AuthBadge}>
          <span>Welcome, {user.username || user.email}! </span>
          <span className={style.AuthStatus}>✓ Authenticated</span>
          <span className={style.UserRole}>
            {getUserRole() === 'landlord' ? '🏠 Landlord' : '🎓 Student'}
          </span>
          {isPropertyOwner && (
            <span className={style.OwnerBadge}>👑 Your Property</span>
          )}
        </div>
      )}

      {/* Image Gallery */}
      <section className={style.ImageGallery}>
        <div className={style.MainImage}>
          <img 
            src={getImageUrl(allImages[selectedImage]?.url)} 
            alt={allImages[selectedImage]?.alternativeText || 'Property image'}
            onError={(e) => {
              e.target.src = '/default-property.jpg';
            }}
          />
        </div>
        <div className={style.ImageThumbnails}>
          {allImages.map((image, index) => (
            <div 
              key={index}
              className={`${style.Thumbnail} ${selectedImage === index ? style.active : ''}`}
              onClick={() => setSelectedImage(index)}
            >
              <img 
                src={getImageUrl(image.url)} 
                alt={image.alternativeText || `Thumbnail ${index + 1}`}
                onError={(e) => {
                  e.target.src = '/default-property.jpg';
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Property Details */}
      <section className={style.Details}>
        <div className={style.PropertyHeader}>
          <div className={style.HeaderLeft}>
            <h1>{property.name || property.location?.Address}</h1>
            <p className={style.Address}>
              <FaMapMarkerAlt /> {property.location?.Address}, {property.location?.City}
            </p>
            <div className={style.Rating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} className={style.Star} />
              ))}
              <span>(24 reviews)</span>
            </div>
            {/* NEW: Likes display */}
            {likes > 0 && (
              <div className={style.LikesCount}>
                <FaThumbsUp />
                <span>{likes} likes</span>
              </div>
            )}
            {/* Property Owner Info */}
            {property.landlord && (
              <div className={style.LandlordInfo}>
                <small>Listed by: {property.landlord.fullName || property.landlord.users_permissions_user?.username || 'Landlord'}</small>
                {property.landlord.phoneNumber && (
                  <small>Contact: {property.landlord.phoneNumber}</small>
                )}
              </div>
            )}
          </div>
          <div className={style.HeaderRight}>
            <div className={style.Price}>
              ${property.details?.price}/month
            </div>
            <div className={style.ActionButtons}>
              {/* NEW: Like button */}
              <button 
                className={style.IconButton}
                onClick={handleLike}
                aria-label={isLiked ? 'Unlike property' : 'Like property'}
                title={isLiked ? 'Unlike' : 'Like'}
                disabled={isPropertyOwner}
              >
                {isLiked ? <FaThumbsUp color="#3498db" /> : <FaRegThumbsUp />}
              </button>
              <button 
                className={style.IconButton}
                onClick={handleFavorite}
                aria-label={isFavorite(property.documentId) ? 'Remove from favorites' : 'Add to favorites'}
                disabled={isPropertyOwner}
              >
                {isFavorite(property.documentId) ? <FaHeart color="red" /> : <FaRegHeart />}
              </button>
              <button 
                className={style.IconButton}
                onClick={handleShortlist}
                aria-label={isInShortlist(property.documentId) ? 'Remove from shortlist' : 'Add to shortlist'}
                disabled={isPropertyOwner}
              >
                {isInShortlist(property.documentId) ? <FaShoppingCart color="green" /> : <FaCartPlus />}
              </button>
              <button className={style.IconButton}>
                <FaShare />
              </button>
            </div>
          </div>
        </div>

        <div className={style.DetailsGrid}>
          {/* Basic Info */}
          <div className={style.info}>
            <h2>Property Details</h2>
            <p>{generateDescription()}</p>
            
            <div className={style.Features}>
              <div className={style.Feature}>
                <FaBed />
                <span>{property.details?.Bedrooms} Bedrooms</span>
              </div>
              <div className={style.Feature}>
                <FaBath />
                <span>{property.details?.Bathrooms} Bathrooms</span>
              </div>
              <div className={style.Feature}>
                <FaRulerCombined />
                <span>{property.details?.Category}</span>
              </div>
              <div className={style.Feature}>
                <FaMapMarkerAlt />
                <span>{property.details?.distance}km from campus</span>
              </div>
              {/* NEW: Likes in features */}
              {likes > 0 && (
                <div className={style.Feature}>
                  <FaThumbsUp />
                  <span>{likes} Likes</span>
                </div>
              )}
            </div>

            <div className={style.Availability}>
              <h3>Availability</h3>
              <div className={`${style.Status} ${property.details?.isFull ? style.Unavailable : style.Available}`}>
                {property.details?.isFull ? 'Currently Full' : 'Available Now'}
              </div>
            </div>
          </div>

          {/* Facilities - IMPROVED WITH AVAILABILITY STATUS */}
          <div className={style.facilities}>
            <h2>Facilities & Amenities</h2>
            <div className={style.FacilitiesGrid}>
              {facilities.map((facility, index) => {
                const IconComponent = facility.icon;
                return (
                  <div
                    key={index}
                    className={`${style.Facility} ${
                      facility.available ? style.available : style.unavailable
                    }`}
                    title={facility.available ? `${facility.label} - Available` : `${facility.label} - Not Available`}
                  >
                    <IconComponent />
                    <span>{facility.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact & Booking */}
          <div className={style.addresses}>
            <h2>Contact & Booking</h2>
            <div className={style.ContactInfo}>
              <h3>Property Information</h3>
              <p>
                For more information about this property or to schedule a viewing, 
                please use the booking form below. Our team will contact you with 
                owner details and availability.
              </p>
            </div>

            <button 
              className={style.BookButton}
              onClick={handleBookingClick}
              disabled={property.details?.isFull}
            >
              {property.details?.isFull ? 'Currently Unavailable' : 'Book Viewing Appointment'}
            </button>

            {/* 🔥 NEW: Landlord contact info if available */}
            {property.landlord && (
              <div className={style.LandlordContact}>
                <h3>Property Owner</h3>
                <p><strong>Name:</strong> {property.landlord.fullName || 'Not specified'}</p>
                {property.landlord.phoneNumber && (
                  <p><strong>Phone:</strong> {property.landlord.phoneNumber}</p>
                )}
                {property.landlord.users_permissions_user?.email && (
                  <p><strong>Email:</strong> {property.landlord.users_permissions_user.email}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      {roomImages.length > 0 && (
        <section className={style.Rooms}>
          <h2>Room Photos</h2>
          <div className={style.RoomsGrid}>
            {roomImages.map((room, index) => (
              <div key={index} className={style.RoomImage}>
                <img 
                  src={getImageUrl(room.url)} 
                  alt={room.alternativeText || `Room ${index + 1}`}
                  onError={(e) => {
                    e.target.src = '/default-property.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video Container */}
      <div className={style.VideoContainer}>
        <h2>Virtual Tour</h2>
        <div className={style.VideoPlaceholder}>
          <p>Virtual tour video coming soon</p>
          <button className={style.VideoButton}>Request Video Tour</button>
        </div>
      </div>

      {/* Contact Information */}
      <section className={style.SinglePropertyContactInfo}>
        <h2>Get in Touch</h2>
        <div className={style.ContactGrid}>
          <div className={style.ContactCard}>
            <FaPhone />
            <h3>Call Us</h3>
            <p>+27 12 345 6789</p>
            <button className={style.ContactButton}>Call Now</button>
          </div>
          <div className={style.ContactCard}>
            <FaEnvelope />
            <h3>Email Us</h3>
            <p>info@varsitycribs.co.za</p>
            <button className={style.ContactButton}>Send Email</button>
          </div>
          <div className={style.ContactCard}>
            <FaMapMarkerAlt />
            <h3>Visit Office</h3>
            <p>123 University Street, City</p>
            <button className={style.ContactButton}>Get Directions</button>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingForm && (
        <div className={style.ModalOverlay}>
          <div className={style.Modal}>
            <h2>Book Viewing Appointment</h2>
            <div className={style.UserInfo}>
              <p>Booking as: <strong>{user.username || user.email}</strong> ({user.email})</p>
              <p>Role: <strong>{getUserRole()}</strong></p>
              <p>Property: <strong>{property.name}</strong></p>
              {property.landlord && (
                <p>Landlord: <strong>{property.landlord.fullName || 'Landlord'}</strong></p>
              )}
            </div>
            <form onSubmit={handleBookingSubmit}>
              <div className={style.FormGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={bookingData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={user.username || user.email}
                />
              </div>
              <div className={style.FormGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                  required
                  placeholder={user.email}
                />
              </div>
              <div className={style.FormGroup}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="263771234567"
                  className={phoneError ? style.errorInput : ''}
                />
                {phoneError && (
                  <div className={style.errorMessage}>
                    {phoneError}
                  </div>
                )}
                <div className={style.phoneHint}>
                  Format: 263 followed by 9 digits (e.g., 263771234567)
                </div>
              </div>
              <div className={style.FormGroup}>
                <label>Preferred Date *</label>
                <input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className={style.FormGroup}>
                <label>Additional Message</label>
                <textarea
                  name="message"
                  value={bookingData.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Any specific requirements or questions..."
                />
              </div>
              <div className={style.ModalActions}>
                <button 
                  type="button" 
                  className={style.CancelButton}
                  onClick={() => {
                    setShowBookingForm(false);
                    setPhoneError('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={style.SubmitButton}
                  disabled={!!phoneError}
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}