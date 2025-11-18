import { gql } from "@apollo/client";

export const GET_ACCOMMODATIONS_DETAILS = gql`
  query Get_Data($pagination: PaginationArg) {
    accommodations(pagination: $pagination) {
      documentId
      name 
      details {
        Bedrooms
        Bathrooms
        isFull
        Category
        Type
        price
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
      location {
        Address
        City
        longitude
        latitude
      }
      media {
        CoverImage {
          alternativeText
          url
        }
        Gallery {
          alternativeText
          url
        }
        Gallery_connection {
          nodes {
            alternativeText
            url
          }
        }
        Rooms {
          alternativeText
          url
        }
        Rooms_connection {
          nodes {
            alternativeText
            url
          }
        }
        ShowCase {
          alternativeText
          url
          previewUrl
        }
        id
      }
      landlord {
        documentId
        fullName
        landlordId
        phoneNumber
        profile {
          alternativeText
          url
        }
        users_permissions_user {
          documentId
          email
          username
        }
      }
      likes
      createdAt
      updatedAt
    }
  }
`;