import { gql } from '@apollo/client';

export const GET_PROPERTY_DETAILS = gql`
  query GetPropertyDetails($documentId: ID!) {
    accommodation(documentId: $documentId) {
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
        price
        Category
        Type
        distance
        isFull
        Facilities {
          kitchen
          SwimmingPool
          gas
          security
          solar
          wifi
        }
      }
      media {
        CoverImage {
          url
          alternativeText
        }
        Gallery {
          url
          alternativeText
        }
        Rooms {
          url
          alternativeText
        }
      }
      # 🔥 CRITICAL: Added proper landlord fields
      landlord {
        documentId
        fullName
        landlordId
        phoneNumber
        users_permissions_user {
          email
          username
        }
      }
      likes
      createdAt
    }
  }
`;