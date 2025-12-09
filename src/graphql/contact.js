// src/graphql/mutations.js
import { gql } from '@apollo/client';

// Send Email Mutation
export const SEND_EMAIL = gql`
  mutation SendEmail($emailData: EmailInput!) {
    sendEmail(emailData: $emailData) {
      success
      message
      error
    }
  }
`;

// Send SMS Mutation
export const SEND_SMS = gql`
  mutation SendSMS($smsData: SMSInput!) {
    sendSMS(smsData: $smsData) {
      success
      message
      error
    }
  }
`;

// Update Inquiry Mutation
export const UPDATE_INQUIRY = gql`
  mutation UpdateInquiry($id: ID!, $data: InquiryInput!) {
    updateInquiry(id: $id, data: $data) {
      data {
        id
        attributes {
          state
          landlordReply
          counterDate
        }
      }
      error
    }
  }
`;