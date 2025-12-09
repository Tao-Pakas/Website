import React from 'react';
import style from '../../Styles/pages/AboutPage.module.css';
import Hero from '../../Components/Common/Hero';
import { useQuery } from '@apollo/client/react';
import { About_Page_Data } from './About';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaHome, 
  FaAward, 
  FaHeart,
  FaShieldAlt,
  FaRocket,
  FaHandshake
} from 'react-icons/fa';

export default function AboutPage() {
  const { data, loading, error } = useQuery(About_Page_Data, {
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: false,
  });

  if (loading && !data) return <div className={style.loading}>Loading about page...</div>;
  if (error) return <div className={style.error}>Error: {error.message}</div>;

  const aboutItems = data?.about;
  const API_BASE_URL = 'http://localhost:1337';

  // Reasons data
  const reasons = [
    {
      icon: <FaHome />,
      title: "Premium Student Accommodation",
      description: "Hand-picked properties that meet our strict quality standards for comfort and safety."
    },
    {
      icon: <FaShieldAlt />,
      title: "Verified & Secure",
      description: "All our properties and landlords are thoroughly verified to ensure your peace of mind."
    },
    {
      icon: <FaAward />,
      title: "Best Locations",
      description: "Strategic locations near universities, transport, and essential amenities."
    },
    {
      icon: <FaHeart />,
      title: "Student-First Approach",
      description: "Designed specifically for student needs with flexible terms and understanding."
    }
  ];

  // Stats data
  const stats = [
    { number: "500+", label: "Happy Students" },
    { number: "50+", label: "Premium Properties" },
    { number: "24/7", label: "Support" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  // Team preview
  const teamMembers = [
    { name: "Taonashe Pakachena", role: "Founder & CEO" },
  ];

  return (
    <div className={style.Body}>
      {aboutItems && (
        <>
          {/* Hero Section */}
          

          {/* Company Overview */}
          <section className={style.Overview}>
            <p>{aboutItems?.CompanyOverView}</p>
          </section>

          {/* Stats Section */}
          <div className={style.Stats}>
            {stats.map((stat, index) => (
              <div key={index} className={style.StatCard}>
                <div className={style.StatNumber}>{stat.number}</div>
                <div className={style.StatLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Our Mission */}
          {aboutItems?.OurMission && (
            <section className={style.AboutUs}>
              <div className={style.imageContainer}>
                <img
                  src={`${API_BASE_URL}${aboutItems?.OurMission?.aboutImage?.url}`}
                  alt={aboutItems?.OurMission?.aboutImage?.alternativeText || 'Our Mission'}
                  loading="lazy"
                />
              </div>
              <div className={style.DescriptionContainer}>
                <h2>Our Mission</h2>
                <p>{aboutItems?.OurMission?.description}</p>
              </div>
            </section>
          )}

          {/* Our Values */}
          {aboutItems?.ValuesAndCulture && (
            <section className={style.OurValues}>
              <div className={style.DescriptionContainer}>
                <h2>Our Values & Culture</h2>
                <p>{aboutItems?.ValuesAndCulture?.description}</p>
              </div>
              <div className={style.imageContainer}>
                <img
                  src={`${API_BASE_URL}${aboutItems?.ValuesAndCulture?.aboutImage?.url}`}
                  alt={aboutItems?.ValuesAndCulture?.aboutImage?.alternativeText || 'Our Values'}
                  loading="lazy"
                />
              </div>
            </section>
          )}

          {/* Why Choose Us */}
          <section className={style.WhyChooseUs}>
            <h2>Why Choose VarsityCribs?</h2>
            <div className={style.ReasonsGrid}>
              {reasons.map((reason, index) => (
                <div key={index} className={style.ReasonCard}>
                  <div className={style.ReasonIcon}>
                    {reason.icon}
                  </div>
                  <h3>{reason.title}</h3>
                  <p>{reason.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team Preview */}
          <section className={style.TeamPreview}>
            <h2>Meet Our Team</h2>
            <div className={style.TeamGrid}>
              {teamMembers.map((member, index) => (
                <div key={index} className={style.TeamMember}>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Us CTA */}
          <section className={style.ContactUs}>
            <h2>Ready to Find Your Perfect Student Home?</h2>
            <p>Get in touch with our team and let us help you find the ideal accommodation for your university journey.</p>
            <Link to="/contact" className={style.contactButton}>
              Contact Us Today
            </Link>
          </section>
        </>
      )}
    </div>
  );
}