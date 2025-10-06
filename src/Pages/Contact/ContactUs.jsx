import React from 'react';
import style from '../../Styles/pages/ContactPage.module.css';
import { useQuery } from '@apollo/client/react';
import { Get_Contact_Page_Data_Query } from './Contact';
import Hero from '../../Components/Common/Hero'

export default function ContactUs() {
  const { data, error, loading } = useQuery(Get_Contact_Page_Data_Query, {
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: false,
  });

  if (loading && !data) return <div className={style.loading}>Loading ContactUs...</div>;
  if (error) return <div className={style.error}>Error: {error.message}</div>;

  const contactInfo = data?.contactUs?.contactUs;
  const contactHero = data?.contactUs?.HeroSection;
  const getImageUrl = 'http://localhost:1337';

  return (
    <div className={style.mainBody}>
      {contactHero ? (
        <Hero
          key={contactHero?.id}
          imagePath={`${getImageUrl}${contactHero?.heroImage?.url}`}
          title={contactHero?.topDescription}
          description={contactHero?.bottomDescription}
          universityName="Chinhoyi University of Technology"
          alternativeText={contactHero?.heroImage?.alternativeText}
        />
      ) : (<div className={style.loading}>Loading Hero data...</div>

      )}
    
    <div className={style.ContactUsBody}>
      <section className={style.ContactInfo}>
        {contactInfo ? (
          <>
            <div className={style.Container1}>
              <label htmlFor="companyName">Company Name</label>
              <p id="companyName">{contactInfo.name || 'Not specified'}</p>
            </div>
            <div className={style.Container1}>
              <label htmlFor="contactEmail">Email</label>
              <p id="contactEmail">{contactInfo.email || 'Not specified'}</p>
            </div>
            <div className={style.Container1}>
              <label htmlFor="contactPhone">Phone Number</label>
              <p id="contactPhone">+263 {contactInfo.phone || 'Not specified'}</p>
            </div>
            <div className={style.Container1}>
              <label htmlFor="contactAddress">Address</label>
              <p id="contactAddress">{contactInfo.address || 'Not specified'}</p>
            </div>
          </>
        ) : (
          <div className={style.loading}>Loading contact information...</div>
        )}
      </section>

      <section className={style.ContactForm}>
        <section className={style.ContactFormFields}>
          <div className={style.Container1}>
            <label htmlFor="name">Name</label>
            <input type="text" placeholder="Enter your name" id="name" />
          </div>
          <div className={style.Container1}>
            <label htmlFor="email">Email</label>
            <input type="email" placeholder="Enter your email" id="email" />
          </div>
          <div className={style.Container1}>
            <label htmlFor="message">Message</label>
            <textarea 
              name="message" 
              id="message" 
              placeholder="Enter your message"
              rows="5"
            />
          </div>
          <button className={style.Submit}>Submit</button>
        </section>
      </section>
    </div>
    </div>
  );
}