import React, { useState } from 'react';
import './Information.scss';

const Information = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('instructions');

  if (!isOpen) return null;

  return (
    <div className="information-overlay" onClick={onClose}>
      <div className="information" onClick={e => e.stopPropagation()}>
        <div className="information-header">
          <h2>💡 Information</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="information-tabs">
          <button 
            className={`tab ${activeTab === 'instructions' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructions')}
          >
            📖 How to Play
          </button>
          <button 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            👨‍💻 About
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'instructions' && (
            <div className="instructions-content">
              <div className="instruction-section">
                <h3>🎯 Objective</h3>
                <p>Guess the 5-letter word in 6 tries or fewer. Each guess must be a valid 5-letter word.</p>
              </div>

              <div className="instruction-section">
                <h3>🎨 Color Guide</h3>
                <div className="color-examples">
                  <div className="color-example">
                    <div className="letter-example correct">W</div>
                    <div className="color-description">
                      <strong>Green:</strong> Letter is correct and in the right position
                    </div>
                  </div>
                  <div className="color-example">
                    <div className="letter-example misplaced">O</div>
                    <div className="color-description">
                      <strong>Yellow:</strong> Letter is in the word but in the wrong position
                    </div>
                  </div>
                  <div className="color-example">
                    <div className="letter-example incorrect">R</div>
                    <div className="color-description">
                      <strong>Gray:</strong> Letter is not in the word
                    </div>
                  </div>
                </div>
              </div>

              <div className="instruction-section">
                <h3>💡 Tips</h3>
                <ul className="tips-list">
                  <li>Start with words that contain common letters like E, A, R, T, S</li>
                  <li>Use the feedback from each guess to eliminate possibilities</li>
                  <li>Pay attention to letter frequency and position</li>
                  <li>Don't forget that letters can appear multiple times in a word</li>
                </ul>
              </div>

              <div className="instruction-section">
                <h3>🎮 Features</h3>
                <ul className="features-list">
                  <li><strong>Daily Challenge:</strong> New word every day at midnight</li>
                  <li><strong>Statistics:</strong> Track your progress and win streaks</li>
                  <li><strong>Achievements:</strong> Earn badges for milestones</li>
                  <li><strong>Leaderboard:</strong> Compete with other players</li>
                  <li><strong>Dark Mode:</strong> Toggle between light and dark themes</li>
                  <li><strong>PWA:</strong> Install as a mobile app for the best experience</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-content">
              <div className="about-section">
                <h3>👨‍💻 Developer</h3>
                <div className="developer-info">
                  <div className="developer-avatar">
                    <span role="img" aria-label="developer">👨‍💻</span>
                  </div>
                  <div className="developer-details">
                    <h4>Alex Biba</h4>
                    <p>Full-stack developer passionate about creating engaging web experiences</p>
                    <p className="contact-text">Feel free to reach out with feedback, suggestions, or just to say hello!</p>
                    <div className="contact-icons">
                      <a 
                        href="mailto:alexbiba@gmail.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="contact-icon"
                        aria-label="Email Alex Biba"
                        title="Email"
                      >
                        <span role="img" aria-label="email">📧</span>
                      </a>
                      <a 
                        href="https://github.com/alexanderbiba" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="contact-icon"
                        aria-label="GitHub Profile"
                        title="GitHub"
                      >
                        <span role="img" aria-label="github">🐙</span>
                      </a>
                      <a 
                        href="https://alexanderbiba.github.io/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="contact-icon"
                        aria-label="Personal Website"
                        title="Personal Website"
                      >
                        <span role="img" aria-label="website">🌐</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Information; 