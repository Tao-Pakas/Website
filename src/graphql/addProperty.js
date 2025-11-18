const API_URL = 'http://localhost:1337/graphql';

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('jwt') || '';
};

// GraphQL query to get landlord ID by user ID
const GET_LANDLORD_BY_USER_ID = gql`
  query GetLandlordByUserId($userDocumentId: ID!) {
    landlords(filters: { users_permissions_user: { documentId: { eq: $userDocumentId } } }) {
      data {
        id
        attributes {
          documentId
          fullName
          landlordId
          phoneNumber
          profile {
            data {
              attributes {
                url
                alternativeText
              }
            }
          }
          users_permissions_user {
            data {
              attributes {
                email
              }
            }
          }
        }
      }
    }
  }
`;

// Get landlord ID for current user
const getLandlordId = async (user) => {
  try {
    console.log("🔍 Getting landlord ID for user:", user);

    if (!user?.documentId) {
      throw new Error("Unable to fetch user documentId");
    }

    const response = await graphqlRequest(GET_LANDLORD_BY_USER_ID, {
      userDocumentId: user.documentId,
    });

    console.log("📦 Landlord query response:", response);

    const landlords = response?.landlords?.data;
    
    if (Array.isArray(landlords) && landlords.length > 0) {
      const landlord = landlords[0];
      const landlordId = landlord.id;
      console.log("✅ Found landlord profile ID:", landlordId);
      return landlordId;
    }
    
    throw new Error("Landlord not found for this user");
  } catch (error) {
    console.error("❌ Error fetching landlord:", error);
    throw error;
  }
};

// GraphQL mutation for creating accommodation - Strapi v5
const CREATE_ACCOMMODATION_MUTATION = `
  mutation($data: AccommodationInput!){
  createAccommodation(data: $data) {
    data {
      id
      attributes {
        name
        documentId
        likes
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
            data {
              attributes {
                url
                alternativeText
              }
            }
          }
          Gallery {
            data {
              attributes {
                url
                alternativeText
              }
            }
          }
          ShowCase {
            data {
              attributes {
                url
                alternativeText
              }
            }
          }
          Rooms {
            data {
              attributes {
                url
                alternativeText
              }
            }
          }
        }
        # 🔥 ADD: Include landlord in the response
        landlord {
          data {
            id
            attributes {
              documentId
              fullName
              landlordId
              phoneNumber
              profile {
                data {
                  attributes {
                    url
                    alternativeText
                  }
                }
              }
              users_permissions_user {
                data {
                  attributes {
                    email
                  }
                }
              }
            }
          }
        }
        user {
          data {
            id
            attributes {
              username
              email
            }
          }
        }
        status
        createdAt
        updatedAt
      }
    }
  }
}
`;

// GraphQL mutation for updating accommodation - Strapi v5
const UPDATE_ACCOMMODATION_MUTATION = `
  mutation UpdateAccommodation($id: ID!, $data: AccommodationInput!) {
    updateAccommodation(id: $id, data: $data) {
      data {
        id
        attributes {
          name
          location {
            Address
            City
            longitude
            latitude
          }
          details {
            Bedrooms
            Bathrooms
            isFull
            Category
            Type
            Facilities {
              wifi
              solar
              gas
              security
              kitchen
              SwimmingPool
            }
            price
            distance
          }
          media {
            CoverImage {
              data {
                attributes {
                  url
                  alternativeText
                }
              }
            }
            Gallery {
              data {
                attributes {
                  url
                  alternativeText
                }
              }
            }
            Rooms {
              data {
                attributes {
                  url
                  alternativeText
                }
              }
            }
            ShowCase {
              data {
                attributes {
                  url
                  alternativeText
                }
              }
            }
          }
          # 🔥 ADD: Include landlord in update response
          landlord {
            data {
              id
              attributes {
                fullName
                landlordId
                phoneNumber
              }
            }
          }
          status
          updatedAt
        }
      }
    }
  }
`;

// GraphQL query for getting user's accommodations - Strapi v5
const GET_USER_ACCOMMODATIONS_QUERY = `
  query GetUserAccommodations {
    accommodations {
      data {
        id
        attributes {
          name
          location {
            Address
            City
            longitude
            latitude
          }
          details {
            Bedrooms
            Bathrooms
            isFull
            Category
            Type
            Facilities {
              wifi
              solar
              gas
              security
              kitchen
              SwimmingPool
            }
            price
            distance
          }
          media {
            CoverImage {
              data {
                attributes {
                  url
                  alternativeText
                }
              }
            }
            Gallery {
              data {
                attributes {
                  url
                  alternativeText
                }
              }
            }
            Rooms {
              data {
                attributes {
                  url
                  alternativeText
                }
              }
            }
            ShowCase {
              data {
                attributes {
                  url
                  alternativeText
                }
              }
            }
          }
          # 🔥 ADD: Include landlord in query
          landlord {
            data {
              id
              attributes {
                documentId
                fullName
                landlordId
                phoneNumber
                profile {
                  data {
                    attributes {
                      url
                      alternativeText
                    }
                  }
                }
                users_permissions_user {
                  data {
                    attributes {
                      email
                    }
                  }
                }
              }
            }
          }
          user {
            data {
              id
              attributes {
                username
                email
              }
            }
          }
          status
          createdAt
          updatedAt
          publishedAt
        }
      }
    }
  }
`;

// Helper function for GraphQL requests with authentication
const graphqlRequest = async (query, variables = {}) => {
  const token = getAuthToken();
  
  try {
    console.log('Sending GraphQL request:', { query, variables });
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    console.log('Full GraphQL response:', result);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(result)}`);
    }

    if (result.errors) {
      const errorMessages = result.errors.map(error => error.message).join(', ');
      throw new Error(`GraphQL errors: ${errorMessages}`);
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw error;
  }
};

// Upload file to Strapi with authentication
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('files', file);

  const token = getAuthToken();

  try {
    console.log('Uploading file:', file.name);
    const response = await fetch('http://localhost:1337/api/upload', {
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      throw new Error(`File upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('File uploaded successfully:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Upload multiple files with authentication
export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const token = getAuthToken();

  try {
    console.log('Uploading multiple files:', files.length);
    const response = await fetch('http://localhost:1337/api/upload', {
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      throw new Error(`Files upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Files uploaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

// Helper function to convert coordinates to BigInt format
const convertCoordinate = (coord) => {
  if (!coord) return 0;
  // Multiply by 1,000,000 to preserve 6 decimal places and convert to integer
  return Math.round(parseFloat(coord) * 1000000);
};

// Helper function to ensure enum values are uppercase
const formatEnumValue = (value) => {
  if (!value) return '';
  return value.toUpperCase().replace(/ /g, '_');
};

// Create accommodation in Strapi with actual file uploads - Strapi v5
export const createAccommodation = async (accommodationData, user) => {
  try {
    console.log('🚀 Starting accommodation creation for user:', user);
    console.log('📝 Accommodation data:', accommodationData);

    // 🔥 STEP 1: Get landlord ID for current user
    const landlordId = await getLandlordId(user);
    if (!landlordId) {
      throw new Error('User is not registered as a landlord');
    }

    console.log('✅ Found landlord ID:', landlordId);

    // Upload cover image and get ID
    let coverImageId = null;
    if (accommodationData.media?.CoverImage && accommodationData.media.CoverImage instanceof File) {
      console.log('📤 Uploading cover image...');
      const uploadedCoverImage = await uploadFile(accommodationData.media.CoverImage);
      coverImageId = uploadedCoverImage.id;
      console.log('✅ Cover image uploaded, ID:', coverImageId);
    }

    // Upload gallery images and get IDs
    let galleryIds = [];
    if (accommodationData.media?.Gallery && accommodationData.media.Gallery.length > 0) {
      const galleryFiles = accommodationData.media.Gallery.filter(file => file instanceof File);
      if (galleryFiles.length > 0) {
        console.log('📤 Uploading gallery images...');
        const uploadedGallery = await uploadFiles(galleryFiles);
        galleryIds = uploadedGallery.map(file => file.id);
        console.log('✅ Gallery images uploaded, IDs:', galleryIds);
      }
    }

    // Upload room images and get IDs
    let roomIds = [];
    if (accommodationData.media?.Rooms && accommodationData.media.Rooms.length > 0) {
      const roomFiles = accommodationData.media.Rooms.filter(file => file instanceof File);
      if (roomFiles.length > 0) {
        console.log('📤 Uploading room images...');
        const uploadedRooms = await uploadFiles(roomFiles);
        roomIds = uploadedRooms.map(file => file.id);
        console.log('✅ Room images uploaded, IDs:', roomIds);
      }
    }

    // Upload showcase media and get IDs
    let showcaseIds = [];
    if (accommodationData.media?.ShowCase && accommodationData.media.ShowCase.length > 0) {
      const showcaseFiles = accommodationData.media.ShowCase.filter(file => file instanceof File);
      if (showcaseFiles.length > 0) {
        console.log('📤 Uploading showcase media...');
        const uploadedShowcase = await uploadFiles(showcaseFiles);
        showcaseIds = uploadedShowcase.map(file => file.id);
        console.log('✅ Showcase media uploaded, IDs:', showcaseIds);
      }
    }

    // 🔥 STEP 2: Prepare the input with BOTH user and landlord connections
    const data = {
      name: accommodationData.name || 'Property Name',
      user: user.id, // Connect to user
      landlord: landlordId, // 🔥 CRITICAL: Connect to landlord profile
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
      status: 'active',
      publishedAt: new Date().toISOString()
    };

    // Only add media if we have media data
    if (coverImageId || galleryIds.length > 0 || roomIds.length > 0 || showcaseIds.length > 0) {
      data.media = {};
      
      if (coverImageId) data.media.CoverImage = coverImageId;
      if (galleryIds.length > 0) data.media.Gallery = galleryIds;
      if (roomIds.length > 0) data.media.Rooms = roomIds;
      if (showcaseIds.length > 0) data.media.ShowCase = showcaseIds;
    }

    console.log('📤 Final GraphQL mutation data:', JSON.stringify(data, null, 2));

    // Execute GraphQL mutation
    const result = await graphqlRequest(CREATE_ACCOMMODATION_MUTATION, { data });
    console.log('✅ Accommodation created successfully with landlord connection:', result);

    if (!result?.createAccommodation?.data) {
      throw new Error('Failed to create accommodation - no data returned');
    }
    
    const transformedAccommodation = transformStrapiResponse(result.createAccommodation.data);
    console.log('🎉 Transformed accommodation with landlord:', transformedAccommodation);
    
    return transformedAccommodation;

  } catch (error) {
    console.error('❌ Error creating accommodation:', error);
    throw error;
  }
};

// Update accommodation in Strapi - Strapi v5
export const updateAccommodation = async (documentId, accommodationData, user) => {
  try {
    console.log('Starting accommodation update for documentId:', documentId, accommodationData);

    // Upload new cover image if provided and get ID
    let coverImageId = null;
    if (accommodationData.media.CoverImage && accommodationData.media.CoverImage instanceof File) {
      console.log('Uploading new cover image...');
      const uploadedCoverImage = await uploadFile(accommodationData.media.CoverImage);
      coverImageId = uploadedCoverImage.id;
    }

    // Upload new gallery images if provided and get IDs
    let galleryIds = [];
    if (accommodationData.media.Gallery && accommodationData.media.Gallery.length > 0 && accommodationData.media.Gallery[0] instanceof File) {
      console.log('Uploading new gallery images...');
      const uploadedGallery = await uploadFiles(accommodationData.media.Gallery);
      galleryIds = uploadedGallery.map(file => file.id);
    }

    // Upload new room images if provided and get IDs
    let roomIds = [];
    if (accommodationData.media.Rooms && accommodationData.media.Rooms.length > 0 && accommodationData.media.Rooms[0] instanceof File) {
      console.log('Uploading new room images...');
      const uploadedRooms = await uploadFiles(accommodationData.media.Rooms);
      roomIds = uploadedRooms.map(file => file.id);
    }

    // Upload new showcase media if provided and get IDs
    let showcaseIds = [];
    if (accommodationData.media.ShowCase && accommodationData.media.ShowCase.length > 0 && accommodationData.media.ShowCase[0] instanceof File) {
      console.log('Uploading new showcase media...');
      const uploadedShowcase = await uploadFiles(accommodationData.media.ShowCase);
      showcaseIds = uploadedShowcase.map(file => file.id);
    }

    // Prepare the input for GraphQL mutation
    const data = {
      name: accommodationData.name,
      user: user.id,
      // Keep existing landlord connection (don't change it on update)
      location: {
        Address: accommodationData.location.Address,
        City: accommodationData.location.City,
        longitude: convertCoordinate(accommodationData.location.longitude),
        latitude: convertCoordinate(accommodationData.location.latitude)
      },
      details: {
        Bedrooms: parseInt(accommodationData.details.Bedrooms) || 0,
        Bathrooms: parseInt(accommodationData.details.Bathrooms) || 0,
        isFull: accommodationData.details.isFull || false,
        Category: formatEnumValue(accommodationData.details.Category),
        Type: formatEnumValue(accommodationData.details.Type),
        Facilities: {
          wifi: accommodationData.details.Facilities.wifi || false,
          solar: accommodationData.details.Facilities.solar || false,
          gas: accommodationData.details.Facilities.gas || false,
          security: accommodationData.details.Facilities.security || false,
          kitchen: accommodationData.details.Facilities.kitchen || false,
          SwimmingPool: accommodationData.details.Facilities.SwimmingPool || false
        },
        price: parseFloat(accommodationData.details.price) || 0,
        distance: parseInt(accommodationData.details.distance) || 0
      }
    };

    // Add media updates if any
    const mediaUpdates = {};
    if (coverImageId) mediaUpdates.CoverImage = coverImageId;
    if (galleryIds.length > 0) mediaUpdates.Gallery = galleryIds;
    if (roomIds.length > 0) mediaUpdates.Rooms = roomIds;
    if (showcaseIds.length > 0) mediaUpdates.ShowCase = showcaseIds;

    if (Object.keys(mediaUpdates).length > 0) {
      data.media = mediaUpdates;
    }

    console.log('Sending GraphQL update mutation with data:', data);

    // Execute GraphQL mutation
    const result = await graphqlRequest(UPDATE_ACCOMMODATION_MUTATION, { 
      id: documentId, 
      data 
    });
    console.log('Accommodation updated successfully:', result);
    
    return transformStrapiResponse(result.updateAccommodation.data);

  } catch (error) {
    console.error('Error updating accommodation:', error);
    throw error;
  }
};

// Get user's accommodations only - Strapi v5
export const getUserAccommodations = async (user) => {
  try {
    console.log('🔍 Fetching accommodations for user:', user);
    
    // First get landlord ID to filter accommodations
    const landlordId = await getLandlordId(user);
    console.log('👤 Found landlord ID for filtering:', landlordId);
    
    const result = await graphqlRequest(GET_USER_ACCOMMODATIONS_QUERY);
    console.log('📦 Raw accommodations data:', result);
    
    if (!result || !result.accommodations || !result.accommodations.data) {
      console.log('No accommodations data found, returning empty array');
      return [];
    }
    
    // Filter accommodations by landlord ID
    const userAccommodations = result.accommodations.data.filter(acc => {
      const accommodationLandlordId = acc.attributes.landlord?.data?.id;
      console.log(`🏠 Accommodation ${acc.id} - Landlord: ${accommodationLandlordId}, Expected: ${landlordId}`);
      return accommodationLandlordId === landlordId;
    });
    
    console.log(`✅ Found ${userAccommodations.length} accommodations for landlord ${landlordId}`);
    
    // Transform the Strapi response to match our frontend format
    const transformedAccommodations = userAccommodations.map(item => transformStrapiResponse(item));
    
    console.log('🎉 Transformed user accommodations:', transformedAccommodations);
    
    return transformedAccommodations;
  } catch (error) {
    console.error('❌ Error fetching user accommodations:', error);
    throw error;
  }
};

// Helper function to transform Strapi v5 response to our frontend format
const transformStrapiResponse = (strapiData) => {
  if (!strapiData?.attributes) {
    console.warn('⚠️ transformStrapiResponse: No attributes found in data');
    return null;
  }

  const attributes = strapiData.attributes;
  const media = attributes.media || {};
  const location = attributes.location || {};
  const details = attributes.details || {};
  const facilities = details.Facilities || {};
  
  // 🔥 ADD: Extract landlord data
  const landlordData = attributes.landlord?.data?.attributes || {};
  const landlordId = attributes.landlord?.data?.id;

  console.log('👤 Landlord data in transformation:', {
    landlordId,
    landlordData
  });

  // Helper to get media URL
  const getMediaUrl = (mediaData) => {
    if (!mediaData?.data?.attributes?.url) return '/default-property.jpg';
    return `http://localhost:1337${mediaData.data.attributes.url}`;
  };

  // Helper to get media array
  const getMediaArray = (mediaArray) => {
    if (!mediaArray?.data) return [];
    return mediaArray.data.map(item => ({
      url: item.attributes?.url ? `http://localhost:1337${item.attributes.url}` : '/default-gallery.jpg',
      alternativeText: item.attributes?.alternativeText || 'Media image'
    }));
  };

  const transformedData = {
    id: strapiData.id,
    documentId: strapiData.id,
    name: attributes.name || 'Property Name',
    userId: attributes.user?.data?.id,
    // 🔥 ADD: Landlord data
    landlord: {
      id: landlordId,
      documentId: landlordId,
      fullName: landlordData.fullName || 'Landlord',
      landlordId: landlordData.landlordId || '',
      phoneNumber: landlordData.phoneNumber || '',
      email: landlordData.users_permissions_user?.data?.attributes?.email || '',
      hasProfile: !!landlordData.profile?.data?.attributes?.url,
      profile: {
        url: landlordData.profile?.data?.attributes?.url 
          ? `http://localhost:1337${landlordData.profile.data.attributes.url}`
          : '/default-avatar.jpg',
        alternativeText: landlordData.profile?.data?.attributes?.alternativeText || 'Profile picture'
      }
    },
    status: attributes.status || 'active',
    views: Math.floor(Math.random() * 200),
    favorites: Math.floor(Math.random() * 20),
    inquiries: Math.floor(Math.random() * 15),
    likes: attributes.likes || 0,
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
    publishedAt: attributes.publishedAt,
    media: {
      CoverImage: {
        url: getMediaUrl(media.CoverImage),
        alternativeText: media.CoverImage?.data?.attributes?.alternativeText || 'Property image'
      },
      Gallery: getMediaArray(media.Gallery),
      Rooms: getMediaArray(media.Rooms),
      ShowCase: getMediaArray(media.ShowCase)
    },
    location: {
      Address: location.Address || '',
      City: location.City || '',
      longitude: location.longitude?.toString() || '',
      latitude: location.latitude?.toString() || ''
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
    }
  };

  console.log('✅ Transformed accommodation with landlord:', {
    id: transformedData.id,
    name: transformedData.name,
    landlord: transformedData.landlord
  });

  return transformedData;
};

// Helper function to get enum values from your schema
export const getSchemaEnums = async () => {
  try {
    const categoryQuery = `
      query {
        __type(name: "ENUM_COMPONENTLISTINGSDETAILS_CATEGORY") {
          enumValues {
            name
          }
        }
      }
    `;

    const typeQuery = `
      query {
        __type(name: "ENUM_COMPONENTLISTINGSDETAILS_TYPE") {
          enumValues {
            name
          }
        }
      }
    `;

    const [categoryResult, typeResult] = await Promise.all([
      graphqlRequest(categoryQuery),
      graphqlRequest(typeQuery)
    ]);

    return {
      categories: categoryResult?.__type?.enumValues?.map(val => val.name) || [],
      types: typeResult?.__type?.enumValues?.map(val => val.name) || []
    };
  } catch (error) {
    console.error('Error fetching schema enums:', error);
    return {
      categories: [],
      types: []
    };
  }
};

// Export the main service object
export const accommodationService = {
  createAccommodation,
  updateAccommodation,
  getUserAccommodations,
  getLandlordId,
  uploadFile,
  uploadFiles,
  graphqlRequest,
  getSchemaEnums
};

export default accommodationService;