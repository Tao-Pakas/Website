import React, { useState } from 'react';
import style from '../../Styles/pages/Homepage.module.css';
import { useQuery } from '@apollo/client/react';
import { Home_Page_Data } from './HomePageL';
import { Link } from 'react-router-dom';
import Hero from '../../Components/Common/Hero';
import pic from '../../Assets/images/AboutUs.jpeg';
import {
  FaHeart, 
  FaRegHeart, 
  FaShoppingCart,
  FaCartPlus,
} from 'react-icons/fa';
import { useApp } from '../../Contexts/AppContext';

// Constants
const API_BASE_URL = 'http://localhost:1337';

export default function HomePage() {
  const { loading, data, error } = useQuery(Home_Page_Data, {
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: false,
  });

  const {
    toggleFavorite,
    addToShortlist,
    removeFromShortlist,
    isFavorite,
    isInShortlist
  } = useApp();

  const [recentAction, setRecentAction] = useState(null);

  if (loading) return <div className={style.loading}>Loading homepage...</div>;
  if (error) return <div className={style.error}>Error: {error.message}</div>;

  // Helper function to build image URL
  const getImageUrl = (url) => (url ? `${API_BASE_URL}${url}` : '');

  // Handler functions
  const handleFavorite = (propertyId, propertyName) => {
    toggleFavorite({ id: propertyId, name: propertyName });
    setRecentAction({
      type: 'favorite',
      propertyId,
      propertyName,
      isAdded: !isFavorite(propertyId)
    });
    setTimeout(() => setRecentAction(null), 3000);
  };

  const handleShortlist = (property, action) => {
    if (action === 'add') {
      addToShortlist(property);
      setRecentAction({
        type: 'shortlist',
        propertyId: property.id,
        propertyName: property.Name,
        isAdded: true
      });
    } else {
      removeFromShortlist(property.id);
      setRecentAction({
        type: 'shortlist',
        propertyId: property.id,
        propertyName: property.Name,
        isAdded: false
      });
    }
    setTimeout(() => setRecentAction(null), 3000);
  };

  return (
    <div className={style.Body}>
      {/* Action Feedback Toast */}
      {recentAction && (
        <div className={style.toast}>
          {recentAction.isAdded ? '✓ Added to' : '✗ Removed from'} {' '}
          {recentAction.type === 'favorite' && 'Favorites'}
          {recentAction.type === 'shortlist' && 'Shortlist'}
          : {recentAction.propertyName}
        </div>
      )}
      
      {data?.homepage?.HomePage?.map((block, index) => {
        const key = block.id || `block-${index}`;

        // ================= Hero Section =================
        if (block.__typename === 'ComponentCommonHero') {
          return (
            <Hero
              key={key}
              imagePath={getImageUrl(block?.heroImage?.url)}
              title={block?.topDescription}
              description={block?.bottomDescription}
              universityName="Chinhoyi University of Technology"
              alternativeText={block?.heroImage?.alternativeText}
            />
          );
        }

        // ================= Why Choose Us =================
        if (block.__typename === 'ComponentBlocksWhyChooseUs') {
          return (
            <section className={style.WhyChooseUsSection} key={key}>
              <div className={style.WhyChooseUsHeader}>
                <h3 className={style.WhyChooseUsSubtitle}>Why Choose Our Accommodations?</h3>
                <h2 className={style.WhyChooseUsTitle}>Expert Student Housing Solutions</h2>
              </div>
              <div className={style.ReasonsGrid}>
                {block.Card?.map((card) => (
                  <div
                    className={style.ReasonCard}
                    key={`${key}-card-${card.id}`}
                  >
                    <div className={style.ReasonIcon}>
                      <img
                        src={getImageUrl(card.Icon?.url)}
                        alt={card.Icon?.alternativeText || 'Why Choose Us'}
                        className={style.WhyChooseUsIcon}
                        loading="lazy"
                      />
                    </div>
                    <h3 className={style.ReasonTitle}>
                      {card.description.split('.')[0]} {/* Use first sentence as title */}
                    </h3>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // ================= Discover Section =================
        if (block.__typename === 'ComponentBlocksDiscoverSection') {
          return (
            <section className={style.Discover} key={key}>
              <div className={style.DiscoverContainerText}>
                <h1 className={style.DiscoverHeading}>{block.heading}</h1>
              </div>
              <div className={style.DiscoverContainerParagraph}>
                <p>{block.Paragraph}</p>
              </div>
            </section>
          );
        }

        // ================= Featured Property =================
        if (block.__typename === 'ComponentListingsFeaturedProperty') {
          return (
            <React.Fragment key={key}>
              {/* Inject About Us section BEFORE Featured */}
              {data?.about && (
                <div className={style.AboutContainer}>
                  <h3>About VarsityCribs</h3>
                  <h2>Elevating Student Living Experiences</h2>
                  <section className={style.AboutSubContainer}>
                    <div className={style.AboutImageContainer}>
                      <Link to='/About'>
                        <img src={pic} alt="About VarsityCribs" className={style.Image} />
                      </Link>
                    </div>
                    <div className={style.AboutUsInfoContainer}>
                      <p>{data.about.CompanyOverView}</p>
                      <button className={style.ctaButton}>Learn More</button>
                    </div>
                  </section>
                </div>
              )}
            </React.Fragment>
          );
        }

        // ================= Popular Properties =================
        if (block.__typename === 'ComponentBlocksPopularProperties') {
          return (
            <div className={style.PopularProperty} key={key}>
              <h3>Student Favorites</h3>
              <div className={style.ViewAll}>
                <h2>Most Booked Student Residences</h2>
                <Link to='/Listings' className={style.link}>
                  <h3>View All</h3>
                </Link>
              </div>
              <section className={style.PopularProperties}>
                {block.Card?.map((card) => (
                  <div className={style.PropertyContainer} key={card.id}>
                    <div className={style.ImageContainer}>
                      {card?.Media?.CoverImage?.url && (
                        <Link to="/Single" className={style.ImageContainer}>
                          <img
                            src={getImageUrl(card.Media.CoverImage.url)}
                            alt={card.Media.CoverImage.alternativeText || 'Accommodation'}
                            className={style.Image}
                            loading="lazy"
                          />
                        </Link>
                      )}
                      <div className={style.iconsContainer}>

                        {/* Favorite Icon */}
                        <button 
                          className={`${style.iconButton} ${isFavorite(card.id) ? style.active : ''}`}
                          onClick={() => handleFavorite(card.id, card.Name)}
                          aria-label={isFavorite(card.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {isFavorite(card.id) ? <FaHeart color="red" /> : <FaRegHeart />}
                        </button>

                        {/* Shortlist Icon */}
                        <button 
                          className={`${style.iconButton} ${isInShortlist(card.id) ? style.active : ''}`}
                          onClick={() => handleShortlist(
                            card, 
                            isInShortlist(card.id) ? 'remove' : 'add'
                          )}
                          aria-label={isInShortlist(card.id) ? 'Remove from shortlist' : 'Add to shortlist'}
                        >
                          {isInShortlist(card.id) ? <FaShoppingCart color="green" /> : <FaCartPlus />}
                        </button>
                      </div>
                    </div>
                    <div className={style.InfoContainer}>
                      <div className={style.InfoRow}>
                        <span className={style.Label}>Address</span>
                        <span className={style.Value}>{card?.Location?.Address}</span>
                      </div>
                      <div className={style.InfoRow}>
                        <span className={style.Label}>Price</span>
                        <span className={style.Value}>{card?.Details?.price}</span>
                      </div>
                      <div className={style.InfoRow}>
                        <span className={style.Label}>Available</span>
                        <span className={style.Value}>
                          {card?.Details?.isFull ? 'No' : 'Yes'}
                        </span>
                      </div>
                      <div className={style.InfoRow}>
                        <span className={style.Label}>Gender</span>
                        <span className={style.Value}>{card?.Details?.Type}</span>
                      </div>
                      <Link to="/Single">
                        <button className={style.submit}>
                          View Accommodation
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          );
        }

        return null; // Ignore unknown blocks
      })}
    </div>
  );
}