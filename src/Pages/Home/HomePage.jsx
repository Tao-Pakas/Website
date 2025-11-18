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
  FaThumbsUp,
  FaRegThumbsUp
} from 'react-icons/fa';
import { useApp } from '../../Contexts/AppContext';
import { useAuth } from '../../Contexts/AuthContext';

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
    isInShortlist,
    isPropertyLiked,
    togglePropertyLike
  } = useApp();

  const { user, getUserRole } = useAuth();

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

  // NEW: Like handler
  const handleLike = async (propertyId, propertyName) => {
    if (!user) return;
    
    try {
      const result = await togglePropertyLike(propertyId);
      
      if (result.success) {
        const wasLiked = isPropertyLiked(propertyId);
        setRecentAction({
          type: 'like',
          propertyId,
          propertyName,
          isAdded: !wasLiked
        });
        setTimeout(() => setRecentAction(null), 3000);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  return (
    <div className={style.Body}>
      {/* Action Feedback Toast */}
      {recentAction && (
        <div className={style.toast}>
          {recentAction.isAdded ? '✓ Added to' : '✗ Removed from'} {' '}
          {recentAction.type === 'like' && 'Likes'}
          {recentAction.type === 'favorite' && 'Favorites'}
          {recentAction.type === 'shortlist' && 'Shortlist'}
          : {recentAction.propertyName}
        </div>
      )}
      
      {data?.homepage?.HomePage?.map((block, index) => {
        // FIX: Create truly unique keys by combining type, id, and index
        const key = `${block.__typename}-${block.id || 'no-id'}-${index}`;

        // ================= Hero Section =================
        if (block.__typename === 'ComponentCommonHero') {
          // FIX: Ensure imagePath is never undefined
          const heroImageUrl = block?.heroImage?.url;
          const imagePath = heroImageUrl ? getImageUrl(heroImageUrl) : '';
          
          return (
            <Hero
              key={key}
              imagePath={imagePath}
              title={block?.topDescription}
              description={block?.bottomDescription}
              universityName="Chinhoyi University of Technology"
              alternativeText={block?.heroImage?.alternativeText || 'Hero image'}
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
                {block.Card?.map((card, cardIndex) => (
                  <div
                    className={style.ReasonCard}
                    // FIX: Unique key for nested items
                    key={`${key}-card-${card.id || cardIndex}`}
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
                {block.Card?.map((card, cardIndex) => {
                  const isLiked = isPropertyLiked(card.id);
                  
                  return (
                    <div className={style.PropertyContainer} 
                      // FIX: Unique key for property cards
                      key={`${key}-property-${card.id || cardIndex}`}
                    >
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
                          {/* NEW: Like button */}
                          <button 
                            className={`${style.iconButton} ${isLiked ? style.liked : ''} ${!user ? style.disabled : ''}`}
                            onClick={() => handleLike(card.id, card.Name)}
                            aria-label={!user ? "Log in to like" : isLiked ? "Unlike property" : "Like property"}
                            title={!user ? "Log in to like" : isLiked ? "Unlike" : "Like"}
                          >
                            {isLiked ? <FaThumbsUp color="#3498db" /> : <FaRegThumbsUp />}
                          </button>

                          {/* Favorite Icon */}
                          <button 
                            className={`${style.iconButton} ${isFavorite(card.id) ? style.active : ''} ${!user ? style.disabled : ''}`}
                            onClick={() => handleFavorite(card.id, card.Name)}
                            aria-label={!user ? "Log in to add to favorites" : isFavorite(card.id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            {isFavorite(card.id) ? <FaHeart color="red" /> : <FaRegHeart />}
                          </button>

                          {/* Shortlist Icon */}
                          <button 
                            className={`${style.iconButton} ${isInShortlist(card.id) ? style.active : ''} ${!user ? style.disabled : ''}`}
                            onClick={() => handleShortlist(
                              card, 
                              isInShortlist(card.id) ? 'remove' : 'add'
                            )}
                            aria-label={!user ? "Log in to add to shortlist" : isInShortlist(card.id) ? "Remove from shortlist" : "Add to shortlist"}
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
                  );
                })}
              </section>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}