import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import style from '../../Styles/pages/SingleProperty.module.css';
import { GET_PROPERTY_DETAILS } from './Sinlgle';
import { 
  FaBed, 
  FaBath, 
  FaRulerCombined, 
  FaWifi, 
  FaShieldAlt, 
  FaSwimmingPool, 
  FaParking, 
  FaUtensils,
  FaSun,
  FaGasPump,
  FaTint,
  FaBook,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaCartPlus,
  FaStar,
  FaShare,
  FaSignInAlt,
  FaLock
} from 'react-icons/fa';
import { useApp } from '../../Contexts/AppContext';

const API_BASE_URL = 'http://localhost:1337';

export default function SingleProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, login, isFavorite, isInShortlist, toggleFavorite, addToShortlist, removeFromShortlist } = useApp();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: ''
  });

  const { loading, error, data } = useQuery(GET_PROPERTY_DETAILS, {
    variables: { documentId: id },
    skip: !user // Skip query if user is not logged in
  });

  // Redirect to login prompt if user is not authenticated
  useEffect(() => {
    if (!user) {
      setShowLoginPrompt(true);
    }
  }, [user]);

  const handleLoginClick = () => {
    setShowLoginPrompt(false);
    // You can redirect to login page or show login modal
    navigate('/login'); // Or use your login modal logic
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
    navigate('/listings'); // Redirect back to listings
  };

  const handleFavorite = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
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
    setShowBookingForm(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    console.log('Booking data:', bookingData);
    alert('Booking request submitted! We will contact you soon.');
    setShowBookingForm(false);
    setBookingData({ name: '', email: '', phone: '', date: '', message: '' });
  };

  const handleInputChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className={style.LoginRequired}>
        <div className={style.LoginPrompt}>
          <div className={style.LoginIcon}>
            <FaLock size={64} />
          </div>
          <h2>Authentication Required</h2>
          <p>Please log in to view property details and make bookings.</p>
          <div className={style.LoginActions}>
            
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
              <li>View complete property details</li>
              <li>Save favorite properties</li>
              <li>Shortlist accommodations</li>
              <li>Book viewing appointments</li>
              <li>Contact property owners</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Show loading/error states only after authentication check
  if (loading) return <div className={style.loading}>Loading property details...</div>;
  if (error) return <div className={style.error}>Error: {error.message}</div>;

  const property = data?.accommodation;
  if (!property) return <div className={style.error}>Property not found</div>;

  const getImageUrl = (url) => (url ? `${API_BASE_URL}${url}` : '');
  const coverImage = property.media?.CoverImage;
  const galleryImages = property.media?.Gallery || [];
  const roomImages = property.media?.Rooms || [];
  const allImages = [coverImage, ...galleryImages].filter(Boolean);

  // Generate a description based on available data
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

  return (
    <div className={style.SinglePropertyBody}>
      {/* Authentication Badge */}
      <div className={style.AuthBadge}>
        <span>Welcome, {user.name}! </span>
        <span className={style.AuthStatus}>✓ Authenticated</span>
      </div>

      {/* Image Gallery */}
      <section className={style.ImageGallery}>
        <div className={style.MainImage}>
          <img 
            src={getImageUrl(allImages[selectedImage]?.url)} 
            alt={allImages[selectedImage]?.alternativeText || 'Property image'}
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
          </div>
          <div className={style.HeaderRight}>
            <div className={style.Price}>
              ${property.details?.price}/month
            </div>
            <div className={style.ActionButtons}>
              <button 
                className={style.IconButton}
                onClick={handleFavorite}
                aria-label={isFavorite(property.documentId) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite(property.documentId) ? <FaHeart color="red" /> : <FaRegHeart />}
              </button>
              <button 
                className={style.IconButton}
                onClick={handleShortlist}
                aria-label={isInShortlist(property.documentId) ? 'Remove from shortlist' : 'Add to shortlist'}
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
            </div>

            <div className={style.Availability}>
              <h3>Availability</h3>
              <div className={`${style.Status} ${property.details?.isFull ? style.Unavailable : style.Available}`}>
                {property.details?.isFull ? 'Currently Full' : 'Available Now'}
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className={style.facilities}>
            <h2>Facilities & Amenities</h2>
            <div className={style.FacilitiesGrid}>
              {property.details?.Facilities?.wifi && (
                <div className={style.Facility}>
                  <FaWifi />
                  <span>WiFi</span>
                </div>
              )}
              {property.details?.Facilities?.solar && (
                <div className={style.Facility}>
                  <FaSun />
                  <span>Solar Power</span>
                </div>
              )}
              {property.details?.Facilities?.gas && (
                <div className={style.Facility}>
                  <FaGasPump />
                  <span>Gas</span>
                </div>
              )}
              {property.details?.Facilities?.security && (
                <div className={style.Facility}>
                  <FaShieldAlt />
                  <span>Security</span>
                </div>
              )}
              {property.details?.Facilities?.kitchen && (
                <div className={style.Facility}>
                  <FaUtensils />
                  <span>Kitchen</span>
                </div>
              )}
              {property.details?.Facilities?.SwimmingPool && (
                <div className={style.Facility}>
                  <FaSwimmingPool />
                  <span>Swimming Pool</span>
                </div>
              )}
              {/* Add common facilities that might not be in the schema */}
              <div className={style.Facility}>
                <FaParking />
                <span>Parking</span>
              </div>
              <div className={style.Facility}>
                <FaTint />
                <span>Laundry</span>
              </div>
              <div className={style.Facility}>
                <FaBook />
                <span>Study Area</span>
              </div>
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
              <p>Booking as: <strong>{user.name}</strong> ({user.email})</p>
            </div>
            <form onSubmit={handleBookingSubmit}>
              <div className={style.FormGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={bookingData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={user.name} // Pre-fill with user's name
                />
              </div>
              <div className={style.FormGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                  required
                  placeholder={user.email} // Pre-fill with user's email
                />
              </div>
              <div className={style.FormGroup}>
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={style.FormGroup}>
                <label>Preferred Date</label>
                <input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleInputChange}
                  required
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
                  onClick={() => setShowBookingForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={style.SubmitButton}>
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