import React, { useState } from 'react';
import styles from '../Styles/global.css/AddPropertyModal.module.css';

const AddPropertyModal = ({ onClose, onSave, userId }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: {
      Address: '',
      City: "Chinhoyi", 
      latitude: '',
      longitude: ''
    },
    media: {
      CoverImage: null,
      Gallery: [],
      Rooms: [],
      ShowCase: []
    },
    details: {
      Bathrooms: '',
      Bedrooms: '',
      price: '',
      Category: '',
      Type: '',
      distance: '',
      isFull: false,
      Facilities: {
        kitchen: false,
        SwimmingPool: false,
        gas: false,
        security: false,
        solar: false,
        wifi: false
      }
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Fixed: Simplified input change handlers
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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.location.Address && formData.location.City;
      case 2:
        return formData.details.Bedrooms && formData.details.Bathrooms && formData.details.price;
      case 3:
        return formData.media.CoverImage;
      default:
        return true;
    }
  };

  // In AddPropertyModal.js - Update the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    console.log('Submitting property data:', formData);
    
    // Prepare the data in the CORRECT format for Strapi
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

    console.log('Final submission data:', submissionData);
    
    // Call the onSave prop with the formatted data
    await onSave(submissionData);
    
    // Close modal on success
    onClose();
  } catch (error) {
    console.error('Error submitting property:', error);
    setError('Failed to submit property. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      alert('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2>Add New Property</h2>
          <button 
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className={styles.progress}>
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`${styles.step} ${
                step === currentStep ? styles.active : ''
              } ${
                step < currentStep ? styles.completed : ''
              }`}
            >
              Step {step}
            </div>
          ))}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <h3>Basic Information</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.required}>Property Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Enter property name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.required}>Address</label>
                <input
                  type="text"
                  value={formData.location.Address}
                  onChange={(e) => handleLocationChange('Address', e.target.value)}
                  required
                  placeholder="Enter full address"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.required}>City</label>
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
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <div className={styles.stepContent}>
              <h3>Property Details</h3>
              
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.required}>Bedrooms</label>
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
                  <label className={styles.required}>Bathrooms</label>
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
                  <label className={styles.required}>Category</label>
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
                  <label className={styles.required}>Property Type</label>
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
                <label className={styles.required}>Price (per month)</label>
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
          )}

          {/* Step 3: Media Upload */}
          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <h3>Property Images</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.required}>Cover Image</label>
                <div className={styles.fileUpload}>
                  <input
                    type="file"
                    id="coverImage"
                    accept="image/*"
                    onChange={(e) => handleFileChange('CoverImage', e.target.files)}
                    required
                    className={styles.fileInput}
                  />
                  <label htmlFor="coverImage" className={styles.uploadBtn}>
                    📷 Choose Cover Image
                  </label>
                </div>
                {formData.media.CoverImage && (
                  <div className={styles.filePreview}>
                    <span>Selected: {formData.media.CoverImage.name}</span>
                    <button 
                      type="button" 
                      className={styles.removeFile}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        media: { ...prev.media, CoverImage: null } 
                      }))}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Gallery Images</label>
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
                    🖼️ Add Gallery Images
                  </label>
                </div>
                {formData.media.Gallery.length > 0 && (
                  <div className={styles.mediaPreview}>
                    <p>{formData.media.Gallery.length} gallery images selected:</p>
                    <div className={styles.fileList}>
                      {formData.media.Gallery.map((file, index) => (
                        <div key={index} className={styles.fileItem}>
                          🖼️ {file.name}
                          <button 
                            type="button"
                            className={styles.removeFile}
                            onClick={() => {
                              const newGallery = formData.media.Gallery.filter((_, i) => i !== index);
                              setFormData(prev => ({ 
                                ...prev, 
                                media: { ...prev.media, Gallery: newGallery } 
                              }));
                            }}
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
                    🛏️ Add Room Images
                  </label>
                </div>
                {formData.media.Rooms.length > 0 && (
                  <div className={styles.mediaPreview}>
                    <p>{formData.media.Rooms.length} room images selected:</p>
                    <div className={styles.fileList}>
                      {formData.media.Rooms.map((file, index) => (
                        <div key={index} className={styles.fileItem}>
                          🖼️ {file.name}
                          <button 
                            type="button"
                            className={styles.removeFile}
                            onClick={() => {
                              const newRooms = formData.media.Rooms.filter((_, i) => i !== index);
                              setFormData(prev => ({ 
                                ...prev, 
                                media: { ...prev.media, Rooms: newRooms } 
                              }));
                            }}
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
                    🎥 Add Showcase Media
                  </label>
                </div>
                {formData.media.ShowCase.length > 0 && (
                  <div className={styles.mediaPreview}>
                    <p>{formData.media.ShowCase.length} showcase files selected:</p>
                    <div className={styles.fileList}>
                      {formData.media.ShowCase.map((file, index) => (
                        <div key={index} className={styles.fileItem}>
                          {file.type.includes('video') ? '🎥' : '🖼️'} {file.name}
                          <button 
                            type="button"
                            className={styles.removeFile}
                            onClick={() => {
                              const newShowCase = formData.media.ShowCase.filter((_, i) => i !== index);
                              setFormData(prev => ({ 
                                ...prev, 
                                media: { ...prev.media, ShowCase: newShowCase } 
                              }));
                            }}
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
          )}

          {/* Navigation Buttons */}
          <div className={styles.actions}>
            {currentStep > 1 && (
              <button type="button" className={styles.secondaryBtn} onClick={prevStep}>
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                type="button" 
                className={styles.primaryBtn}
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className={styles.primaryBtn}
                disabled={loading || !validateStep(currentStep)}
              >
                {loading ? 'Adding Property...' : 'Add Property'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;