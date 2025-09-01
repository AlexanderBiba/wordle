import React, { useState, useRef, useEffect } from 'react';
import './PopupModal.scss';

const PopupModal = ({ 
  isOpen, 
  onClose, 
  title, 
  tabs = [], 
  activeTab, 
  onTabChange,
  children,
  footer,
  maxWidth = '800px',
  className = ''
}) => {
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const tabsRef = useRef(null);

  const checkScrollShadows = () => {
    if (!tabsRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    setShowLeftShadow(scrollLeft > 0);
    setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollShadows();
    const tabsElement = tabsRef.current;
    if (tabsElement) {
      tabsElement.addEventListener('scroll', checkScrollShadows);
      window.addEventListener('resize', checkScrollShadows);
      
      return () => {
        tabsElement.removeEventListener('scroll', checkScrollShadows);
        window.removeEventListener('resize', checkScrollShadows);
      };
    }
  }, [tabs]);

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div 
        className={`popup-modal ${className}`} 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth }}
      >
        <div className="popup-header">
          <div className="popup-title">
            {typeof title === 'string' ? <h2>{title}</h2> : title}
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {tabs.length > 0 && (
          <div className="popup-tabs-container">
            {showLeftShadow && <div className="scroll-shadow scroll-shadow-left" />}
            <div className="popup-tabs" ref={tabsRef}>
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => onTabChange(tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
            {showRightShadow && <div className="scroll-shadow scroll-shadow-right" />}
          </div>
        )}

        <div className="popup-content">
          {children}
        </div>

        {footer && (
          <div className="popup-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupModal; 