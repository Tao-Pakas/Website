import React, { useState, useEffect } from 'react';
import styles from '../Styles/global.css/EditPropertyModal.module.css';

// Add enum mapping functions at the top level
const mapCategoryToStrapi = (category) => {
  if (!category) return 'Boarding';
  
  const categoryMap = {
    'boarding': 'Boarding',
    'family house': 'Family_House',
    'family_house': 'Family_House',
    'hotel': 'Hotel',
    'motel': 'Motel',
    'apartment': 'Boarding',
    'house': 'Family_House',
    'condo': 'Boarding',
    'studio': 'Boarding'
  };
  const lowerCategory = category.toLowerCase().trim();
  return categoryMap[lowerCategory] || 'Boarding';
};

const mapTypeToStrapi = (type) => {
  if (!type) return 'Mixed';
  
  const typeMap = {
    'mixed': 'Mixed',
    'females only': 'Females_Only',
    'females_only': 'Females_Only',
    'males only': 'Males_Only',
    'males_only': 'Males_Only',
    'rental': 'Mixed',
    'lease': 'Mixed',
    'sale': 'Mixed'
  };
  const lowerType = type.toLowerCase().trim();
  return typeMap[lowerType] || 'Mixed';
};

const EditPropertyModal = ({ property, onClose, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (property) {
      // Transform the property data to match form structure
      setFormData({
        name: property.name || '',
        location: {
          Address: property.location?.Address || '',
          City: property.location?.City || 'Chinhoyi',
          latitude: property.location?.latitude || '',
          longitude: property.location?.longitude || ''
        },
        media: {
          CoverImage: null, // Will handle file upload separately
          Gallery: [],
          Rooms: [],
          ShowCase: []
        },
        details: {
          Bathrooms: property.details?.Bathrooms || '',
          Bedrooms: property.details?.Bedrooms || '',
          price: property.details?.price || '',
          Category: property.details?.Category || '',
          Type: property.details?.Type || '',
          distance: property.details?.distance || '',
          isFull: property.details?.isFull || false,
          Facilities: {
            kitchen: property.details?.Facilities?.kitchen || false,
            SwimmingPool: property.details?.Facilities?.SwimmingPool || false,
            gas: property.details?.Facilities?.gas || false,
            security: property.details?.Facilities?.security || false,
            solar: property.details?.Facilities?.solar || false,
            wifi: property.details?.Facilities?.wifi || false
          }
        }
      });
    }
  }, [property]);

  // Input change handlers (same as AddPropertyModal)
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleDetailsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value
      }
    }));
  };

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

  const handleFileChange = (field, files) => {
    if (field === 'CoverImage') {
      setFormData(prev => ({
        ...prev,
        media: {
          ...prev.media,
          CoverImage: files[0]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        media: {
          ...prev.media,
          [field]: Array.from(files)
        }
      }));
    }
  };

  const removeFile = (mediaType, fileIndex) => {
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        [mediaType]: prev.media[mediaType].filter((_, index) => index !== fileIndex)
      }
    }));
  };

  // In EditPropertyModal.js - Update the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData) return;

  setLoading(true);
  setError('');

  try {
    console.log('Updating property:', property.id, formData);
    
    // Prepare data in the CORRECT format for Strapi
    const submissionData = {
      name: formData.name,
      location: {
        Address: formData.location.Address,
        City: formData.location.City,
        longitude: parseFloat(formData.location.longitude) || 0,
        latitude: parseFloat(formData.location.latitude) || 0
      },
      details: {
        Bedrooms: parseInt(formData.details.Bedrooms) || 0,
        Bathrooms: parseInt(formData.details.Bathrooms) || 0,
        price: parseFloat(formData.details.price) || 0,
        Category: formData.details.Category || 'Boarding',
        Type: formData.details.Type || 'Mixed',
        distance: parseInt(formData.details.distance) || null,
        isFull: formData.details.isFull || null,
        Facilities: {
          kitchen: formData.details.Facilities.kitchen || false,
          SwimmingPool: formData.details.Facilities.SwimmingPool || false,
          gas: formData.details.Facilities.gas || false,
          security: formData.details.Facilities.security || false,
          solar: formData.details.Facilities.solar || false,
          wifi: formData.details.Facilities.wifi || false
        }
      },
      media: {
        CoverImage: formData.media.CoverImage,
        Gallery: formData.media.Gallery || [],
        Rooms: formData.media.Rooms || [],
        ShowCase: formData.media.ShowCase || []
      }
    };

    console.log('Final submission data for update:', submissionData);
    
    await onSave(property.id, submissionData);
    onClose();
  } catch (err) {
    console.error('Error updating property:', err);
    setError(err.message || 'Failed to update property. Please try again.');
  } finally {
    setLoading(false);
  }
};

  if (!formData) {
    return (
      <div className={styles.overlay}>
        <div className={styles.content}>
          <div className={styles.loading}>Loading property data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2>Edit Property</h2>
          <button 
            className={styles.closeBtn} 
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Basic Information Section */}
          <div className={styles.section}>
            <h3>Basic Information</h3>
            
            <div className={styles.formGroup}>
              <label>Property Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Enter property name"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Address</label>
              <input
                type="text"
                value={formData.location.Address}
                onChange={(e) => handleLocationChange('Address', e.target.value)}
                required
                placeholder="Enter full address"
              />
            </div>

            <div className={styles.formGroup}>
              <label>City</label>
              <input
                type="text"
                value={formData.location.City}
                onChange={(e) => handleLocationChange('City', e.target.value)}
                required
                placeholder="Enter city"
              />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.longitude}
                  onChange={(e) => handleLocationChange('longitude', e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.latitude}
                  onChange={(e) => handleLocationChange('latitude', e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Property Details Section */}
          <div className={styles.section}>
            <h3>Property Details</h3>
            
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  value={formData.details.Bedrooms}
                  onChange={(e) => handleDetailsChange('Bedrooms', e.target.value)}
                  required
                  placeholder="Number of bedrooms"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  value={formData.details.Bathrooms}
                  onChange={(e) => handleDetailsChange('Bathrooms', e.target.value)}
                  required
                  placeholder="Number of bathrooms"
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select
                  value={formData.details.Category}
                  onChange={(e) => handleDetailsChange('Category', e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Boarding">Boarding</option>
                  <option value="Family_House">Family House</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Motel">Motel</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Property Type</label>
                <select
                  value={formData.details.Type}
                  onChange={(e) => handleDetailsChange('Type', e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Females_Only">Females Only</option>
                  <option value="Males_Only">Males Only</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Price (per month)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.details.price}
                onChange={(e) => handleDetailsChange('price', e.target.value)}
                required
                placeholder="Enter monthly price"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Distance from Campus (km)</label>
              <input
                type="number"
                min="0"
                value={formData.details.distance}
                onChange={(e) => handleDetailsChange('distance', e.target.value)}
                placeholder="Distance in kilometers"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.details.isFull}
                  onChange={(e) => handleDetailsChange('isFull', e.target.checked)}
                />
                Currently Rented Out
              </label>
            </div>

            <div className={styles.facilities}>
              <h4>Facilities</h4>
              <div className={styles.facilitiesGrid}>
                {Object.keys(formData.details.Facilities).map(facility => (
                  <label key={facility} className={styles.facility}>
                    <input
                      type="checkbox"
                      checked={formData.details.Facilities[facility]}
                      onChange={(e) => handleFacilityChange(facility, e.target.checked)}
                    />
                    <span className={styles.facilityIcon}>
                      {facility === 'wifi' && '📶'}
                      {facility === 'solar' && '☀️'}
                      {facility === 'gas' && '🔥'}
                      {facility === 'security' && '🛡️'}
                      {facility === 'kitchen' && '👨‍🍳'}
                      {facility === 'SwimmingPool' && '🏊'}
                    </span>
                    {facility.charAt(0).toUpperCase() + facility.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Media Upload Section */}
          <div className={styles.section}>
            <h3>Property Images</h3>
            
            <div className={styles.formGroup}>
              <label>Cover Image</label>
              <p className={styles.existingNote}>
                Current image: {property.media?.CoverImage?.url ? '✓' : 'None'}
              </p>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="coverImage"
                  accept="image/*"
                  onChange={(e) => handleFileChange('CoverImage', e.target.files)}
                  className={styles.fileInput}
                />
                <label htmlFor="coverImage" className={styles.uploadBtn}>
                  📷 Change Cover Image
                </label>
              </div>
              {formData.media.CoverImage && (
                <div className={styles.filePreview}>
                  <span>New: {formData.media.CoverImage.name}</span>
                  <button 
                    type="button" 
                    className={styles.removeFile}
                    onClick={() => setFormData(prev => ({ ...prev, media: { ...prev.media, CoverImage: null } }))}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Gallery Images</label>
              <p className={styles.existingNote}>
                Current images: {property.media?.Gallery?.length || 0}
              </p>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="gallery"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange('Gallery', e.target.files)}
                  className={styles.fileInput}
                />
                <label htmlFor="gallery" className={styles.uploadBtn}>
                  🖼️ Add More Gallery Images
                </label>
              </div>
              {formData.media.Gallery.length > 0 && (
                <div className={styles.mediaPreview}>
                  <p>{formData.media.Gallery.length} new gallery images:</p>
                  <div className={styles.fileList}>
                    {formData.media.Gallery.map((file, index) => (
                      <div key={index} className={styles.fileItem}>
                        🖼️ {file.name}
                        <button 
                          type="button"
                          className={styles.removeFile}
                          onClick={() => removeFile('Gallery', index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Room Images</label>
              <p className={styles.existingNote}>
                Current images: {property.media?.Rooms?.length || 0}
              </p>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="rooms"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange('Rooms', e.target.files)}
                  className={styles.fileInput}
                />
                <label htmlFor="rooms" className={styles.uploadBtn}>
                  🛏️ Add More Room Images
                </label>
              </div>
              {formData.media.Rooms.length > 0 && (
                <div className={styles.mediaPreview}>
                  <p>{formData.media.Rooms.length} new room images:</p>
                  <div className={styles.fileList}>
                    {formData.media.Rooms.map((file, index) => (
                      <div key={index} className={styles.fileItem}>
                        🖼️ {file.name}
                        <button 
                          type="button"
                          className={styles.removeFile}
                          onClick={() => removeFile('Rooms', index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Showcase Videos & Images</label>
              <p className={styles.existingNote}>
                Current media: {property.media?.ShowCase?.length || 0}
              </p>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="showcase"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => handleFileChange('ShowCase', e.target.files)}
                  className={styles.fileInput}
                />
                <label htmlFor="showcase" className={styles.uploadBtn}>
                  🎥 Add More Showcase Media
                </label>
              </div>
              {formData.media.ShowCase.length > 0 && (
                <div className={styles.mediaPreview}>
                  <p>{formData.media.ShowCase.length} new showcase files:</p>
                  <div className={styles.fileList}>
                    {formData.media.ShowCase.map((file, index) => (
                      <div key={index} className={styles.fileItem}>
                        {file.type.includes('video') ? '🎥' : '🖼️'} {file.name}
                        <button 
                          type="button"
                          className={styles.removeFile}
                          onClick={() => removeFile('ShowCase', index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.primaryBtn}
              disabled={loading}
            >
              {loading ? 'Updating Property...' : 'Update Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyModal;