import { GET_LANDLORD_BY_USER_ID } from '../graphql/createProfile';
import { gql } from '@apollo/client';

// Configuration with video limits
const config = {
  strapiUrl: process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337',
  upload: {
    // Image limits
    maxImageSize: 10 * 1024 * 1024, // 10MB for images
    // Video limits - for 10-15 minute videos
    maxVideoSize: 100 * 1024 * 1024, // 100MB for videos (recommended for 720p 10-15min videos)
    maxVideoDuration: 900, // 15 minutes in seconds (15 * 60)
    // Combined allowed types
    allowedTypes: [
      'image/jpeg', 
      'image/png', 
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg'
    ],
    allowedImageTypes: [
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
    allowedVideoTypes: [
      'video/mp4',
      'video/webm',
      'video/ogg'
    ],
    // Recommended video settings for guidance
    recommendedVideoSettings: {
      format: 'MP4 (H.264)',
      resolution: '720p (1280×720)',
      bitrate: '1.5-2 Mbps',
      framerate: '24-30 fps',
      audio: 'AAC, 128 kbps',
      maxDuration: '15 minutes',
      maxSize: '100MB'
    }
  },
  cache: {
    ttl: 5 * 60 * 1000 // 5 minutes
  },
  retry: {
    maxRetries: 3,
    baseDelay: 1000
  }
};

// Custom error class
class AccommodationError extends Error {
  constructor(message, type = 'GENERAL') {
    super(message);
    this.type = type;
    this.name = 'AccommodationError';
  }
}

// Simple cache implementation
const cache = new Map();

const getCachedData = (key, ttl = config.cache.ttl) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const clearCache = (key = null) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('jwt') || '';
};

// GraphQL Queries and Mutations (unchanged)
export const CreateAccommodation = gql`
  mutation CreateAccommodation($data: AccommodationInput!) {
    createAccommodation(data: $data) {
      details {
        Bathrooms
        Bedrooms
        Category
        Facilities {
          SwimmingPool
          gas
          kitchen
          security
          solar
          wifi
        }
        Type
        distance
        isFull
        price
      }
      location {
        Address
        City
        latitude
        longitude
      }
      media {
        CoverImage {
          url
          alternativeText
        }
        Gallery {
          alternativeText
          url
        }
        ShowCase {
          alternativeText
          url
        }
        Rooms {
          alternativeText
          url
        }
      }
      name
      documentId
      landlord {
        documentId
        fullName
        landlordId
        phoneNumber
        profile {
          url
          alternativeText
        }
        users_permissions_user {
          email
        }
      }
    }
  }
`;

export const UpdateAccommodation = gql`
  mutation UpdateAccommodation($documentId: ID!, $data: AccommodationInput!) {
    updateAccommodation(documentId: $documentId, data: $data) {
      documentId
      name
      location {
        Address
        City
        latitude
        longitude
      }
      details {
        Bathrooms
        Bedrooms
        Category
        Facilities {
          SwimmingPool
          gas
          kitchen
          security
          solar
          wifi
        }
        Type
        distance
        isFull
        price
      }
      media {
        CoverImage {
          url
          alternativeText
        }
        Gallery {
          alternativeText
          url
        }
        ShowCase {
          alternativeText
          url
        }
        Rooms {
          alternativeText
          url
        }
      }
      landlord {
        documentId
        fullName
        landlordId
        profile {
          alternativeText
          url
        }
        phoneNumber
        users_permissions_user {
          email
        }
      }
    }
  }
`;

export const GetLandlordAccommodations = gql`
  query GetUserAccommodations($landlordId: ID!) {
    accommodations(
      filters: { 
        landlord: { 
          documentId: { eq: $landlordId } 
        } 
      }
      sort: ["createdAt:desc"]
    ) {
      documentId
      name
      location {
        Address
        City
        latitude
        longitude
      }
      details {
        Bathrooms
        Bedrooms
        Category
        Facilities {
          SwimmingPool
          gas
          kitchen
          security
          solar
          wifi
        }
        Type
        distance
        isFull
        price
      }
      media {
        CoverImage {
          url
          alternativeText
        }
        Gallery {
          alternativeText
          url
        }
        ShowCase {
          alternativeText
          url
        }
        Rooms {
          alternativeText
          url
        }
      }
      landlord {
        documentId
        fullName
        landlordId
        profile {
          alternativeText
          url
        }
        users_permissions_user {
          email
        }
      }
      likes
      createdAt
      inquiries {
        documentId
        students {
          documentId
          studentId
          firstName
          lastName
          phoneNumber
          profile {
            alternativeText
            url
          }
          users_permissions_user {
            documentId
            username
            email
          }
        }
        accommodation {
          documentId
          name
        }
        attributes {
          propertyId
          propertyName
          userName
          userEmail
          userPhone
          message
          preferredDate
          state
          landlordReply
          counterDate
          userId
          role
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const GetAllAccommodations = gql`
  query GetAllAccommodations {
    accommodations {
      documentId
      name
      location {
        Address
        City
        latitude
        longitude
      }
      details {
        Bathrooms
        Bedrooms
        Category
        Facilities {
          SwimmingPool
          gas
          kitchen
          security
          solar
          wifi
        }
        Type
        distance
        isFull
        price
      }
      media {
        CoverImage {
          url
          alternativeText
        }
        Gallery {
          alternativeText
          url
        }
        ShowCase {
          alternativeText
          url
        }
        Rooms {
          alternativeText
          url
        }
      }
      landlord {
        documentId
        fullName
        landlordId
        profile {
          alternativeText
          url
        }
        phoneNumber
        users_permissions_user {
          email
        }
      }
    }
  }
`;

export const DeleteAccommodation = gql`
  mutation DeleteAccommodation($documentId: ID!) {
    deleteAccommodation(documentId: $documentId) {
      documentId
    }
  }
`;

// Enhanced file validation with video support
const validateFile = (file) => {
  // Check if file type is allowed
  if (!config.upload.allowedTypes.includes(file.type)) {
    throw new AccommodationError(
      `Invalid file type: ${file.type}. Allowed: ${config.upload.allowedTypes.join(', ')}`,
      'FILE_VALIDATION'
    );
  }

  // Check if it's a video
  const isVideo = config.upload.allowedVideoTypes.includes(file.type);
  const isImage = config.upload.allowedImageTypes.includes(file.type);

  if (isVideo) {
    // Video validation
    if (file.size > config.upload.maxVideoSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      const maxSizeMB = (config.upload.maxVideoSize / 1024 / 1024).toFixed(0);
      throw new AccommodationError(
        `Video file too large: ${fileSizeMB}MB. Maximum: ${maxSizeMB}MB for videos. ` +
        `For 10-15 minute videos, use 720p resolution at 1.5-2 Mbps bitrate.`,
        'VIDEO_SIZE_LIMIT'
      );
    }
    
    // Log video upload info for guidance
    console.log('🎬 Video upload detected:', {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      type: file.type,
      recommendedSettings: config.upload.recommendedVideoSettings
    });
    
  } else if (isImage) {
    // Image validation (original limits)
    if (file.size > config.upload.maxImageSize) {
      throw new AccommodationError(
        `Image too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: ${config.upload.maxImageSize / 1024 / 1024}MB`,
        'IMAGE_SIZE_LIMIT'
      );
    }
  }

  return true;
};

// Get video duration (async function for potential future use)
const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Could not load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

// Validate video duration (optional - can be called separately)
const validateVideoDuration = async (file) => {
  try {
    const duration = await getVideoDuration(file);
    
    if (duration > config.upload.maxVideoDuration) {
      const durationMinutes = Math.ceil(duration / 60);
      const maxMinutes = config.upload.maxVideoDuration / 60;
      throw new AccommodationError(
        `Video too long: ${durationMinutes} minutes. Maximum: ${maxMinutes} minutes.`,
        'VIDEO_DURATION_LIMIT'
      );
    }
    
    return duration;
  } catch (error) {
    // If we can't read duration, just warn but don't block
    console.warn('⚠️ Could not validate video duration:', error.message);
    return null;
  }
};

// Get video upload guidelines for UI display
export const getVideoUploadGuidelines = () => {
  return {
    limits: {
      maxSize: config.upload.maxVideoSize,
      maxSizeMB: (config.upload.maxVideoSize / 1024 / 1024).toFixed(0),
      maxDuration: config.upload.maxVideoDuration,
      maxDurationMinutes: config.upload.maxVideoDuration / 60
    },
    recommended: config.upload.recommendedVideoSettings,
    allowedTypes: config.upload.allowedVideoTypes
  };
};

// Helper function to handle GraphQL API calls with retry logic
const graphqlRequest = async (query, variables = {}, retries = config.retry.maxRetries) => {
  const token = getAuthToken();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔐 GraphQL request attempt ${attempt}/${retries}`);
      console.log('📤 GraphQL variables:', variables);

      let queryString;
      if (typeof query === 'string') {
        queryString = query;
      } else {
        queryString = query.loc?.source?.body || String(query);
      }

      const response = await fetch(`${config.strapiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          query: queryString,
          variables,
        }),
      });

      const result = await response.json();
      console.log(`📡 GraphQL response status: ${response.status}`);

      if (result.errors) {
        console.error('❌ GraphQL errors details:', JSON.stringify(result.errors, null, 2));
        
        // Don't retry on authentication errors
        if (result.errors.some(error => error.extensions?.code === 'UNAUTHENTICATED')) {
          throw new AccommodationError('Authentication required', 'AUTHENTICATION');
        }
        
        throw new AccommodationError(`GraphQL error: ${result.errors[0]?.message}`, 'GRAPHQL');
      }

      if (!response.ok) {
        throw new AccommodationError(`HTTP error! status: ${response.status}`, 'HTTP');
      }

      return result.data;
    } catch (error) {
      console.error(`💥 GraphQL request failed (attempt ${attempt}/${retries}):`, error);
      
      if (attempt === retries) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.min(config.retry.baseDelay * Math.pow(2, attempt - 1), 10000);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Upload file to Strapi with enhanced video handling
const uploadFile = async (file) => {
  validateFile(file);
  
  // For videos, optionally validate duration
  if (config.upload.allowedVideoTypes.includes(file.type)) {
    try {
      await validateVideoDuration(file);
    } catch (error) {
      // Log but don't block if duration validation fails
      console.warn('Video duration validation warning:', error.message);
    }
  }
  
  const formData = new FormData();
  formData.append('files', file);

  const token = getAuthToken();

  try {
    console.log('📤 Uploading file:', file.name);
    const response = await fetch(`${config.strapiUrl}/api/upload`, {
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AccommodationError(`File upload failed: ${response.status} - ${errorText}`, 'UPLOAD');
    }

    const data = await response.json();
    console.log('✅ File uploaded successfully:', data);
    
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
};

// Upload multiple files - with video support
const uploadFiles = async (files) => {
  // Filter only File instances and validate them
  const filesToUpload = files.filter(file => file instanceof File);
  
  if (filesToUpload.length === 0) {
    console.log('⚠️ No valid files to upload');
    return [];
  }
  
  // Validate each file
  filesToUpload.forEach(file => validateFile(file));
  
  const formData = new FormData();
  filesToUpload.forEach(file => {
    formData.append('files', file);
  });

  const token = getAuthToken();

  try {
    console.log('📤 Uploading multiple files:', filesToUpload.length);
    const response = await fetch(`${config.strapiUrl}/api/upload`, {
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AccommodationError(`Files upload failed: ${response.status} - ${errorText}`, 'UPLOAD');
    }

    const data = await response.json();
    console.log('✅ Files uploaded successfully:', data.length);
    return data;
  } catch (error) {
    console.error('❌ Error uploading files:', error);
    throw error;
  }
};

// transformStrapiResponse (unchanged from your original)
const transformStrapiResponse = (strapiData) => {
  try {
    if (!strapiData) {
      console.warn('⚠️ transformStrapiResponse: No data provided');
      return null;
    }

    console.log('🔄 Transforming Strapi data:', strapiData);

    // Handle both direct attributes and nested data structure
    const attributes = strapiData.attributes || strapiData;
    const documentId = strapiData.documentId || strapiData.id;

    const media = attributes.media || {};
    const location = attributes.location || {};
    const details = attributes.details || {};
    const facilities = details.Facilities || {};
    
    // 🔥 FIX: Proper landlord data extraction
    let landlordData = attributes.landlord;
    let landlordAttributes = {};
    let landlordProfile = {};

    console.log('🔍 Raw landlord data:', landlordData);

    // Handle different landlord data structures
    if (landlordData) {
      // Handle Strapi 5 nested structure: landlord.data.attributes
      if (landlordData.data) {
        landlordAttributes = landlordData.data.attributes || {};
        landlordProfile = landlordAttributes.profile?.data?.attributes || {};
      } 
      // Handle direct attributes structure
      else if (landlordData.attributes) {
        landlordAttributes = landlordData.attributes;
        landlordProfile = landlordAttributes.profile?.data?.attributes || {};
      }
      // Handle direct object (fallback)
      else {
        landlordAttributes = landlordData;
        landlordProfile = landlordAttributes.profile || {};
      }
    }

    // Get landlord ID - handle different ID fields
    const landlordId = landlordData?.documentId || 
                      landlordData?.id || 
                      landlordAttributes?.documentId || 
                      landlordAttributes?.id;

    console.log('👤 Extracted landlord ID:', landlordId);
    console.log('👤 Landlord attributes:', landlordAttributes);

    // Handle profile with null safety
    const hasProfile = landlordProfile && (landlordProfile.url || landlordProfile.data?.url);
    
    // Fix media URL construction
    const constructMediaUrl = (mediaItem) => {
      if (!mediaItem?.url) return '/default-property.jpg';
      return mediaItem.url.startsWith('http') 
        ? mediaItem.url 
        : `${config.strapiUrl}${mediaItem.url}`;
    };

    // Helper to extract media array from Strapi 5 structure
    const extractMediaArray = (mediaField) => {
      if (!mediaField) return [];
      
      // Handle Strapi 5 nested structure
      if (mediaField.data) {
        return mediaField.data.map(item => ({
          url: constructMediaUrl(item.attributes),
          alternativeText: item.attributes?.alternativeText || 'Image'
        }));
      }
      
      // Handle direct array (fallback)
      if (Array.isArray(mediaField)) {
        return mediaField.map(item => ({
          url: constructMediaUrl(item),
          alternativeText: item.alternativeText || 'Image'
        }));
      }
      
      return [];
    };

    // Helper to extract single media item
    const extractSingleMedia = (mediaField) => {
      if (!mediaField) {
        return { url: '/default-property.jpg', alternativeText: 'Default property image' };
      }
      
      // Handle Strapi 5 nested structure
      if (mediaField.data?.attributes) {
        return {
          url: constructMediaUrl(mediaField.data.attributes),
          alternativeText: mediaField.data.attributes.alternativeText || 'Property image'
        };
      }
      
      // Handle direct object (fallback)
      if (mediaField.url) {
        return {
          url: constructMediaUrl(mediaField),
          alternativeText: mediaField.alternativeText || 'Property image'
        };
      }
      
      return { url: '/default-property.jpg', alternativeText: 'Default property image' };
    };

    const transformedData = {
      id: documentId,
      name: attributes.name || 'Property Name',
      location: {
        Address: location.Address || '',
        City: location.City || '',
        latitude: location.latitude?.toString() || '',
        longitude: location.longitude?.toString() || ''
      },
      media: {
        CoverImage: extractSingleMedia(media.CoverImage),
        Gallery: extractMediaArray(media.Gallery),
        Rooms: extractMediaArray(media.Rooms),
        ShowCase: extractMediaArray(media.ShowCase)
      },
      details: {
        Bathrooms: parseInt(details.Bathrooms) || 0,
        Bedrooms: parseInt(details.Bedrooms) || 0,
        price: parseFloat(details.price) || 0,
        Category: details.Category || 'Boarding',
        Type: details.Type || 'Mixed',
        distance: details.distance || 0,
        isFull: Boolean(details.isFull),
        Facilities: {
          kitchen: Boolean(facilities.kitchen),
          SwimmingPool: Boolean(facilities.SwimmingPool),
          gas: Boolean(facilities.gas),
          security: Boolean(facilities.security),
          solar: Boolean(facilities.solar),
          wifi: Boolean(facilities.wifi)
        }
      },
      landlord: {
        id: landlordId,
        fullName: landlordAttributes.fullName || 'Landlord',
        landlordId: landlordAttributes.landlordId || '',
        phoneNumber: landlordAttributes.phoneNumber || '',
        hasProfile: !!hasProfile,
        profile: {
          url: hasProfile 
            ? constructMediaUrl(landlordProfile)
            : '/default-avatar.jpg',
          alternativeText: landlordProfile?.alternativeText || 'Default profile picture'
        },
        email: landlordAttributes.users_permissions_user?.data?.attributes?.email || ''
      },
      likes: parseInt(attributes.likes) || 0,
      status: attributes.status || 'active',
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt
    };

    console.log('✅ Transformed data - Landlord ID:', transformedData.landlord.id);
    
    return transformedData;
    
  } catch (error) {
    console.error('❌ Error transforming Strapi response:', error);
    console.error('📦 Problematic data:', strapiData);
    
    // Return null instead of fallback to avoid showing invalid data
    return null;
  }
};

// accommodationService.js - ADD DEBUG LOGGING
const getAccommodationsByLandlordId = async (landlordId, useCache = true) => {
  const cacheKey = `landlord_${landlordId}_accommodations`;
  
  console.log('🔍 DEBUG: Getting accommodations for landlord:', landlordId);
  console.log('🔍 DEBUG: Current cache key:', cacheKey);

  if (useCache) {
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log('📦 Returning cached landlord accommodations for:', landlordId);
      return cached;
    }
  }

  try {
    const result = await graphqlRequest(GetLandlordAccommodations, { 
      landlordId: landlordId 
    });
    
    console.log('📦 DEBUG: Raw GraphQL result:', result);
    
    // FIX: Handle different response structures
    let accommodationsData = result.accommodations;
    
    if (accommodationsData?.data) {
      accommodationsData = accommodationsData.data; // Strapi 5 nested data
    }
    
    const accommodations = (accommodationsData || []).map(acc => transformStrapiResponse(acc));
    console.log('✅ DEBUG: Found accommodations for landlord', landlordId, ':', accommodations.length);
    console.log('✅ DEBUG: Accommodation IDs:', accommodations.map(acc => ({ id: acc.id, name: acc.name })));
    
    setCachedData(cacheKey, accommodations);
    return accommodations;
  } catch (error) {
    console.error('❌ Error getting landlord accommodations:', error);
    throw error;
  }
};

// Get all accommodations - FIXED response handling
const getAllAccommodations = async (useCache = true) => {
  const cacheKey = 'all_accommodations';
  
  if (useCache) {
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log('📦 Returning cached accommodations');
      return cached;
    }
  }

  try {
    console.log('🔍 Getting all accommodations');
    
    const result = await graphqlRequest(GetAllAccommodations);
    
    console.log('📦 All accommodations result:', result);
    
    // FIX: Handle different response structures
    let accommodationsData = result.accommodations;
    
    if (accommodationsData?.data) {
      accommodationsData = accommodationsData.data; // Strapi 5 nested data
    }
    
    const accommodations = (accommodationsData || []).map(acc => transformStrapiResponse(acc));
    console.log('✅ Found all accommodations:', accommodations.length);
    
    setCachedData(cacheKey, accommodations);
    return accommodations;
  } catch (error) {
    console.error('❌ Error getting all accommodations:', error);
    throw error;
  }
};

// Get landlord ID with proper user object handling
export const getLandlordId = async (user) => {
  console.log("🔍 Getting landlord ID for user:", user);

  if (!user?.documentId) {
    console.warn("⚠️ Landlord profile issue: Unable to fetch user documentId");
    throw new Error("Unable to fetch user documentId");
  }

  try {
    const response = await graphqlRequest(GET_LANDLORD_BY_USER_ID, {
      userDocumentId: user.documentId, // This should be ID type
    });

    console.log("📦 Landlord query response:", response);

    // FIX: Handle Strapi 4/5 response structure properly
    const landlords = response?.landlords || response?.landlords?.data;
    
    if (Array.isArray(landlords)) {
      const landlord = landlords[0];
      if (landlord) {
        // Handle both direct object and nested data structure
        const landlordData = landlord.attributes || landlord;
        console.log("✅ Found landlord profile:", landlordData);
        return landlordData.documentId || landlordData.id;
      }
    }
    
    throw new Error("Landlord not found for this user");
  } catch (error) {
    console.error("❌ Error fetching landlord:", error);
    throw error;
  }
};

// 🔥 FIXED: getUserAccommodations with role check
export const getUserAccommodations = async (user) => {
  if (!user || !user.documentId) {
    throw new Error("User documentId missing");
  }

  // 🔥 CRITICAL FIX: Check user role before proceeding
  const userRole = user?.role?.name || user?.role;
  if (userRole !== 'landlord') {
    console.log('👤 User is not a landlord, returning empty accommodations array');
    return [];
  }

  try {
    // Get landlord ID first
    const landlordId = await getLandlordId(user);
    console.log("🏠 Found landlord ID:", landlordId);

    if (!landlordId) {
      console.warn("⚠️ No landlord profile found for user");
      return [];
    }

    // Use the existing function that already handles the GraphQL query
    const accommodations = await getAccommodationsByLandlordId(landlordId, false); // Don't use cache for fresh data
    
    console.log("✅ User accommodations loaded:", accommodations?.length || 0);
    return accommodations || [];

  } catch (error) {
    console.error("❌ Error fetching user accommodations:", error);
    
    // Don't throw, return empty array to prevent UI breaks
    if (error.message.includes('Landlord not found')) {
      console.log("👤 User is not registered as a landlord");
      return [];
    }
    
    throw error; // Re-throw other errors
  }
};

// Batch delete accommodations
const batchDeleteAccommodations = async (documentIds, user) => {
  try {
    const landlordId = await getLandlordId(user);
    
    const results = await Promise.allSettled(
      documentIds.map(id => 
        accommodationService.deleteAccommodation(id, user)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    // Clear cache after batch operations
    clearCache();
    
    return { successful, failed, results };
  } catch (error) {
    console.error('❌ Error in batch delete:', error);
    throw error;
  }
};

// Main service functions
export const accommodationService = {
  // Create accommodation with landlord relationship
  async getStudentIdByUser(userDocumentId) {
    try {
      const GET_STUDENT_BY_USER = gql`
        query GetStudentByUser($userDocumentId: ID!) {
          students(filters: { users_permissions_user: { documentId: { eq: $userDocumentId } } }) {
            documentId
            studentId
            firstName
            lastName
            phoneNumber
            profile {
              url
              alternativeText
            }
            users_permissions_user {
              documentId
              username
              email
            }
          }
        }
      `;

      const result = await accommodationService.graphqlRequest(GET_STUDENT_BY_USER, {
        userDocumentId: userDocumentId  // This will work because documentId is already an ID
      });

      const student = result.students?.[0];
      
      if (student) {
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
        
        return {
          ...student,
          fullName: fullName || 'Student'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting student by user:', error);
      return null;
    }
  },

  async createAccommodation(accommodationData, user) {
    let coverImageId = null;
    let galleryIds = [];
    let roomIds = [];
    let showcaseId = null; // For video showcase

    try {
      console.log('=== ACCOMMODATION CREATION START ===');
      console.log('Raw accommodation data:', accommodationData);

      // Get landlord ID for current user
      const landlordId = await getLandlordId(user);
      if (!landlordId) {
        return { 
          success: false, 
          error: 'User is not registered as a landlord',
          type: 'AUTHENTICATION'
        };
      }

      // Upload cover image and get ID
      if (accommodationData.media?.CoverImage && accommodationData.media.CoverImage instanceof File) {
        console.log('Uploading cover image...');
        const uploadedCoverImage = await uploadFile(accommodationData.media.CoverImage);
        coverImageId = uploadedCoverImage.id;
        console.log('Cover image uploaded, ID:', coverImageId);
      }

      // Upload gallery images
      if (accommodationData.media?.Gallery && accommodationData.media.Gallery.length > 0) {
        const galleryFiles = accommodationData.media.Gallery.filter(file => file instanceof File);
        if (galleryFiles.length > 0) {
          console.log('Uploading gallery images...');
          const uploadedGallery = await uploadFiles(galleryFiles);
          galleryIds = uploadedGallery.map(file => file.id);
          console.log('Gallery images uploaded, IDs:', galleryIds);
        }
      }

      // Upload room images
      if (accommodationData.media?.Rooms && accommodationData.media.Rooms.length > 0) {
        const roomFiles = accommodationData.media.Rooms.filter(file => file instanceof File);
        if (roomFiles.length > 0) {
          console.log('Uploading room images...');
          const uploadedRooms = await uploadFiles(roomFiles);
          roomIds = uploadedRooms.map(file => file.id);
          console.log('Room images uploaded, IDs:', roomIds);
        }
      }

      // Upload showcase video (if provided)
      if (accommodationData.media?.ShowCase && accommodationData.media.ShowCase instanceof File) {
        console.log('🎬 Uploading showcase video...');
        console.log('Video info:', {
          name: accommodationData.media.ShowCase.name,
          size: (accommodationData.media.ShowCase.size / 1024 / 1024).toFixed(2) + 'MB',
          type: accommodationData.media.ShowCase.type
        });
        
        try {
          const uploadedShowcase = await uploadFile(accommodationData.media.ShowCase);
          showcaseId = uploadedShowcase.id;
          console.log('✅ Showcase video uploaded, ID:', showcaseId);
        } catch (videoError) {
          console.error('❌ Video upload failed:', videoError);
          // Don't fail the entire accommodation creation if video fails
          // Just log the error and continue
        }
      }

      // Build media object with direct ID assignments
      const mediaData = {};

      if (coverImageId) {
        mediaData.CoverImage = coverImageId;
      }

      if (galleryIds.length > 0) {
        mediaData.Gallery = galleryIds;
      }

      if (roomIds.length > 0) {
        mediaData.Rooms = roomIds;
      }

      if (showcaseId) {
        mediaData.ShowCase = showcaseId;
      }

      // Prepare the main data
      const data = {
        name: accommodationData.name || 'Property Name',
        location: {
          Address: accommodationData.location?.Address || '123 Main St',
          City: accommodationData.location?.City || 'Chinhoyi',
          latitude: parseFloat(accommodationData.location?.latitude) || 17,
          longitude: parseFloat(accommodationData.location?.longitude) || 30
        },
        details: {
          Bathrooms: parseInt(accommodationData.details?.Bathrooms) || 2,
          Bedrooms: parseInt(accommodationData.details?.Bedrooms) || 2,
          price: parseFloat(accommodationData.details?.price) || 120,
          Category: accommodationData.details?.Category || 'Boarding',
          Type: accommodationData.details?.Type || 'Mixed',
          distance: accommodationData.details?.distance !== undefined ? parseInt(accommodationData.details.distance) : null,
          isFull: accommodationData.details?.isFull !== undefined ? accommodationData.details.isFull : null,
          Facilities: {
            kitchen: accommodationData.details?.Facilities?.kitchen || true,
            SwimmingPool: accommodationData.details?.Facilities?.SwimmingPool || true,
            gas: accommodationData.details?.Facilities?.gas || true,
            security: accommodationData.details?.Facilities?.security || true,
            solar: accommodationData.details?.Facilities?.solar || true,
            wifi: accommodationData.details?.Facilities?.wifi || true
          }
        },
        landlord: landlordId
      };

      // Only add media if we have media data
      if (Object.keys(mediaData).length > 0) {
        data.media = mediaData;
      }

      console.log('Final GraphQL mutation data:', JSON.stringify(data, null, 2));

      const result = await graphqlRequest(CreateAccommodation, { data });
      console.log('✅ Accommodation created successfully:', result);
      
      if (!result || !result.createAccommodation) {
        return {
          success: false,
          error: 'Invalid response from server - accommodation not created',
          type: 'SERVER_ERROR'
        };
      }
      
      // Clear cache after creation
      clearCache();
      
      const transformedAccommodation = transformStrapiResponse(result.createAccommodation);
      
      return {
        success: true,
        data: transformedAccommodation,
        message: 'Property created successfully!'
      };

    } catch (error) {
      console.error('=== ACCOMMODATION CREATION FAILED ===');
      console.error('Error details:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to create property',
        type: error.type || 'UNKNOWN_ERROR'
      };
    }
  },

  // Get user accommodations
  getUserAccommodations,

  // Update accommodation function - with video support
  async updateAccommodation(documentId, accommodationData, user) {
    try {
      console.log('Starting accommodation update for documentId:', documentId);

      // Verify ownership
      const landlordId = await getLandlordId(user);
      if (!landlordId) {
        throw new AccommodationError('User is not registered as a landlord', 'AUTHENTICATION');
      }

      // Prepare media updates with direct IDs
      const mediaUpdates = {};

      // Upload new cover image if provided AND it's a File
      if (accommodationData.media?.CoverImage && accommodationData.media.CoverImage instanceof File) {
        console.log('Uploading new cover image...');
        const uploadedCoverImage = await uploadFile(accommodationData.media.CoverImage);
        mediaUpdates.CoverImage = uploadedCoverImage.id;
      }

      // Upload new gallery images
      if (accommodationData.media?.Gallery && accommodationData.media.Gallery.length > 0) {
        const galleryFiles = accommodationData.media.Gallery.filter(item => item instanceof File);
        if (galleryFiles.length > 0) {
          console.log('Uploading new gallery images...');
          const uploadedGallery = await uploadFiles(galleryFiles);
          mediaUpdates.Gallery = uploadedGallery.map(file => file.id);
        }
      }

      // Upload new room images
      if (accommodationData.media?.Rooms && accommodationData.media.Rooms.length > 0) {
        const roomFiles = accommodationData.media.Rooms.filter(item => item instanceof File);
        if (roomFiles.length > 0) {
          console.log('Uploading new room images...');
          const uploadedRooms = await uploadFiles(roomFiles);
          mediaUpdates.Rooms = uploadedRooms.map(file => file.id);
        }
      }

      // Upload new showcase video
      if (accommodationData.media?.ShowCase && accommodationData.media.ShowCase instanceof File) {
        console.log('🎬 Uploading new showcase video...');
        console.log('Video info:', {
          name: accommodationData.media.ShowCase.name,
          size: (accommodationData.media.ShowCase.size / 1024 / 1024).toFixed(2) + 'MB',
          type: accommodationData.media.ShowCase.type
        });
        
        const uploadedShowcase = await uploadFile(accommodationData.media.ShowCase);
        mediaUpdates.ShowCase = uploadedShowcase.id;
        console.log('✅ Showcase video uploaded, ID:', uploadedShowcase.id);
      }

      // Prepare the input data with null safety
      const data = {
        name: accommodationData.name,
        location: {
          Address: accommodationData.location?.Address || '',
          City: accommodationData.location?.City || '',
          latitude: parseFloat(accommodationData.location?.latitude) || 0,
          longitude: parseFloat(accommodationData.location?.longitude) || 0
        },
        details: {
          Bathrooms: parseInt(accommodationData.details?.Bathrooms) || 0,
          Bedrooms: parseInt(accommodationData.details?.Bedrooms) || 0,
          price: parseFloat(accommodationData.details?.price) || 0,
          Category: accommodationData.details?.Category || 'Boarding',
          Type: accommodationData.details?.Type || 'Mixed',
          distance: accommodationData.details?.distance !== undefined ? parseInt(accommodationData.details.distance) : null,
          isFull: accommodationData.details?.isFull !== undefined ? accommodationData.details.isFull : null,
          Facilities: {
            kitchen: accommodationData.details?.Facilities?.kitchen || false,
            SwimmingPool: accommodationData.details?.Facilities?.SwimmingPool || false,
            gas: accommodationData.details?.Facilities?.gas || false,
            security: accommodationData.details?.Facilities?.security || false,
            solar: accommodationData.details?.Facilities?.solar || false,
            wifi: accommodationData.details?.Facilities?.wifi || false
          }
        }
      };

      // Add media updates if any
      if (Object.keys(mediaUpdates).length > 0) {
        data.media = mediaUpdates;
      }

      console.log('Sending GraphQL update mutation with data:', data);

      const result = await graphqlRequest(UpdateAccommodation, { 
        documentId: documentId,
        data 
      });
      console.log('✅ Accommodation updated successfully:', result);
      
      // Clear cache after update
      clearCache();
      
      return transformStrapiResponse(result.updateAccommodation);

    } catch (error) {
      console.error('❌ Error updating accommodation:', error);
      throw error;
    }
  },

  // Delete accommodation
  async deleteAccommodation(documentId, user) {
    try {
      console.log('Deleting accommodation with documentId:', documentId);
      
      // Verify ownership
      const landlordId = await getLandlordId(user);
      if (!landlordId) {
        throw new AccommodationError('User is not registered as a landlord', 'AUTHENTICATION');
      }
      
      const result = await graphqlRequest(DeleteAccommodation, { documentId: documentId });
      
      console.log('✅ Accommodation deleted successfully:', result);
      
      // Clear cache after deletion
      clearCache();
      
      return result;
    } catch (error) {
      console.error('❌ Error deleting accommodation:', error);
      throw error;
    }
  },

  // Batch operations
  batchDeleteAccommodations,

  // Helper functions
  getAccommodationsByLandlordId,
  getAllAccommodations,
  getLandlordId,

  // Upload functions
  uploadFile,
  uploadFiles,
  graphqlRequest,
  
  // Validation functions
  validateFile,
  validateVideoDuration,
  getVideoDuration,
  getVideoUploadGuidelines,
  
  // Cache management
  clearCache,
  getCachedData,
  setCachedData,

  // Configuration
  config
};

export { uploadFile, uploadFiles, graphqlRequest, clearCache, AccommodationError };
export default accommodationService;