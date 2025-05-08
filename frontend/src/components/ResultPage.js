import React from 'react';
import { useLocation } from 'react-router-dom';

const ResultPage = () => {
  const location = useLocation();
  const { predictedProduction } = location.state || {};

  return (
    <div className="container text-center mt-5">
      <h1>Predicted Crop Yield</h1>
      {predictedProduction ? (
        <h3>{predictedProduction} Quintals</h3>
      ) : (
        <p>Sorry, no result found. Please try again.</p>
      )}
    </div>
  );
};

export default ResultPage;
