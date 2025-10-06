import { gql } from '@apollo/client';

export const GET_PROPERTY_DETAILS = gql`
  query GetPropertyDetails($documentId: ID!) {
    accommodation(documentId: $documentId) {
      documentId
      name
      location {
        Address
        City
        longitude
        latitude
      }
      details {
        price
        Bedrooms
        Bathrooms
        isFull
        Category
        Type
        distance
        Facilities {
          wifi
          solar
          gas
          security
          kitchen
          SwimmingPool
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
        ShowCase {
          url
          alternativeText
        }
      }
    }
  }
`;