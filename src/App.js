import "./App.scss";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./hooks/useAuth";
import { useGameState } from "./hooks/useGameState";
import { checkAchievements } from "./achievements";
import UserProfile from "./components/UserProfile";
import Leaderboard from "./components/Leaderboard";

const WORD_LENGTH = 5;
const NUM_ATTEMPTS = 6;



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

  const getStatusMessage = () => {
    if (gameLoading) return "Checking word...";
    if (state.gameWon) return "🎉 Amazing! You got it! Come back tomorrow for a new challenge!";
    if (state.gameLost) return "😔 Game over! The word was tough today. Try again tomorrow!";
    if (state.invalidWord) return "❌ Not a valid word. Try something else!";
    if (state.currWord) {
      const attemptsLeft = NUM_ATTEMPTS - state.currWord;
      return `${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left`;
    }
    return `Welcome to Wordle! Guess the ${WORD_LENGTH}-letter word in ${NUM_ATTEMPTS} attempts.`;
  };

  const getStatusClass = () => {
    if (gameLoading) return "loading";
    if (state.gameWon) return "win";
    if (state.gameLost) return "lose";
    if (state.invalidWord) return "invalid";
    return "";
  };

    const handleGameEnd = useCallback((won, attempts) => {
    const newStats = { ...stats };
    newStats.gamesPlayed += 1;
    
    if (won) {
      newStats.gamesWon += 1;
      newStats.currentStreak += 1;
      newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
      newStats.guessDistribution[attempts - 1] += 1;
    } else {
      newStats.currentStreak = 0;
    }
    
    // Update Firebase stats
    updateStats(newStats);

    // Update cloud stats if user is signed in
    if (user && userStats) {
      const cloudStats = { ...userStats };
      cloudStats.gamesPlayed += 1;
      
      if (won) {
        cloudStats.gamesWon += 1;
        cloudStats.currentStreak += 1;
        cloudStats.maxStreak = Math.max(cloudStats.maxStreak, cloudStats.currentStreak);
        cloudStats.guessDistribution[attempts - 1] += 1;
        cloudStats.totalGuesses += attempts;
      } else {
        cloudStats.currentStreak = 0;
        cloudStats.totalGuesses += NUM_ATTEMPTS;
      }

      // Check for new achievements
      const newAchievements = checkAchievements(cloudStats, { guesses: attempts });
      if (newAchievements.length > 0) {
        cloudStats.achievements = [...(cloudStats.achievements || []), ...newAchievements];
      }

      updateUserStats(cloudStats);
    }
  }, [stats, updateStats, user, userStats, updateUserStats]);

  const onKeyDown = useCallback(async ({ key }) => {
    const {
      words,
      currWord,
      currLetter,
      gameWon,
      gameLost,
      invalidWord,
      absentLetters,
      foundLetters,
    } = state;
    if (gameLoading || gameWon || gameLost || (invalidWord && key !== "Backspace"))
      return;
    state.invalidWord = false;
    switch (key) {
      case "Enter":
        if (currLetter < WORD_LENGTH) return;
        const guessRequest = new URL(
          "router",
          "https://words-935269737264.europe-west1.run.app"
        );
        guessRequest.searchParams.append(
          "word",
          words[currWord].map(({ char }) => char).join("")
        );
        // Note: Loading state is now managed by Firebase hook
        const guessResponse = await (await fetch(guessRequest)).json();
        if (guessResponse.error === "INVALID_WORD") {
          updateGameState({
            ...state,
            invalidWord: true,
          });
          return;
        } else if (guessResponse.error) {
          console.error(guessResponse);
          return;
        }
        const tmpWords = words.map((word, i) => {
          if (i !== currWord) return word;
          return word.map((letter, j) => {
            switch (guessResponse[j]) {
              case 2:
                foundLetters[letter.char] = true;
                return { ...letter, exact: true };
              case 1:
                foundLetters[letter.char] = true;
                return { ...letter, misplaced: true };
              default:
                absentLetters[letter.char] = true;
                return letter;
            }
          });
        });
        const gameWon = tmpWords[currWord].every((letter) => letter.exact);
        const gameLost = currWord === NUM_ATTEMPTS - 1 && !gameWon;
        
        if (gameWon || gameLost) {
          handleGameEnd(gameWon, currWord + 1);
        }
        
        const newState = {
          ...state,
          words: tmpWords,
          currWord: gameWon ? null : currWord + 1,
          currLetter: gameWon ? null : 0,
          gameWon: gameWon,
          gameLost: gameLost,
          absentLetters,
          foundLetters,
        };
        
        updateGameState(newState);
        
        // Save to Firebase when word is submitted or game ends
        if (gameWon || gameLost) {
          // Game ended, save immediately
          saveGameStateToFirebase(newState);
        } else {
          // Word submitted, save the current state
          saveGameStateToFirebase(newState);
        }
        break;
      case "Backspace":
        updateGameState({
          ...state,
          words: words.map((word, i) =>
            i === state.currWord
              ? word.map((letter, j) => (j === state.currLetter - 1 ? {} : letter))
              : word
          ),
          currLetter: Math.max(state.currLetter - 1, 0),
        });
        break;
      default:
        const char = key.toUpperCase();
        if (char.length !== 1 || char < "A" || char > "Z") return;
        updateGameState({
          ...state,
          words: words.map((word, i) =>
            i === state.currWord
              ? word.map((letter, j) => (j === state.currLetter ? { char } : letter))
              : word
          ),
          currLetter: Math.min(state.currLetter + 1, WORD_LENGTH),
        });
    }
  }, [state, gameLoading, updateGameState, saveGameStateToFirebase, handleGameEnd]);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);



  const winPercentage = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

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
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=2563eb&color=fff&size=120`}
                alt={user.displayName}
                className="profile-avatar"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=2563eb&color=fff&size=120`;
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
        <div className={`status-text ${getStatusClass()}`}>
          <div className="status">{getStatusMessage()}</div>
        </div>
      </div>

      <div className="wordle-wrapper">
        <div className="wordle">
          {state.words.map((word, i) => {
            const current = i === state.currWord;
            const classes = [];
            if (current) classes.push("current");
            if (i === state.currWord && state.invalidWord) classes.push("invalid");

            return (
              <div key={i} className={["word"].concat(classes).join(" ")}>
                {(current
                  ? word.map((letter, j) =>
                      j === state.currLetter
                        ? { ...letter, current: true }
                        : { ...letter, current: false }
                    )
                  : word
                ).map(({ exact, misplaced, current, char }, j) => {
                  const classes = [];
                  if (!char) classes.push("empty");
                  if (exact) classes.push("exact");
                  if (misplaced) classes.push("misplaced");
                  if (current) classes.push("current");
                  return (
                    <div
                      key={j}
                      className={["letter"].concat(classes).join(" ")}
                    >
                      <span>{char ?? ""}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          
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
                default: [
                  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].join(" "),
                  ["a", "s", "d", "f", "g", "h", "j", "k", "l"].join(" "),
                  [
                    "{backspace}",
                    "z",
                    "x",
                    "c",
                    "v",
                    "b",
                    "n",
                    "m",
                    "{enter}",
                  ].join(" "),
                ],
              }}
              display={{
                "{backspace}": "⌫",
                "{enter}": "⏎",
              }}
              buttonTheme={(state.invalidWord
                ? [
                    {
                      class: "emphasis",
                      buttons: "{backspace}",
                    },
                  ]
                : []
              )
                .concat(
                  !state.invalidWord &&
                    state.words[state.currWord]?.filter(({ char }) => char)
                      .length === WORD_LENGTH
                    ? [
                        {
                          class: "emphasis",
                          buttons: "{enter}",
                        },
                      ]
                    : []
                )
                .concat(
                  Object.keys(state.absentLetters).length
                    ? [
                        {
                          class: "absent-letter",
                          buttons: Object.keys(state.absentLetters)
                            .map((c) => c.toLowerCase())
                            .join(" "),
                        },
                      ]
                    : []
                )
                .concat(
                  Object.keys(state.foundLetters).length
                    ? [
                        {
                          class: "found-letter",
                          buttons: Object.keys(state.foundLetters)
                            .map((c) => c.toLowerCase())
                            .join(" "),
                        },
                      ]
                    : []
                )}
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
