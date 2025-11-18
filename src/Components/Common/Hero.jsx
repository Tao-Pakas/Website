import React from 'react';
import styled from '../../Styles/components/Hero.module.css';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function Hero({
  imagePath,
  title,
  description,
  universityName = "Chinhoyi University of Technology",
  alternativeText = "Hero image",
  children,
  showBadge = true,
  badgeText = "Featured"
}) {
  
  // Handle missing imagePath with a fallback UI
  if (!imagePath) {
    console.warn('Hero component: imagePath is required');
    return (
      <div className={styled.bodyHero}>
        <div className={styled.secondBody}>
          <section className={styled.Info}>
            {showBadge && <span className={styled.badge}>{badgeText}</span>}
            {title && (
              <h1 className={styled.title}>
                {title.split(' ').map((word, index) => (
                  <span key={index} className={styled.titleHighlight}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
            )}
            {description && <p className={styled.description}>{description}</p>}
            {universityName && <p className={styled.university}>{universityName}</p>}
            
            <Link to='/Listings' className={styled.ctaButton}>
              View Listings
            </Link>
            
            <div className={styled.stats}>
              <div className={styled.statItem}>
                <div className={styled.statValue}>50+</div>
                <div className={styled.statLabel}>Projects</div>
              </div>
              <div className={styled.statItem}>
                <div className={styled.statValue}>98%</div>
                <div className={styled.statLabel}>Satisfaction</div>
              </div>
              <div className={styled.statItem}>
                <div className={styled.statValue}>5+</div>
                <div className={styled.statLabel}>Years Exp</div>
              </div>
            </div>
            
            {children}
          </section>

          <div className={styled.imageContainer}>
            <div className={styled.imagePlaceholder}>
              <p>Featured Accommodation Image</p>
              <span>Discover the best student housing options</span>
            </div>
            <div className={`${styled.floatingShape} ${styled.shape1}`}></div>
            <div className={`${styled.floatingShape} ${styled.shape2}`}></div>
            <div className={`${styled.floatingShape} ${styled.shape3}`}></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle image error
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const fallback = e.target.nextSibling;
    if (fallback) {
      fallback.style.display = 'block';
    }
  };

  return (
    <div className={styled.bodyHero}>
      <div className={styled.secondBody}>
        {/* Information Section */}
        <section className={styled.Info}>
          {showBadge && <span className={styled.badge}>{badgeText}</span>}
          {title && (
            <h1 className={styled.title}>
              {title.split(' ').map((word, index) => (
                <span key={index} className={styled.titleHighlight}>
                  {word}{' '}
                </span>
              ))}
            </h1>
          )}
          {description && <p className={styled.description}>{description}</p>}
          {universityName && <p className={styled.university}>{universityName}</p>}
          
          <Link to='/Listings' className={styled.ctaButton}>
            View Listings
          </Link>
          
          {/* Optional stats section */}
          <div className={styled.stats}>
            <div className={styled.statItem}>
              <div className={styled.statValue}>50+</div>
              <div className={styled.statLabel}>Projects</div>
            </div>
            <div className={styled.statItem}>
              <div className={styled.statValue}>98%</div>
              <div className={styled.statLabel}>Satisfaction</div>
            </div>
            <div className={styled.statItem}>
              <div className={styled.statValue}>5+</div>
              <div className={styled.statLabel}>Years Exp</div>
            </div>
          </div>
          
          {children}
        </section>

        {/* Image Section */}
        <div className={styled.imageContainer}>
          <div className={styled.imageWrapper}>
            <img 
              src={imagePath} 
              alt={alternativeText}
              className={styled.heroImage}
              loading="lazy"
              onError={handleImageError}
            />
            <div className={styled.imageFallback} style={{display: 'none'}}>
              <p>Image not available</p>
            </div>
          </div>
          <div className={`${styled.floatingShape} ${styled.shape1}`}></div>
          <div className={`${styled.floatingShape} ${styled.shape2}`}></div>
          <div className={`${styled.floatingShape} ${styled.shape3}`}></div>
        </div>
      </div>
    </div>
  );
}

Hero.propTypes = {
  imagePath: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  universityName: PropTypes.string,
  alternativeText: PropTypes.string,
  children: PropTypes.node,
  showBadge: PropTypes.bool,
  badgeText: PropTypes.string
};