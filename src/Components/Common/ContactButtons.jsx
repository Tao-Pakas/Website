import React, { useState } from 'react';
import { 
  FaEnvelope, 
  FaWhatsapp, 
  FaSms, 
  FaPhone, 
  FaComment,
  FaTimes
} from 'react-icons/fa';
import useContact from '../../Hooks/useContact';
import styles from '../../Styles/components/ButtonComponents.module.css';

/**
 * ContactButtons Component
 * Provides multiple contact options in a compact interface
 */
const ContactButtons = ({ 
  user, 
  recipient, 
  property, 
  onSuccess,
  showInquiryForm = true
}) => {
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  
  const {
    loading,
    error,
    success,
    sendEmail,
    sendSMS,
    openWhatsApp,
    makePhoneCall,
    clearMessages
  } = useContact();

  // Handle email contact
  const handleEmail = async () => {
    if (!recipient?.email) {
      alert('Email address not available');
      return;
    }

    const subject = property?.name 
      ? `Inquiry about ${property.name}`
      : 'Property Inquiry';

    const message = `Hello,\n\nI'm interested in your property${
      property?.name ? ` "${property.name}"` : ''
    }. Could you please provide more information?\n\nBest regards,\n${user?.username || user?.email}`;

    await sendEmail({
      to: recipient.email,
      subject,
      message,
      from: user?.email
    });

    if (onSuccess) onSuccess('email');
  };

  // Handle WhatsApp
  const handleWhatsApp = () => {
    if (!recipient?.phone) {
      alert('Phone number not available for WhatsApp');
      return;
    }

    const message = property?.name
      ? `Hello, I'm interested in your property "${property.name}" on Varsity Cribs. Could we discuss details?`
      : 'Hello, I saw your property on Varsity Cribs and would like to discuss details.';

    openWhatsApp({
      phoneNumber: recipient.phone,
      message,
      useWeb: false
    });

    if (onSuccess) onSuccess('whatsapp');
  };

  // Handle SMS
  const handleSMS = async () => {
    if (!recipient?.phone) {
      alert('Phone number not available for SMS');
      return;
    }

    const message = property?.name
      ? `Hello, I'm interested in "${property.name}" on Varsity Cribs. Please contact me at ${user?.phone || user?.email}.`
      : `Hello, I'm interested in your property on Varsity Cribs. Please contact me at ${user?.phone || user?.email}.`;

    await sendSMS({
      to: recipient.phone,
      message
    });

    if (onSuccess) onSuccess('sms');
  };

  // Handle phone call
  const handlePhoneCall = () => {
    if (!recipient?.phone) {
      alert('Phone number not available');
      return;
    }

    makePhoneCall(recipient.phone);
    if (onSuccess) onSuccess('call');
  };

  return (
    <>
      {/* Main Contact Button */}
      <div className={styles.contactContainer}>
        {showContactOptions ? (
          <div className={styles.contactOptions}>
            <button
              className={`${styles.contactOption} ${styles.emailOption}`}
              onClick={handleEmail}
              disabled={loading || !recipient?.email}
              title={recipient?.email ? `Email ${recipient.email}` : 'Email not available'}
            >
              <FaEnvelope />
              <span>Email</span>
            </button>

            <button
              className={`${styles.contactOption} ${styles.whatsappOption}`}
              onClick={handleWhatsApp}
              disabled={!recipient?.phone}
              title={recipient?.phone ? `WhatsApp ${recipient.phone}` : 'Phone not available'}
            >
              <FaWhatsapp />
              <span>WhatsApp</span>
            </button>

            <button
              className={`${styles.contactOption} ${styles.smsOption}`}
              onClick={handleSMS}
              disabled={loading || !recipient?.phone}
              title={recipient?.phone ? `SMS ${recipient.phone}` : 'Phone not available'}
            >
              <FaSms />
              <span>SMS</span>
            </button>

            <button
              className={`${styles.contactOption} ${styles.callOption}`}
              onClick={handlePhoneCall}
              disabled={!recipient?.phone}
              title={recipient?.phone ? `Call ${recipient.phone}` : 'Phone not available'}
            >
              <FaPhone />
              <span>Call</span>
            </button>

            <button
              className={styles.closeOptions}
              onClick={() => setShowContactOptions(false)}
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <button
            className={styles.mainContactButton}
            onClick={() => setShowContactOptions(true)}
          >
            <FaComment />
            <span>Contact</span>
          </button>
        )}
      </div>
    </>
  );
};

export default ContactButtons;