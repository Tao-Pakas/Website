import { gql } from '@apollo/client';

// Debug query to check available filter fields
export const GET_INQUIRY_FILTER_FIELDS = gql`
  query GetInquiryFilterFields {
    __type(name: "InquiryFiltersInput") {
      name
      inputFields {
        name
        type {
          name
          kind
        }
      }
    }
  }
`;

// Try different possible field names
export const GET_USER_INQUIRIES = gql`
  query GetUserInquiries($userId: String!) {
    inquiries(filters: { createdBy: { id: { eq: $userId } } }) {
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
        landlordId
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

export const GET_LANDLORD_INQUIRIES = gql`
  query GetLandlordInquiries($landlordId: String!) {
    inquiries(filters: { landlord: { id: { eq: $landlordId } } }) {
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
        landlordId
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

// Alternative: Try filtering by the userId attribute directly
export const GET_USER_INQUIRIES_BY_ATTRIBUTE = gql`
  query GetUserInquiries($userId: String!) {
    inquiries(filters: { userId: { eq: $userId } }) {
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
        landlordId
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

export const GET_LANDLORD_INQUIRIES_BY_ATTRIBUTE = gql`
  query GetLandlordInquiries($landlordId: String!) {
    inquiries(filters: { landlordId: { eq: $landlordId } }) {
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
        landlordId
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
        landlordId
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
        landlordId
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