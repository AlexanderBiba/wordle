import React, { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../constants';
import './Leaderboard.scss';

const Leaderboard = ({ isOpen, onClose }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('winRate');
  const [error, setError] = useState(null);
  const [userRank, setUserRank] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use Firebase function for leaderboard data
      const response = await fetch(`${API_ENDPOINTS.LEADERBOARD}?action=getLeaderboard&metric=${activeTab}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data = await response.json();
      const leaderboard = data.leaderboard || [];
      setLeaderboardData(leaderboard);
      
      // Calculate user rank if user is logged in
      if (window.user && window.user.uid) {
        const userIndex = leaderboard.findIndex(user => user.uid === window.user.uid);
        setUserRank(userIndex >= 0 ? userIndex + 1 : null);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data. Showing demo data instead.');
      // For demo purposes, show mock data
      const mockData = getMockLeaderboardData();
      setLeaderboardData(mockData);
      
      // For demo, show a random rank
      setUserRank(Math.floor(Math.random() * 10) + 1);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, fetchLeaderboard]);



  const getMockLeaderboardData = () => {
    // Mock data for demonstration
    return [
      {
        uid: '1',
        displayName: 'Sarah J.',
        photoURL: 'https://ui-avatars.com/api/?name=Sarah+J&background=10b981&color=fff&size=120',
        stats: {
          gamesPlayed: 150,
          gamesWon: 142,
          currentStreak: 23,
          maxStreak: 45,
          winRate: 94.7,
          averageGuesses: 3.8
        }
      },
      {
        uid: '2',
        displayName: 'Michael C.',
        photoURL: 'https://ui-avatars.com/api/?name=Michael+C&background=3b82f6&color=fff&size=120',
        stats: {
          gamesPlayed: 89,
          gamesWon: 82,
          currentStreak: 15,
          maxStreak: 28,
          winRate: 92.1,
          averageGuesses: 4.1
        }
      },
      {
        uid: '3',
        displayName: 'Emma R.',
        photoURL: 'https://ui-avatars.com/api/?name=Emma+R&background=f59e0b&color=fff&size=120',
        stats: {
          gamesPlayed: 67,
          gamesWon: 58,
          currentStreak: 8,
          maxStreak: 19,
          winRate: 86.6,
          averageGuesses: 4.3
        }
      },
      {
        uid: '4',
        displayName: 'David K.',
        photoURL: 'https://ui-avatars.com/api/?name=David+K&background=8b5cf6&color=fff&size=120',
        stats: {
          gamesPlayed: 45,
          gamesWon: 38,
          currentStreak: 5,
          maxStreak: 12,
          winRate: 84.4,
          averageGuesses: 4.5
        }
      },
      {
        uid: '5',
        displayName: 'Lisa T.',
        photoURL: 'https://ui-avatars.com/api/?name=Lisa+T&background=ef4444&color=fff&size=120',
        stats: {
          gamesPlayed: 23,
          gamesWon: 18,
          currentStreak: 3,
          maxStreak: 7,
          winRate: 78.3,
          averageGuesses: 4.8
        }
      }
    ];
  };

  const getMetricLabel = (metric) => {
    const labels = {
      winRate: 'Win Rate',
      maxStreak: 'Best Streak',
      currentStreak: 'Current Streak',
      gamesPlayed: 'Games Played',
      averageGuesses: 'Avg Guesses'
    };
    return labels[metric] || metric;
  };

  const getMetricValue = (user, metric) => {
    switch (metric) {
      case 'winRate':
        return `${user.stats.winRate}%`;
      case 'maxStreak':
        return user.stats.maxStreak;
      case 'currentStreak':
        return user.stats.currentStreak;
      case 'gamesPlayed':
        return user.stats.gamesPlayed;
      case 'averageGuesses':
        return user.stats.averageGuesses.toFixed(1);
      default:
        return user.stats[metric] || 0;
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (!isOpen) return null;

  return (
    <div className="leaderboard-overlay" onClick={onClose}>
      <div className="leaderboard" onClick={e => e.stopPropagation()}>
        <div className="leaderboard-header">
          <div className="header-left">
            <h2>🏆 Leaderboard</h2>
            {userRank && (
              <div className="user-rank">
                <span className="rank-label">Your Rank:</span>
                <span className="rank-number">#{userRank}</span>
              </div>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="leaderboard-tabs">
          <button 
            className={`tab ${activeTab === 'winRate' ? 'active' : ''}`}
            onClick={() => setActiveTab('winRate')}
          >
            🎯 Win Rate
          </button>
          <button 
            className={`tab ${activeTab === 'maxStreak' ? 'active' : ''}`}
            onClick={() => setActiveTab('maxStreak')}
          >
            🔥 Best Streak
          </button>
          <button 
            className={`tab ${activeTab === 'currentStreak' ? 'active' : ''}`}
            onClick={() => setActiveTab('currentStreak')}
          >
            ⚡ Current Streak
          </button>
          <button 
            className={`tab ${activeTab === 'gamesPlayed' ? 'active' : ''}`}
            onClick={() => setActiveTab('gamesPlayed')}
          >
            🎮 Games Played
          </button>
          <button 
            className={`tab ${activeTab === 'averageGuesses' ? 'active' : ''}`}
            onClick={() => setActiveTab('averageGuesses')}
          >
            🧮 Avg Guesses
          </button>
        </div>

        <div className="leaderboard-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchLeaderboard} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : (
            <div className="leaderboard-list">
              {leaderboardData.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h3>No Data Yet</h3>
                  <p>Be the first to play and appear on the leaderboard!</p>
                </div>
              ) : (
                leaderboardData
                  .sort((a, b) => {
                    // Sort based on the active metric
                    let aValue, bValue;
                    
                    switch (activeTab) {
                      case 'winRate':
                        aValue = a.stats.winRate;
                        bValue = b.stats.winRate;
                        break;
                      case 'maxStreak':
                      case 'currentStreak':
                      case 'gamesPlayed':
                        aValue = a.stats[activeTab];
                        bValue = b.stats[activeTab];
                        break;
                      case 'averageGuesses':
                        // Lower is better for average guesses
                        aValue = -a.stats.averageGuesses;
                        bValue = -b.stats.averageGuesses;
                        break;
                      default:
                        aValue = a.stats[activeTab] || 0;
                        bValue = b.stats[activeTab] || 0;
                    }
                    
                    return bValue - aValue;
                  })
                  .map((user, index) => (
                    <div key={user.uid} className="leaderboard-item">
                      <div className="rank-section">
                        <span className="rank-icon">{getRankIcon(index + 1)}</span>
                      </div>
                      
                      <div className="user-section">
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName}
                          className="user-avatar"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=2563eb&color=fff&size=120`;
                          }}
                        />
                        <div className="user-info">
                          <h3 className="user-name">{user.displayName}</h3>
                          <div className="user-stats">
                            <span className="stat">
                              {user.stats.gamesPlayed} games
                            </span>
                            <span className="stat">
                              {user.stats.winRate}% win rate
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="metric-section">
                        <div className="metric-value">
                          {getMetricValue(user, activeTab)}
                        </div>
                        <div className="metric-label">
                          {getMetricLabel(activeTab)}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>

        <div className="leaderboard-footer">
          <p className="leaderboard-note">
            Rankings are updated in real-time. Sign in to compete and track your progress!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 