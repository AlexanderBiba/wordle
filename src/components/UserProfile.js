import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ACHIEVEMENTS, getAchievementProgress } from '../achievements';
import './UserProfile.scss';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, userStats, signOutUser, refreshUserStats } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  
  if (!isOpen || !user) return null;

  // Handle case where userStats might be null (e.g., user deleted from Firestore)
  // This should never happen now due to useAuth fixes, but adding extra safety
  if (!userStats) {
    return (
      <div className="user-profile-overlay" onClick={onClose}>
        <div className="user-profile" onClick={e => e.stopPropagation()}>
          <div className="profile-header">
            <h2>User Profile</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="profile-content">
            <p>User data not found. Please sign in again.</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = getAchievementProgress(userStats);
  const earnedAchievements = userStats?.achievements || [];
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      milestone: '🎯',
      streak: '🔥',
      performance: '⚡',
      special: '⭐'
    };
    return icons[category] || '🏆';
  };

  const getCategoryName = (category) => {
    const names = {
      milestone: 'Milestones',
      streak: 'Streaks',
      performance: 'Performance',
      special: 'Special'
    };
    return names[category] || 'Other';
  };

  const groupedAchievements = earnedAchievements.reduce((acc, achievement) => {
    const category = achievement.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {});

  return (
    <div className="user-profile-overlay" onClick={onClose}>
      <div className="user-profile" onClick={e => e.stopPropagation()}>
        <div className="profile-header">
          <div className="user-info">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=2563eb&color=fff&size=120`}
              alt={user.displayName}
              className="user-avatar"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=2563eb&color=fff&size=120`;
              }}
            />
            <div className="user-details">
              <h2>{user.displayName}</h2>
              <p>{user.email}</p>
              <p className="member-since">
                Member since {formatDate(user.metadata?.creationTime)}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="refresh-btn" 
              onClick={refreshUserStats}
              title="Refresh stats"
              aria-label="Refresh user statistics"
            >
              🔄
            </button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Stats
          </button>
          <button 
            className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 Achievements ({earnedAchievements.length}/{totalAchievements})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'stats' && (
            <div className="stats-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{userStats?.gamesPlayed || 0}</div>
                  <div className="stat-label">Games Played</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{userStats?.gamesWon || 0}</div>
                  <div className="stat-label">Games Won</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {userStats?.gamesPlayed > 0 
                      ? Math.round(((userStats?.gamesWon || 0) / userStats.gamesPlayed) * 100)
                      : 0}%
                  </div>
                  <div className="stat-label">Win Rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{userStats?.currentStreak || 0}</div>
                  <div className="stat-label">Current Streak</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{userStats?.maxStreak || 0}</div>
                  <div className="stat-label">Best Streak</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {userStats?.gamesPlayed > 0 
                      ? ((userStats?.totalGuesses || 0) / userStats.gamesPlayed).toFixed(1)
                      : 0}
                  </div>
                  <div className="stat-label">Avg Guesses</div>
                </div>
              </div>

              <div className="progress-section">
                <h3>Progress to Next Milestones</h3>
                
                {progress.streak.next && (
                  <div className="progress-item">
                    <div className="progress-header">
                      <span>🔥 {progress.streak.current} Day Streak</span>
                      <span>{progress.streak.next} Days</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress.streak.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {progress.games.next && (
                  <div className="progress-item">
                    <div className="progress-header">
                      <span>🎮 {progress.games.current} Games</span>
                      <span>{progress.games.next} Games</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress.games.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="achievements-content">
              {Object.keys(groupedAchievements).length > 0 ? (
                Object.entries(groupedAchievements).map(([category, achievements]) => (
                  <div key={category} className="achievement-category">
                    <h3>
                      {getCategoryIcon(category)} {getCategoryName(category)}
                    </h3>
                    <div className="achievements-grid">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="achievement-badge earned">
                          <div className="achievement-icon">{achievement.icon}</div>
                          <div className="achievement-info">
                            <div className="achievement-title">{achievement.title}</div>
                            <div className="achievement-description">
                              {achievement.description}
                            </div>
                            <div className="achievement-date">
                              Earned {formatDate(achievement.earnedAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-achievements">
                  <div className="no-achievements-icon">🏆</div>
                  <h3>No Achievements Yet</h3>
                  <p>Start playing to earn your first badge!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="profile-footer">
          <button className="sign-out-btn" onClick={signOutUser}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 