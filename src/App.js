import "./App.scss";
import CustomKeyboard from "./components/CustomKeyboard";
import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useGameState } from "./hooks/useGameState";
import { useKeyboard } from "./hooks/useKeyboard";
import { useGameStats } from "./hooks/useGameStats";
import { useStatus } from "./hooks/useStatus";
import { useKeyboardTheme } from "./hooks/useKeyboardTheme";
import { useWordRendering } from "./hooks/useWordRendering";
import { usePWA } from "./hooks/usePWA";
import UserProfile from "./components/UserProfile";
import Leaderboard from "./components/Leaderboard";
import Information from "./components/Information";
import HeaderIcon from "./components/HeaderIcon";
import Card from "./components/Card";

import { calculateWinPercentage, getFallbackAvatar } from "./utils";

export default function App() {
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showInformation, setShowInformation] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  const [loginPromptDismissed, setLoginPromptDismissed] = useState(false);
  
  const { user, userStats, signInWithGoogle, updateUserStats, loading: authLoading } = useAuth();
  
  const {
    isOnline,
    hasUpdate,
    showInstallBanner,
    registerServiceWorker,
    installPWA,
    skipWaiting,
    dismissInstallBanner
  } = usePWA();
  
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

  const { handleGameEnd } = useGameStats(stats, updateStats, user, userStats, updateUserStats);

  const { onKeyDown } = useKeyboard(
    state, 
    gameLoading, 
    updateGameState, 
    saveGameStateToFirebase, 
    handleGameEnd,
    user
  );

  const { statusMessage, statusClass, showSignInButton } = useStatus(state, gameLoading, user, loginPromptDismissed);
  const { buttonTheme } = useKeyboardTheme(state);
  const { renderedWords } = useWordRendering(state);

  const isAppLoading = authLoading || gameLoading || minLoadingTime;

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Reset the dismissed state when user signs in successfully
      setLoginPromptDismissed(false);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleDismissLoginPrompt = () => {
    setLoginPromptDismissed(true);
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
              <h2>Wordle</h2>
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
      {/* PWA Update Notification */}
      {hasUpdate && (
        <div className="pwa-update-banner">
          <div className="update-content">
            <span>🔄 New version available!</span>
            <button onClick={skipWaiting} className="update-btn">
              Update Now
            </button>
          </div>
        </div>
      )}

      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="offline-banner">
          <span>📡 You're offline - playing in offline mode</span>
        </div>
      )}

      {/* PWA Install Prompt */}
      {showInstallBanner && (
        <div className="pwa-install-banner">
          <div className="install-content">
            <span>📱 Install Wordle for the best experience!</span>
            <div className="install-actions">
              <button onClick={installPWA} className="install-btn">Install</button>
              <button 
                onClick={dismissInstallBanner} 
                className="dismiss-btn"
                aria-label="Close install banner"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <Card variant="header" padding="compact" marginBottom="2rem" background="primary">
        <div className="header-content">
          <h1 className="header">
            <span role="img" aria-label="puzzle">🧩</span> Wordle
          </h1>
          <div className="header-actions">
            <HeaderIcon
              icon="💡"
              onClick={() => setShowInformation(true)}
              ariaLabel="Open information"
              title="How to Play & About"
            />
            <HeaderIcon
              icon="🏆"
              onClick={() => setShowLeaderboard(true)}
              ariaLabel="Open leaderboard"
              title="View Leaderboard"
            />
            {user && (
              <HeaderIcon
                isImage={true}
                imageSrc={user.photoURL || getFallbackAvatar(user.displayName)}
                imageAlt={user.displayName}
                onClick={() => setShowProfile(true)}
                ariaLabel="Open user profile"
                title="User Profile"
                onImageError={(e) => {
                  e.target.src = getFallbackAvatar(user.displayName);
                }}
              />
            )}
            <HeaderIcon
              icon={darkMode ? '☀️' : '🌙'}
              onClick={toggleDarkMode}
              ariaLabel={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              className={darkMode ? 'dark' : 'light'}
            />
          </div>
        </div>
      </Card>
      
      {/* Login prompt - only show if user is not logged in and not dismissed */}
      {!user && !loginPromptDismissed && (
        <Card variant="login" padding="normal" marginBottom="2rem">
          <div className="login-content">
            <button 
              className="dismiss-login-btn"
              onClick={handleDismissLoginPrompt}
              aria-label="Dismiss login prompt"
              title="Close"
            >
              ✕
            </button>
            <h3>🎯 Sign in to track your progress!</h3>
            <p>Save your stats, earn achievements, and compete with friends</p>
            <button className="login-btn" onClick={handleSignIn}>
              <span role="img" aria-label="google">🔍</span> Sign in with Google
            </button>
          </div>
        </Card>
      )}
      
      <Card 
        variant={`status ${statusClass}`} 
        padding="compact" 
        marginBottom="2rem"
        background={statusClass === "win" ? "success" : statusClass === "lose" ? "error" : statusClass === "invalid" ? "warning" : statusClass === "loading" ? "primary" : "surface"}
        className="status-card"
      >
        <div className="status-content">
          <div className="status">{statusMessage}</div>
          {showSignInButton && (
            <button 
              className="status-signin-btn"
              onClick={handleSignIn}
              aria-label="Sign in to track progress"
            >
              <span role="img" aria-label="google">🔍</span> Sign In to Track Progress
            </button>
          )}
        </div>
      </Card>

      <Card variant="game" padding="normal" marginBottom="2rem">
        <div className="game-content">
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
          
          {/* Custom Keyboard integrated within the wordle card */}
          <div className="keyboard-wrapper">
            <CustomKeyboard
              onKeyPress={(key) => onKeyDown({ key })}
              buttonTheme={buttonTheme}
            />
          </div>
        </div>
      </Card>

      {/* Statistics Display */}
      {(state.gameWon || state.gameLost) && user && (
        <Card variant="stats" padding="normal" marginBottom="2rem">
          <div className="stats-content">
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
        </Card>
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

      {/* Information Modal */}
      <Information 
        isOpen={showInformation} 
        onClose={() => setShowInformation(false)} 
      />
    </div>
  );
}
