import React, { useState } from 'react';
import styles from '../../Styles/components/HouseForm.module.css';

const HouseForm = () => {
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    
    // Media
    media: {
      CoverImage: null,
      Gallery: [],
      Rooms: [],
      ShowCase: [],
      Vedio: null 
    },
    
    // Location
    location: {
      Address: '',
      City: '',
      longitude: '',
      latitude: ''
    },
    
    // Details
    details: {
      Bedrooms: '',
      Bathrooms: '',
      isFull: false,
      Category: '',
      Type: '',
      Facilities: {
        wifi: false,
        solar: false,
        gas: false,
        security: false,
        kitchen: false,
        SwimmingPool: false
      },
      price: '',
      distance: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle facility changes
  const handleFacilityChange = (facility, value) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        Facilities: {
          ...prev.details.Facilities,
          [facility]: value
        }
      }
    }));
  };

  // Handle file uploads
  const handleFileUpload = (mediaType, files) => {
    const fileArray = Array.from(files);
    
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        [mediaType]: mediaType === 'CoverImage' ? fileArray[0] : [...prev.media[mediaType], ...fileArray]
      }
    }));
  };

  // Remove media item
  const removeMediaItem = (mediaType, index) => {
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        [mediaType]: mediaType === 'CoverImage' ? null : prev.media[mediaType].filter((_, i) => i !== index)
      }
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.name.trim()) newErrors.name = 'Property name is required';
    if (!formData.media.CoverImage) newErrors.coverImage = 'Cover image is required';
    if (!formData.location.Address.trim()) newErrors.address = 'Address is required';
    if (!formData.location.City.trim()) newErrors.city = 'City is required';
    if (!formData.details.Bedrooms) newErrors.bedrooms = 'Number of bedrooms is required';
    if (!formData.details.Bathrooms) newErrors.bathrooms = 'Number of bathrooms is required';
    if (!formData.details.price) newErrors.price = 'Price is required';
    if (!formData.details.Category) newErrors.category = 'Category is required';
    if (!formData.details.Type) newErrors.type = 'Property type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      // Reset form after successful submission
      setFormData({
        name: '',
        media: { CoverImage: null, Gallery: [], Rooms: [], ShowCase: [] },
        location: { Address: '', City: '', longitude: '', latitude: '' },
        details: {
          Bedrooms: '', Bathrooms: '', isFull: false, Category: '', Type: '',
          Facilities: { wifi: false, solar: false, gas: false, security: false, kitchen: false, SwimmingPool: false },
          price: '', distance: ''
        }
      });
      
    } catch (error) {
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Categories and types
  const categories = ['Apartment', 'House', 'Studio', 'Shared Room', 'Private Room'];
  const propertyTypes = ['Rental', 'Sale', 'Lease'];

  return (
    <div className={styles.HouseForm}>
      <div className={styles.formHeader}>
        <h1>Add New Property</h1>
        <p>Fill in the details below to list your property</p>
      </div>

      <div className={styles.formContainer}>
        {success && (
          <div className={styles.successMessage}>
            ✅ Property added successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className={loading ? styles.loading : ''}>
          {/* Basic Information Section */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>🏠</div>
              <h2>Basic Information</h2>
            </div>
            
            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>
                Property Name
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.name ? styles.error : ''}`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', 'name', e.target.value)}
                placeholder="Enter property name"
              />
              {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
            </div>
          </div>

          {/* Media Section */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>📷</div>
              <h2>Media</h2>
            </div>

            {/* Cover Image */}
            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.required}`}>
                Cover Image
              </label>
              <div 
                className={styles.mediaUpload}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add(styles.dragOver);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(styles.dragOver);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(styles.dragOver);
                  handleFileUpload('CoverImage', e.dataTransfer.files);
                }}
              >
                <div className={styles.uploadIcon}>📁</div>
                <div className={styles.uploadText}>
                  {formData.media.CoverImage 
                    ? `Cover Image: ${formData.media.CoverImage.name}`
                    : 'Drag & drop cover image or click to browse'
                  }
                </div>
                <input
                  type="file"
                  id="coverImage"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('CoverImage', e.target.files)}
                  className={styles.fileInput}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => document.getElementById('coverImage').click()}
                >
                  Browse Files
                </button>
              </div>
              {errors.coverImage && <div className={styles.errorMessage}>{errors.coverImage}</div>}
            </div>

            {/* Gallery Images */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Gallery Images</label>
              <div className={styles.mediaUpload}>
                <div className={styles.uploadIcon}>🖼️</div>
                <div className={styles.uploadText}>
                  Add multiple images to showcase your property
                </div>
                <input
                  type="file"
                  id="gallery"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload('Gallery', e.target.files)}
                  className={styles.fileInput}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => document.getElementById('gallery').click()}
                >
                  Add Gallery Images
                </button>
              </div>
              
              {formData.media.Gallery.length > 0 && (
                <div className={styles.mediaPreview}>
                  {formData.media.Gallery.map((file, index) => (
                    <div key={index} className={styles.mediaItem}>
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Gallery ${index + 1}`}
                        className={styles.mediaImage}
                      />
                      <button
                        type="button"
                        className={styles.mediaRemove}
                        onClick={() => removeMediaItem('Gallery', index)}
                      >
                        ×
                      </button>
                      <div className={styles.mediaType}>Gallery</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Room Images */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Room Images</label>
              <div className={styles.mediaUpload}>
                <div className={styles.uploadIcon}>🛏️</div>
                <div className={styles.uploadText}>
                  Add images of individual rooms
                </div>
                <input
                  type="file"
                  id="rooms"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload('Rooms', e.target.files)}
                  className={styles.fileInput}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => document.getElementById('rooms').click()}
                >
                  Add Room Images
                </button>
              </div>
              
              {formData.media.Rooms.length > 0 && (
                <div className={styles.mediaPreview}>
                  {formData.media.Rooms.map((file, index) => (
                    <div key={index} className={styles.mediaItem}>
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Room ${index + 1}`}
                        className={styles.mediaImage}
                      />
                      <button
                        type="button"
                        className={styles.mediaRemove}
                        onClick={() => removeMediaItem('Rooms', index)}
                      >
                        ×
                      </button>
                      <div className={styles.mediaType}>Room</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Showcase Images */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Showcase Images</label>
              <div className={styles.mediaUpload}>
                <div className={styles.uploadIcon}>⭐</div>
                <div className={styles.uploadText}>
                  Add highlight/showcase images
                </div>
                <input
                  type="file"
                  id="showcase"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload('ShowCase', e.target.files)}
                  className={styles.fileInput}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => document.getElementById('showcase').click()}
                >
                  Add Showcase Images
                </button>
              </div>
              
              {formData.media.ShowCase.length > 0 && (
                <div className={styles.mediaPreview}>
                  {formData.media.ShowCase.map((file, index) => (
                    <div key={index} className={styles.mediaItem}>
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Showcase ${index + 1}`}
                        className={styles.mediaImage}
                      />
                      <button
                        type="button"
                        className={styles.mediaRemove}
                        onClick={() => removeMediaItem('ShowCase', index)}
                      >
                        ×
                      </button>
                      <div className={styles.mediaType}>Showcase</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location Section */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>📍</div>
              <h2>Location</h2>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${styles.required}`}>
                  Address
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.address ? styles.error : ''}`}
                  value={formData.location.Address}
                  onChange={(e) => handleInputChange('location', 'Address', e.target.value)}
                  placeholder="Full address"
                />
                {errors.address && <div className={styles.errorMessage}>{errors.address}</div>}
              </div>
              
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${styles.required}`}>
                  City
                </label>
                <input
                  type="text"
                  className={`${styles.input} ${errors.city ? styles.error : ''}`}
                  value={formData.location.City}
                  onChange={(e) => handleInputChange('location', 'City', e.target.value)}
                  placeholder="City"
                />
                {errors.city && <div className={styles.errorMessage}>{errors.city}</div>}
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Longitude</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.location.longitude}
                  onChange={(e) => handleInputChange('location', 'longitude', e.target.value)}
                  placeholder="e.g., -73.935242"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Latitude</label>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.location.latitude}
                  onChange={(e) => handleInputChange('location', 'latitude', e.target.value)}
                  placeholder="e.g., 40.730610"
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Map Preview</label>
              <div className={styles.mapContainer}>
                {/* You would integrate with a map library like Google Maps or Leaflet here */}
                <div style={{ 
                  height: '100%', 
                  background: '#e9ecef', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#7f8c8d'
                }}>
                  Map will be displayed here
                </div>
              </div>
            </div>
          </div>

          {/* Property Details Section */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>📋</div>
              <h2>Property Details</h2>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${styles.required}`}>
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  className={`${styles.input} ${errors.bedrooms ? styles.error : ''}`}
                  value={formData.details.Bedrooms}
                  onChange={(e) => handleInputChange('details', 'Bedrooms', e.target.value)}
                  placeholder="Number of bedrooms"
                />
                {errors.bedrooms && <div className={styles.errorMessage}>{errors.bedrooms}</div>}
              </div>
              
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${styles.required}`}>
                  Bathrooms
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className={`${styles.input} ${errors.bathrooms ? styles.error : ''}`}
                  value={formData.details.Bathrooms}
                  onChange={(e) => handleInputChange('details', 'Bathrooms', e.target.value)}
                  placeholder="Number of bathrooms"
                />
                {errors.bathrooms && <div className={styles.errorMessage}>{errors.bathrooms}</div>}
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${styles.required}`}>
                  Category
                </label>
                <select
                  className={`${styles.select} ${errors.category ? styles.error : ''}`}
                  value={formData.details.Category}
                  onChange={(e) => handleInputChange('details', 'Category', e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <div className={styles.errorMessage}>{errors.category}</div>}
              </div>
              
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${styles.required}`}>
                  Property Type
                </label>
                <select
                  className={`${styles.select} ${errors.type ? styles.error : ''}`}
                  value={formData.details.Type}
                  onChange={(e) => handleInputChange('details', 'Type', e.target.value)}
                >
                  <option value="">Select Type</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <div className={styles.errorMessage}>{errors.type}</div>}
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${styles.required}`}>
                  Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${styles.input} ${errors.price ? styles.error : ''}`}
                  value={formData.details.price}
                  onChange={(e) => handleInputChange('details', 'price', e.target.value)}
                  placeholder="Monthly rent or sale price"
                />
                {errors.price && <div className={styles.errorMessage}>{errors.price}</div>}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Distance from Campus Km
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={styles.input}
                  value={formData.details.distance}
                  onChange={(e) => handleInputChange('details', 'distance', e.target.value)}
                  placeholder="Distance in Km"
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={formData.details.isFull}
                  onChange={(e) => handleInputChange('details', 'isFull', e.target.checked)}
                />
                Property is fully occupied
              </label>
            </div>
          </div>

          {/* Facilities Section */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>🔧</div>
              <h2>Facilities & Amenities</h2>
            </div>
            
            <div className={styles.checkboxGroup}>
              {Object.keys(formData.details.Facilities).map(facility => (
                <label key={facility} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={formData.details.Facilities[facility]}
                    onChange={(e) => handleFacilityChange(facility, e.target.checked)}
                  />
                  {facility.charAt(0).toUpperCase() + facility.slice(1).replace(/([A-Z])/g, ' $1')}
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Adding Property...' : 'Add Property'}
              {!loading && '✅'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HouseForm;