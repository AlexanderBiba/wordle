import React from 'react';
import './Card.scss';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'normal',
  shadow = 'xl',
  border = true,
  background = 'surface',
  maxWidth = '600px',
  marginBottom = '2rem',
  ...props 
}) => {
  const cardClasses = [
    'card',
    variant.split(' ').map(v => `card--${v}`).join(' '),
    `card--padding-${padding}`,
    `card--shadow-${shadow}`,
    `card--background-${background}`,
    border ? 'card--border' : 'card--no-border',
    className
  ].filter(Boolean).join(' ');

  const cardStyle = {
    maxWidth,
    marginBottom
  };

  return (
    <div className={cardClasses} style={cardStyle} {...props}>
      {children}
    </div>
  );
};

export default Card;
