import React from 'react';
import style from '../../Styles/components/Footer.module.css';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Footer_Data } from '../../Hooks/FooterData';

export default function Footer() {
  const { loading, data, error } = useQuery(Footer_Data, {
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: false,
  });

  if (loading && !data) return <div className="loading">Loading footer...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const footer = data?.footer; // single-type
  // OR: const footers = data?.footers; // collection type

  return (
    <div className={style.bodyFooter}>
      <div className={style.upperFooter}>
        <section className={style.Container}>
          <h1>{">>> Quick Links <<<"}</h1>
          <div className={style.LinksContainer}>
            <Link to="/" className={style.LinksContainerLink}>HomePage</Link>
            <Link to="/Listings" className={style.LinksContainerLink}>Property Listings</Link>
            <Link to="/About" className={style.LinksContainerLink}>About Us</Link>
            <Link to="/Contact" className={style.LinksContainerLink}>Contact Us</Link>
          </div>
        </section>
        
        <section className={style.Container}>
          <h1>{">>> Contact Info <<<"}</h1>
          {footer && (
            <div className={style.LinksContainer} key={footer.documentId}>
              <p>{footer.address}</p>
              <p>{footer.city}</p>
              <p>{footer.phone}</p>
              <p>{footer.email}</p>
            </div>
          )}
        </section>

        <section className={style.Container}>
          <h1>{">>> Contact Us <<<"}</h1>
          <div className={style.LinksContainer}>
            <div className={style.MessageBox}>
              <input type="text" placeholder="message" />
              <button>send</button>
            </div>
            <div className={style.socialLinks}></div>
          </div>
        </section>
      </div>
      <div className={style.lowerFooter}>
        <p>All rights reserved @ 2025 | Taonashe Pakachena</p>
      </div>
    </div>
  );
}
