import "./App.scss";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useState, useEffect } from "react";

const WORD_LENGTH = 5;
const NUM_ATTEMPTS = 6;

const useLocalStorage = (key, defaultVal) => {
  const [value, setValue] = useState(
    () => JSON.parse(localStorage.getItem(key)) ?? defaultVal
  );
  useEffect(
    () => localStorage.setItem(key, JSON.stringify(value)),
    [key, value]
  );
  return [value, setValue];
};

const pad = (num) => `${num < 10 ? "0" : ""}${num}`;
const getDateStr = (date = new Date()) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
    date.getUTCDate()
  )}`;

export default function App() {
  const today = getDateStr();
  const storedDate = localStorage.getItem("date");
  if (!storedDate || storedDate < today) {
    localStorage.clear();
    localStorage.setItem("date", today);
  }
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", false);
  const [stats, setStats] = useLocalStorage("wordleStats", {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: Array(NUM_ATTEMPTS).fill(0),
  });
  
  const [state, setState] = useLocalStorage("wordleState", {
    words: Array(NUM_ATTEMPTS).fill(Array(WORD_LENGTH).fill({})),
    currWord: 0,
    currLetter: 0,
    gameWon: false,
    gameLost: false,
    invalidWord: false,
    absentLetters: {},
    foundLetters: {},
  });

  // Apply dark mode to document body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getStatusMessage = () => {
    if (loading) return "Checking word...";
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
    if (loading) return "loading";
    if (state.gameWon) return "win";
    if (state.gameLost) return "lose";
    if (state.invalidWord) return "invalid";
    return "";
  };

  const updateStats = (won, attempts) => {
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
    
    setStats(newStats);
  };

  const onKeyDown = async ({ key }) => {
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
    if (loading || gameWon || gameLost || (invalidWord && key !== "Backspace"))
      return;
    state.invalidWord = false;
    switch (key) {
      case "Enter":
        if (currLetter < WORD_LENGTH) return;
        const guessRequest = new URL(
          "checkWord",
          "https://us-central1-wordle-117cf.cloudfunctions.net"
        );
        guessRequest.searchParams.append(
          "word",
          words[currWord].map(({ char }) => char).join("")
        );
        setLoading(true);
        const guessResponse = await (await fetch(guessRequest)).json();
        setLoading(false);
        if (guessResponse.error === "INVALID_WORD") {
          setState({
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
          updateStats(gameWon, currWord + 1);
        }
        
        setState({
          ...state,
          words: tmpWords,
          currWord: gameWon ? null : currWord + 1,
          currLetter: gameWon ? null : 0,
          gameWon: gameWon,
          gameLost: gameLost,
          absentLetters,
          foundLetters,
        });
        break;
      case "Backspace":
        setState({
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
        setState({
          ...state,
          words: words.map((word, i) =>
            i === state.currWord
              ? word.map((letter, j) => (j === state.currLetter ? { char } : letter))
              : word
          ),
          currLetter: Math.min(state.currLetter + 1, WORD_LENGTH),
        });
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  const winPercentage = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="header-container">
        <h1 className="header">
          <span role="img" aria-label="puzzle">🧩</span> Wordle
        </h1>
        <button 
          className={`theme-toggle ${darkMode ? 'dark' : 'light'}`}
          onClick={toggleDarkMode}
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          <span className="toggle-icon">
            {darkMode ? '☀️' : '🌙'}
          </span>
        </button>
      </div>
      
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
        </div>
      </div>

      {/* Statistics Display */}
      {(state.gameWon || state.gameLost) && (
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
                      style={{ width: `${Math.max(count, 1)}px` }}
                    />
                  </div>
                  <span className="guess-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
  );
}
