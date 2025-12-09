import React, { useState, useEffect } from 'react';
import style from '../../Styles/pages/ContactPage.module.css';
import { useQuery } from '@apollo/client/react';
import { Get_Contact_Page_Data_Query } from './Contact';
import { useApp } from '../../Contexts/AppContext';

// Icon components
const ContactIcon = ({ type }) => {
  switch (type) {
    case 'company':
      return (
        <svg className={style.contactIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
        </svg>
      );
    case 'email':
      return (
        <svg className={style.contactIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      );
    case 'phone':
      return (
        <svg className={style.contactIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM12 3v10l3-3h6V3h-9z"/>
        </svg>
      );
    case 'address':
      return (
        <svg className={style.contactIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      );
    default:
      return null;
  }
};

export default function ContactUs() {
  const { user, userProfile } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const { data, error, loading } = useQuery(Get_Contact_Page_Data_Query, {
    fetchPolicy: 'cache-and-network',
  });

  // Pre-fill form with user data when logged in
  useEffect(() => {
    if (user) {
      const email = user.email || '';
      const name = userProfile?.fullName || user.username || '';
      
      setFormData(prev => ({
        ...prev,
        name: name,
        email: email
      }));
    }
  }, [user, userProfile]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    if (submitStatus.type === 'error') {
      setSubmitStatus({ type: '', message: '' });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setSubmitStatus({ type: 'error', message: 'Name is required' });
      return false;
    }
    
    if (!formData.email.trim()) {
      setSubmitStatus({ type: 'error', message: 'Email is required' });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid email address' });
      return false;
    }
    
    if (!formData.message.trim()) {
      setSubmitStatus({ type: 'error', message: 'Message is required' });
      return false;
    }
    
    return true;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  setSubmitStatus({ type: '', message: '' });

  try {
    // IMPORTANT: Make sure you're using the EXACT same URL
    const url = 'http://localhost:1337/api/contact-submissions';
    
    console.log('🚀 Sending POST to:', url);
    
    // EXACT same payload as curl
    const payload = {
      data: {
        name: formData.name,
        email: formData.email,
        message: formData.message
      }
    };
    
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header for public access (like curl)
      },
      body: JSON.stringify(payload),
    });

    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📨 Raw response:', responseText);
    
    if (!response.ok) {
      console.error('❌ Server error details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });
      throw new Error(`Server error ${response.status}: ${response.statusText}`);
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      throw new Error('Server returned invalid response');
    }
    
    console.log('✅ Success! Response:', result);
    
    setSubmitStatus({ 
      type: 'success', 
      message: result.message || 'Thank you! Your message has been sent successfully.' 
    });
    
    // Reset form
    setFormData({
      name: user ? (userProfile?.fullName || user.username || '') : '',
      email: user ? (user.email || '') : '',
      message: ''
    });
    
  } catch (error) {
    console.error('❌ Submission error:', error);
    
    let errorMessage = 'Failed to submit contact form. ';
    
    if (error.message.includes('405')) {
      errorMessage += 'Server rejected POST request. This might be a CORS issue.';
    } else if (error.message.includes('NetworkError')) {
      errorMessage += 'Network error. Please check your connection.';
    } else {
      errorMessage += error.message;
    }
    
    setSubmitStatus({ 
      type: 'error', 
      message: errorMessage 
    });
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading && !data) return <div className={style.loading}>Loading Contact Information...</div>;
  if (error) return <div className={style.error}>Error: {error.message}</div>;

  const contactInfo = data?.contactUs?.contactUs;
  const contactEmail = contactInfo?.email || 'VarsityCribs@gmail.com';

  return (
    <div className={style.mainBody}>
      <div className={style.ContactUsBody}>
        {/* Left Side - Contact Information */}
        <section className={style.ContactInfo}>
          <div className={style.infoHeader}>
            <h2>Get In Touch</h2>
            <p>We'd love to hear from you</p>
          </div>
          
          <div className={style.contactItem}>
            <ContactIcon type="company" />
            <div className={style.contactContent}>
              <label>Company Name</label>
              <p>{contactInfo?.name || 'Varsity Cribs'}</p>
            </div>
          </div>
          
          <div className={style.contactItem}>
            <ContactIcon type="email" />
            <div className={style.contactContent}>
              <label>Email Address</label>
              <a href={`mailto:${contactEmail}`} className={style.contactLink}>
                {contactEmail}
              </a>
            </div>
          </div>
          
          {contactInfo?.phone && (
            <div className={style.contactItem}>
              <ContactIcon type="phone" />
              <div className={style.contactContent}>
                <label>Phone Number</label>
                <a href={`tel:+263${contactInfo.phone}`} className={style.contactLink}>
                  +263 {contactInfo.phone}
                </a>
              </div>
            </div>
          )}
          
          {contactInfo?.address && (
            <div className={style.contactItem}>
              <ContactIcon type="address" />
              <div className={style.contactContent}>
                <label>Office Address</label>
                <p>{contactInfo.address}</p>
              </div>
            </div>
          )}
          
          {/* User info if logged in */}
          {user && (
            <div className={style.userInfo}>
              <div className={style.userInfoHeader}>
                <ContactIcon type="email" />
                <h4>Your Account</h4>
              </div>
              <p>Logged in as: <strong>{user.username}</strong></p>
              <p>Email: <strong>{user.email}</strong></p>
              <p className={style.userNote}>
                Your message will be linked to your account
              </p>
            </div>
          )}
        
        </section>

        {/* Right Side - Contact Form */}
        <section className={style.ContactForm}>
          <form onSubmit={handleSubmit} className={style.ContactFormFields}>
            <div className={style.formHeader}>
              <h2>Send us a Message</h2>
              <p>Fill out the form below</p>
            </div>
            
            {/* Status Messages */}
            {submitStatus.message && (
              <div className={`${style.statusMessage} ${style[submitStatus.type]}`}>
                {submitStatus.message}
              </div>
            )}
            
            <div className={style.formGroup}>
              <label htmlFor="name">Your Name *</label>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                id="name" 
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              {user && (
                <small className={style.fieldNote}>
                  Using your account name
                </small>
              )}
            </div>
            
            <div className={style.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                id="email" 
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting || (user && user.email)}
                required
              />
              {user && user.email ? (
                <small className={style.fieldNote}>
                  Using your account email
                </small>
              ) : (
                <small className={style.fieldNote}>
                  Enter your email address
                </small>
              )}
            </div>
            
            <div className={style.formGroup}>
              <label htmlFor="message">Your Message *</label>
              <textarea 
                id="message" 
                placeholder="Tell us how we can help you..."
                rows="6"
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className={style.Submit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={style.buttonSpinner}></span>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
            
            <p className={style.formNote}>
              * Required fields
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}