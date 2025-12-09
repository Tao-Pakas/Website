// src/hooks/useContact.js
import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { SEND_EMAIL, SEND_SMS, UPDATE_INQUIRY } from '../graphql/contact';

/**
 * useContact Hook
 * Provides contact functionality for students and landlords including:
 * - Email communication
 * - WhatsApp messaging
 * - SMS messaging
 * - Phone calls
 * - Inquiry creation and management
 */
export const useContact = () => {
  // State for contact operations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // GraphQL Mutations
  const [sendEmailMutation] = useMutation(SEND_EMAIL);
  const [sendSMSMutation] = useMutation(SEND_SMS);
  const [updateInquiryMutation] = useMutation(UPDATE_INQUIRY);

  /**
   * Send Email to recipient
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.message - Email body
   * @param {string} options.from - Sender email (optional)
   * @returns {Promise} - Result of email operation
   */
  const sendEmail = async ({ to, subject, message, from }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendEmailMutation({
        variables: {
          emailData: {
            to,
            subject,
            message,
            from: from || undefined
          }
        }
      });

      if (result.data?.sendEmail?.success) {
        setSuccess('Email sent successfully!');
        return { success: true, data: result.data.sendEmail };
      } else {
        throw new Error(result.data?.sendEmail?.error || 'Failed to send email');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send SMS to phone number
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number
   * @param {string} options.message - SMS content
   * @param {string} options.from - Sender phone number (optional)
   * @returns {Promise} - Result of SMS operation
   */
  const sendSMS = async ({ to, message, from }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendSMSMutation({
        variables: {
          smsData: {
            to,
            message,
            from: from || undefined
          }
        }
      });

      if (result.data?.sendSMS?.success) {
        setSuccess('SMS sent successfully!');
        return { success: true, data: result.data.sendSMS };
      } else {
        throw new Error(result.data?.sendSMS?.error || 'Failed to send SMS');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send SMS';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Open WhatsApp chat with phone number
   * @param {Object} options - WhatsApp options
   * @param {string} options.phoneNumber - Recipient phone number
   * @param {string} options.message - Pre-filled message (optional)
   * @param {boolean} options.useWeb - Use WhatsApp Web if true, mobile if false
   */
  const openWhatsApp = ({ phoneNumber, message = '', useWeb = false }) => {
    try {
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);
      
      // Determine WhatsApp URL
      const whatsappUrl = useWeb 
        ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`
        : `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
      
      // Open in new tab
      window.open(whatsappUrl, '_blank');
      
      return { success: true };
    } catch (err) {
      const errorMessage = 'Failed to open WhatsApp';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Initiate phone call
   * @param {string} phoneNumber - Phone number to call
   */
  const makePhoneCall = (phoneNumber) => {
    try {
      // Clean phone number
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      // Create tel: link
      const telUrl = `tel:${cleanPhone}`;
      
      // Open phone dialer (on mobile) or show instructions (on desktop)
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        window.location.href = telUrl;
      } else {
        // On desktop, show the number to call
        alert(`Call ${cleanPhone}`);
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = 'Failed to initiate call';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Update existing inquiry
   * @param {Object} options - Update options
   * @param {string} options.inquiryId - ID of inquiry to update
   * @param {string} options.state - New state (unread, in-progress, done)
   * @param {string} options.landlordReply - Landlord's reply message
   * @param {string} options.counterDate - Suggested alternative date
   * @returns {Promise} - Result of update operation
   */
  const updateInquiry = async ({
    inquiryId,
    state,
    landlordReply,
    counterDate
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updates = {};
      if (state) updates.state = state;
      if (landlordReply) updates.landlordReply = landlordReply;
      if (counterDate) updates.counterDate = counterDate;

      const result = await updateInquiryMutation({
        variables: {
          id: inquiryId,
          data: updates
        }
      });

      if (result.data?.updateInquiry?.data?.id) {
        setSuccess('Inquiry updated successfully!');
        return { 
          success: true, 
          data: result.data.updateInquiry.data 
        };
      } else {
        throw new Error(result.data?.updateInquiry?.error || 'Failed to update inquiry');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update inquiry';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send contact request (email + SMS notification)
   * @param {Object} options - Contact request options
   * @param {string} options.recipientEmail - Recipient email
   * @param {string} options.recipientPhone - Recipient phone
   * @param {string} options.senderName - Sender's name
   * @param {string} options.senderContact - Sender's contact info
   * @param {string} options.propertyName - Property name
   * @param {string} options.message - Custom message
   * @returns {Promise} - Result of contact request
   */
  const sendContactRequest = async ({
    recipientEmail,
    recipientPhone,
    senderName,
    senderContact,
    propertyName,
    message
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Send email
      const emailResult = await sendEmail({
        to: recipientEmail,
        subject: `New Contact Request for ${propertyName}`,
        message: `
          Hello,
          
          You have a new contact request from ${senderName} regarding "${propertyName}".
          
          Message: ${message}
          
          Sender's contact information: ${senderContact}
          
          Please respond at your earliest convenience.
          
          Best regards,
          Varsity Cribs Team
        `
      });

      // Send SMS notification
      const smsResult = await sendSMS({
        to: recipientPhone,
        message: `New contact request for ${propertyName} from ${senderName}. Check your email for details.`
      });

      if (emailResult.success && smsResult.success) {
        setSuccess('Contact request sent successfully!');
        return { success: true, email: emailResult, sms: smsResult };
      } else {
        throw new Error('Failed to send contact request');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send contact request';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear all messages and reset state
   */
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    // State
    loading,
    error,
    success,
    
    // Contact Methods
    sendEmail,
    sendSMS,
    openWhatsApp,
    makePhoneCall,
    
    // Inquiry Management
    updateInquiry,
    
    // Combined Actions
    sendContactRequest,
    
    // Utilities
    clearMessages
  };
};

export default useContact;