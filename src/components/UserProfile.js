import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ACHIEVEMENTS, getAchievementProgress } from '../achievements';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_STATS } from '../constants';
import PopupModal from './PopupModal';
import './UserProfile.scss';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, signOutUser } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUserStats(userSnap.data().stats);
      } else {
        // Set default stats if user document doesn't exist
        setUserStats(DEFAULT_STATS);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Set default stats on error
      setUserStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch fresh stats whenever profile opens
  useEffect(() => {
    if (isOpen && user) {
      fetchUserStats();
    }
  }, [isOpen, user, fetchUserStats]);
  
  if (!isOpen || !user) return null;

  const tabs = [
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'achievements', label: `Achievements (${userStats?.achievements?.length || 0}/${Object.keys(ACHIEVEMENTS).length})`, icon: '🏆' }
  ];

  const formatDate = (date) => {
    if (!date) return 'Unknown Date';
    
    try {
      // Handle Firestore Timestamp objects
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString();
      }
      
      // Handle regular Date objects or date strings
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Unknown Date';
      }
      
      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown Date';
    }
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

  const groupedAchievements = (userStats?.achievements || []).reduce((acc, achievement) => {
    const category = achievement.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {});

  const renderStatsContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your stats...</p>
        </div>
      );
    }

    if (!userStats) {
      return <p>User data not found. Please sign in again.</p>;
    }

    const progress = getAchievementProgress(userStats);

    return (
      <div className="stats-content">
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
            <h3>{user.displayName}</h3>
            <p>{user.email}</p>
            <p className="member-since">
              Member since {formatDate(user.metadata?.creationTime)}
            </p>
          </div>
        </div>

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
    );
  };

  const renderAchievementsContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your achievements...</p>
        </div>
      );
    }

    if (!userStats) {
      return <p>User data not found. Please sign in again.</p>;
    }

    return (
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
    );
  };

  const footer = (
    <button className="sign-out-btn" onClick={signOutUser}>
      Sign Out
    </button>
  );

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      footer={footer}
      maxWidth="800px"
    >
      {activeTab === 'stats' && renderStatsContent()}
      {activeTab === 'achievements' && renderAchievementsContent()}
    </PopupModal>
  );
};

export default UserProfile; 