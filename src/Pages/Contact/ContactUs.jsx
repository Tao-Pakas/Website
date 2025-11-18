import React from 'react';
import style from '../../Styles/pages/ContactPage.module.css';
import { useQuery } from '@apollo/client/react';
import { Get_Contact_Page_Data_Query } from './Contact';
import Hero from '../../Components/Common/Hero';

// Icon components for contact information
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
  const { data, error, loading } = useQuery(Get_Contact_Page_Data_Query, {
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: false,
  });

  if (loading && !data) return <div className={style.loading}>Loading Contact Information...</div>;
  if (error) return <div className={style.error}>Error: {error.message}</div>;

  const contactInfo = data?.contactUs?.contactUs;
  const contactHero = data?.contactUs?.HeroSection;
  const getImageUrl = 'http://localhost:1337';

  return (
    <div className={style.mainBody}>
      
    
      <div className={style.ContactUsBody}>
        {/* Contact Information Card */}
        <section className={style.ContactInfo}>
          <div className={style.infoHeader}>
            <h2>Get In Touch</h2>
            <p>We'd love to hear from you</p>
          </div>
          
          {contactInfo ? (
            <>
              <div className={style.contactItem}>
                <ContactIcon type="company" />
                <div className={style.contactContent}>
                  <label>Company Name</label>
                  <p>{contactInfo.name || 'Not specified'}</p>
                </div>
              </div>
              
              <div className={style.contactItem}>
                <ContactIcon type="email" />
                <div className={style.contactContent}>
                  <label>Email Address</label>
                  <p>{contactInfo.email || 'Not specified'}</p>
                </div>
              </div>
              
              <div className={style.contactItem}>
                <ContactIcon type="phone" />
                <div className={style.contactContent}>
                  <label>Phone Number</label>
                  <p>+263 {contactInfo.phone || 'Not specified'}</p>
                </div>
              </div>
              
              <div className={style.contactItem}>
                <ContactIcon type="address" />
                <div className={style.contactContent}>
                  <label>Office Address</label>
                  <p>{contactInfo.address || 'Not specified'}</p>
                </div>
              </div>
            </>
          ) : (
            <div className={style.loading}>Loading contact information...</div>
          )}
        </section>

        {/* Contact Form */}
        <section className={style.ContactForm}>
          <section className={style.ContactFormFields}>
            <div className={style.formHeader}>
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you soon</p>
            </div>
            
            <div className={style.Container1}>
              <label htmlFor="name">Your Name</label>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                id="name" 
              />
            </div>
            
            <div className={style.Container1}>
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                id="email" 
              />
            </div>
            
            <div className={style.Container1}>
              <label htmlFor="message">Your Message</label>
              <textarea 
                name="message" 
                id="message" 
                placeholder="Tell us how we can help you..."
                rows="6"
              />
            </div>
            
            <button className={style.Submit}>
              Send Message
            </button>
          </section>
        </section>
      </div>
    </div>
  );
}