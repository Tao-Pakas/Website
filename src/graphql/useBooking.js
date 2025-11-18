import { gql } from '@apollo/client';

// UPDATED: Get all inquiries with proper relationships
export const GET_ALL_INQUIRIES = gql`
  query GetAllInquiries {
    inquiries {
      info {
        description
        name
      }
      options {
        increments
        timestamps
      }
      attributes {
        id
        propetyId
        propertyName
        userId
        userName
        userEmail
        userPhone
        message
        preferredDate
        state
        landlordReply
        counterDate
        user {
          id
          username
          email
          student {
            id
          }
          landlord {
            id
          }
        }
        property {
          documentId
          name
          landlord {
            id
            user {
              id
              username
            }
          }
        }
      }
    }
  }
`;

// UPDATED: Fixed enquiry creation with proper relationships
export const CREATE_INQUIRY = gql`
  mutation CreateInquiry($data: InquiryInput!) {
    createInquiry(data: $data) {
      info {
        description
        name
      }
      options {
        increments
        timestamps
      }
      attributes {
        id
        propetyId
        propertyName
        userId
        userName
        userEmail
        userPhone
        message
        preferredDate
        state
        landlordReply
        counterDate
        user {
          id
          username
        }
        property {
          documentId
          name
        }
      }
    }
  }
`;

export const UPDATE_INQUIRY_STATUS = gql`
  mutation UpdateInquiryStatus($id: ID!, $data: InquiryInput!) {
    updateInquiry(id: $id, data: $data) {
      info {
        description
        name
      }
      options {
        increments
        timestamps
      }
      attributes {
        id
        propetyId
        propertyName
        userId
        userName
        userEmail
        userPhone
        message
        preferredDate
        state
        landlordReply
        counterDate
      }
    }
  }
`;

// FIXED: Like/Unlike mutations - Use documentId and proper increment syntax
export const LIKE_PROPERTY = gql`
  mutation LikeProperty($documentId: ID!) {
    updateAccommodation(documentId: $documentId, data: { likes: 1 }) {
      documentId
      likes
    }
  }
`;

export const UNLIKE_PROPERTY = gql`
  mutation UnlikeProperty($documentId: ID!) {
    updateAccommodation(documentId: $documentId, data: { likes: -1 }) {
      documentId
      likes
    }
  }
`;

// UPDATED: Get property with landlord info and relationships
export const GET_PROPERTY_WITH_LANDLORD = gql`
  query GetPropertyWithLandlord($documentId: ID!) {
    accommodation(documentId: $documentId) {
      documentId
      name
      likes
      landlord {
        id
        user {
          id
          username
          email
        }
      }
      user {
        id
        username
      }
    }
  }
`;

// NEW: Query to get student inquiries
export const GET_STUDENT_INQUIRIES = gql`
  query GetStudentInquiries($userId: ID!) {
    inquiries(filters: { user: { id: { eq: $userId } } }) {
      attributes {
        id
        propetyId
        propertyName
        userId
        userName
        userEmail
        userPhone
        message
        preferredDate
        state
        landlordReply
        counterDate
        property {
          documentId
          name
          landlord {
            id
            user {
              username
            }
          }
        }
      }
    }
  }
`;

// NEW: Query to get landlord inquiries
export const GET_LANDLORD_INQUIRIES = gql`
  query GetLandlordInquiries($landlordId: ID!) {
    inquiries(filters: { property: { landlord: { id: { eq: $landlordId } } } }) {
      attributes {
        id
        propetyId
        propertyName
        userId
        userName
        userEmail
        userPhone
        message
        preferredDate
        state
        landlordReply
        counterDate
        user {
          id
          username
          student {
            id
          }
        }
        property {
          documentId
          name
        }
      }
    }
  }
`;