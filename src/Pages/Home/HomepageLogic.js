import React from 'react';
import { useQuery } from "@apollo/client/react";
import { GET_ACCOMMODATIONS_DETAILS } from './Accommodations';
import style from '../../Styles/components/Footer.module.css';

export default function HomepageLogic() {
  const { loading, error, data } = useQuery(GET_ACCOMMODATIONS_DETAILS);

  if (loading) return <div className="loading">Loading accommodations...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  console.log(data?.accommodations);

  return data?.accommodations?.map(({ documentId, details, location }) => {
    return (
      <div key={documentId}>
        <h2 className={style.h2222}>
          bathrooms: {details?.Bathrooms}
        </h2>
        <h2>
          bedrooms: {details?.Bedrooms}
        </h2>
        <h2>
          isFull: {details?.isFull ? "Yes" : "No"}
        </h2>
        <h2>
          Category: {details?.Type}
        </h2>

        <h2>
          wifi: {details?.Facilities?.wifi ? "Available" : "Not Available"}
        </h2>
        <h2>
          solar: {details?.Facilities?.solar ? "Available" : "Not Available"}
        </h2>
        <h2>
          gas: {details?.Facilities?.gas ? "Available" : "Not Available"}
        </h2>
        <h2>
          security: {details?.Facilities?.security ? "Available" : "Not Available"}
        </h2>
        <h2>
          kitchen: {details?.Facilities?.kitchen ? "Available" : "Not Available"}
        </h2>
        <h2>
          SwimmingPool: {details?.Facilities?.SwimmingPool ? "Available" : "Not Available"}
        </h2>

        <h2>
          Address: {location?.Address}
        </h2>
        <h2>
          City: {location?.City}
        </h2>
        <h2>
          longitude: {location?.longitude}
        </h2>
        <h2>
          latitude: {location?.latitude}
        </h2>
      </div>
    );
  });
}