import { GET_LANDLORD_BY_USER_ID } from '../graphql/createProfile';
import gql from 'graphql'

const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('jwt') || '';
};

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
`

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
`

export const GetLandlordAccommodations = gql`
    query GetUserAccommodations($landlordId: ID!) {
    accommodations(filters: { landlord: { documentId: { eq: $landlordId } } }) {
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
    }
  }
`

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
`

export const DeleteAccommodation = gql`
    mutation DeleteAccommodation($documentId: ID!) {
        deleteAccommodation(documentId: $documentId) {
            documentId
        }
    }
`

// Helper function to handle GraphQL API calls
const graphqlRequest = async (query, variables = {}) => {
    // Get JWT token from local storage for authentication
    // Used to authorize request if user is logged in
    const token = getAuthToken();

    try {
        console.log('🔐 GraphQL request with token:', token ? 'YES' : 'NO');
        console.log('📤 GraphQL variables:', variables);

        let queryString;
        if (typeof query === 'string') {
            queryString = query;
        } else {
            queryString = query.loc?.source?.body || String(query);
            console.log('🔍 Converted AST to string:', queryString);
        }

        const response = await fetch('http://localhost:1337/graphql', {
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
        console.log('📡 GraphQL response status:', response.status);
        console.log('📦 GraphQL response data:', result);

        if (result.errors) {
            console.error('❌ GraphQL errors details:', JSON.stringify(result.errors, null, 2));
            throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return result.data;
    } catch (error) {
        console.error('💥 GraphQL request failed:', error);
        throw error;
    }
};

// Upload file to Strapi
const uploadFile = async (file) => {
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
            throw new Error(`File upload failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('File uploaded successfully:', data);
        
        if (Array.isArray(data) && data.length > 0) {
            return data[0];
        }
        
        return data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

// Upload multiple files
const uploadFiles = async (files) => {
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

// Export the service functions
export const accommodationService = {
    graphqlRequest,
    uploadFile,
    uploadFiles
};

export default accommodationService;