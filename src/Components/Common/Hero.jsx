import React from 'react';
import styled from '../../Styles/components/Hero.module.css';
import { Link } from 'react-router-dom';

// Add PropTypes for better development experience
import PropTypes from 'prop-types';

export default function Hero({
  imagePath,
  title,
  description, // Fixed prop name (was Description)
  universityName = "cut", // Default value
  alternativeText ,
  children
}) {
  
  // Validate essential props
  if (!imagePath) {
    console.warn('Hero component: imagePath is required');
    return null;
  }

  return (
    <div className={styled.bodyHero}>
      <div className={styled.secondBody}>
        {/* Information Section */}
        <section className={styled.Info}>
          {title && <p className={styled.title}>{title}</p>}
          {description && <p className={styled.description}>{description}</p>}
          {universityName && <p className={styled.university}>{universityName}</p>}
          {/* Optional children for additional content */}
          <Link to='/Listings'>
            <button className={styled.ctaButton}>Veiw Listings</button>
          </Link>
          {children}
        </section>

        {/* Image Section */}
        <div className={styled.imageContainer}>
          <img 
            src={imagePath} 
            alt={alternativeText}
            className={styled.heroImage}
            loading="lazy" // Better performance
          />
        </div>
      </div>
    </div>
  );
}

// PropTypes for type checking
Hero.propTypes = {
  imagePath: PropTypes.string.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  universityName: PropTypes.string,
  alternativeText: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
};

// Default props
Hero.defaultProps = {
  universityName: "cut",
  alternativeText: "Hero image"
};