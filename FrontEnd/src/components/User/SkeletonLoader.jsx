import React from 'react';
import '../UserCss/SkeletonLoader.css';

const SkeletonLoader = ({ type = 'restaurant' }) => {
  if (type === 'restaurant') {
    return (
      <div className="skeleton-card">
        <div className="skeleton-image shim"></div>
        <div className="skeleton-info">
          <div className="skeleton-title shim"></div>
          <div className="skeleton-meta shim"></div>
          <div className="skeleton-tags shim"></div>
        </div>
      </div>
    );
  }

  if (type === 'menu') {
    return (
      <div className="skeleton-menu-item">
        <div className="skeleton-menu-info">
          <div className="skeleton-menu-title shim"></div>
          <div className="skeleton-menu-desc shim"></div>
          <div className="skeleton-menu-price shim"></div>
        </div>
        <div className="skeleton-menu-img shim"></div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
