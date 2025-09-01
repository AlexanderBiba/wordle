import React from 'react';
import './HeaderIcon.scss';

const HeaderIcon = ({ 
  icon, 
  onClick, 
  ariaLabel, 
  title, 
  className = '', 
  isImage = false,
  imageSrc,
  imageAlt,
  onImageError 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button 
      className={`header-icon ${className}`}
      onClick={handleClick}
      aria-label={ariaLabel}
      title={title}
    >
      {isImage ? (
        <img 
          src={imageSrc}
          alt={imageAlt}
          className="header-icon-image"
          onError={onImageError}
        />
      ) : (
        <span className="header-icon-emoji">{icon}</span>
      )}
    </button>
  );
};

export default HeaderIcon;
