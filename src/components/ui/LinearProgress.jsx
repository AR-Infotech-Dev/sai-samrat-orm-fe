import React from 'react';

const LinearProgress = ({ isLoading = false }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-container">
      <div className="loading-bar"></div>
    </div>
  );
};

export default LinearProgress;