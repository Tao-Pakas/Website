// In inquiries.js - ADD this query
import { gql } from '@apollo/client';

// 🔥 FIXED: Get student inquiries - removed createdAt/updatedAt
export const GET_STUDENT_INQUIRIES = gql`
  query GetStudentInquiries($filters: InquiryFiltersInput) {
    inquiries(filters: $filters) {
      documentId
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
      }
      landlords {
        documentId
        fullName
        landlordId
        phoneNumber
        profile {
          url
          alternativeText
        }
      }
    }
  }
`;

// 🔥 ADDED: The missing query that was causing the error
// In inquiries.js - Update the query to use studentDocumentId
export const GET_STUDENT_INQUIRIES_WITH_PROPERTIES = gql`
  query GetStudentInquiriesWithProperties($studentDocumentId: ID!) {
    inquiries(
      filters: { 
        students: { 
          documentId: { eq: $studentDocumentId }  
        } 
      }
      sort: ["createdAt:desc"]
    ) {
      documentId
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
      accommodation {
        documentId
        name
        location {
          Address
          City
        }
        details {
          price
          Category
          isFull
        }
        media {
          CoverImage {
            url
            alternativeText
          }
        }
        landlord {
          documentId
          fullName
          phoneNumber
        }
      }
      students {
        documentId
        firstName
        lastName
        studentId
      }
    }
  }
`;

// In inquiries.js - Update the landlord accommodations query
export const GET_ACCOMMODATIONS_INQUIRIES = gql`
  query GetLandlordAccommodations($landlordDocumentId: ID!) {
    accommodations(filters: { 
      landlord: { 
        documentId: { eq: $landlordDocumentId } 
      } 
    }) {
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
        Rooms {
          alternativeText
          url
          previewUrl
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
        }
        createdAt
        updatedAt
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
      }
    }
  }
`;

// 🔥 FIXED: Create inquiry mutation - removed createdAt/updatedAt
export const CREATE_INQUIRY = gql`
  mutation CreateInquiry($data: InquiryInput!) {
    createInquiry(data: $data) {
      documentId
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
      }
      landlords {
        documentId
        fullName
        landlordId
      }
      students {
        documentId
        firstName
        lastName
        phoneNumber
      }
      accommodation {
        documentId
        name
        media {
          CoverImage {
            alternativeText
            url
          }
        }
        details {
          id
          Bedrooms
          Bathrooms
          isFull
          Category
          Type
          Facilities {
            id
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
        landlord {
          documentId
          fullName
          phoneNumber
        }
      }
    }
  }
`;



// 🔥 FIXED: Update inquiry mutation - removed updatedAt
export const UPDATE_INQUIRY_STATUS = gql`
  mutation UpdateInquiry($id: ID!, $data: InquiryInput!) {
    updateInquiry(documentId: $id, data: $data) {
      documentId
      attributes {
        state
        landlordReply
        counterDate
      }
    }
  }
`;