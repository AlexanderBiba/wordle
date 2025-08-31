import "./App.scss";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./hooks/useAuth";
import { useGameState } from "./hooks/useGameState";
import { useKeyboard } from "./hooks/useKeyboard";
import { useGameStats } from "./hooks/useGameStats";
import { useStatus } from "./hooks/useStatus";
import { useKeyboardTheme } from "./hooks/useKeyboardTheme";
import { useWordRendering } from "./hooks/useWordRendering";
import UserProfile from "./components/UserProfile";
import Leaderboard from "./components/Leaderboard";
import { WORD_LENGTH, NUM_ATTEMPTS, API_ENDPOINTS, KEYBOARD_LAYOUT, KEYBOARD_DISPLAY } from "./constants";
import { calculateWinPercentage, getFallbackAvatar } from "./utils";



export default function App() {
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  
  const { user, userStats, signInWithGoogle, updateUserStats, loading: authLoading } = useAuth();
  
  // Use Firebase-based game state management
  const {
    state,
    stats,
    darkMode,
    loading: gameLoading,
    updateGameState,
    updateStats,
    toggleDarkMode,
    saveGameStateToFirebase
  } = useGameState(user);

  // Use game stats hook
  const { handleGameEnd } = useGameStats(stats, updateStats, user, userStats, updateUserStats);

  // Use custom keyboard hook
  const { onKeyDown } = useKeyboard(
    state, 
    gameLoading, 
    updateGameState, 
    saveGameStateToFirebase, 
    handleGameEnd
  );

  // Use status hook
  const { statusMessage, statusClass } = useStatus(state, gameLoading);

  // Use keyboard theme hook
  const { buttonTheme } = useKeyboardTheme(state);

  // Use word rendering hook
  const { renderedWords } = useWordRendering(state);

  // Combined loading state for app initialization
  const isAppLoading = authLoading || gameLoading || minLoadingTime;

  // Minimum loading time to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 1000); // Show loading for at least 1 second

    return () => clearTimeout(timer);
  }, []);

  // Apply dark mode to document body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);



  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };



  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);



  const winPercentage = calculateWinPercentage(stats.gamesPlayed, stats.gamesWon);

  // Show app loading screen while initializing
  if (isAppLoading) {
    return (
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <div className="app-loading">
          <div className="loading-content">
            <div className="loading-logo">
              <span role="img" aria-label="puzzle">🧩</span>
              <h1>Wordle</h1>
            </div>
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your game...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header-container">
        <h1 className="header">
          <span role="img" aria-label="puzzle">🧩</span> Wordle
        </h1>
        <div className="header-actions">
          <button 
            className="leaderboard-btn"
            onClick={() => setShowLeaderboard(true)}
            aria-label="Open leaderboard"
            title="View Leaderboard"
          >
            <span className="leaderboard-icon">🏆</span>
          </button>
          {user && (
            <button 
              className="profile-btn"
              onClick={() => setShowProfile(true)}
              aria-label="Open user profile"
              title="User Profile"
            >
              <img 
                src={user.photoURL || getFallbackAvatar(user.displayName)}
                alt={user.displayName}
                className="profile-avatar"
                onError={(e) => {
                  e.target.src = getFallbackAvatar(user.displayName);
                }}
              />
            </button>
          )}
          <button 
            className={`theme-toggle ${darkMode ? 'dark' : 'light'}`}
            onClick={toggleDarkMode}
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            <span className="toggle-icon">
              {darkMode ? '☀️' : '🌙'}
            </span>
          </button>
        </div>
      </div>
      
      {!user && (
        <div className="login-prompt">
          <div className="login-content">
            <h3>🎯 Sign in to track your progress!</h3>
            <p>Save your stats, earn achievements, and compete with friends</p>
            <button className="login-btn" onClick={handleSignIn}>
              <span role="img" aria-label="google">🔍</span> Sign in with Google
            </button>
          </div>
        </div>
      )}
      
      <div className="status-wrapper">
        <div className={`status-text ${statusClass}`}>
          <div className="status">{statusMessage}</div>
        </div>
      </div>

      <div className="wordle-wrapper">
        <div className="wordle">
          {renderedWords.map(({ key, classes, letters }) => (
            <div key={key} className={classes}>
              {letters.map(({ key: letterKey, char, classes: letterClasses }) => (
                <div
                  key={letterKey}
                  className={["letter"].concat(letterClasses).join(" ")}
                >
                  <span>{char}</span>
                </div>
              ))}
            </div>
          ))}
          
          {/* Keyboard integrated within the wordle card */}
          <div className="keyboard-wrapper">
            <Keyboard
              onKeyPress={(key) =>
                onKeyDown({
                  key:
                    key === "{backspace}"
                      ? "Backspace"
                      : key === "{enter}"
                      ? "Enter"
                      : key,
                })
              }
              layout={{
                default: KEYBOARD_LAYOUT.default.map(row => row.join(" "))
              }}
              display={KEYBOARD_DISPLAY}
              buttonTheme={buttonTheme}
              physicalKeyboardHighlight={true}
            />
          </div>
        </div>
      </div>

      {/* Statistics Display */}
      {(state.gameWon || state.gameLost) && user && (
        <div className="stats-wrapper">
          <div className="stats">
            <h3>Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{stats.gamesPlayed}</div>
                <div className="stat-label">Played</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{winPercentage}%</div>
                <div className="stat-label">Win %</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.currentStreak}</div>
                <div className="stat-label">Current Streak</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.maxStreak}</div>
                <div className="stat-label">Max Streak</div>
              </div>
            </div>
            <div className="guess-distribution">
              <h4>Guess Distribution</h4>
              {stats.guessDistribution.map((count, index) => (
                <div key={index} className="guess-row">
                  <span className="guess-number">{index + 1}</span>
                  <div className="guess-bar">
                    <div 
                      className="guess-fill" 
                      style={{ 
                        width: count > 0 ? `${(count / Math.max(...stats.guessDistribution)) * 100}%` : '0%',
                        opacity: count > 0 ? 1 : 0.3
                      }}
                    />
                    {count === 0 && (
                      <span className="guess-empty">—</span>
                    )}
                  </div>
                  <span className="guess-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* User Profile Modal */}
      <UserProfile 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />

      {/* Leaderboard Modal */}
      <Leaderboard 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />
    </div>
  );
}
