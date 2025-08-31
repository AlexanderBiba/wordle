// Game constants
export const WORD_LENGTH = 5;
export const NUM_ATTEMPTS = 6;

// Default stats object - used across multiple components
export const DEFAULT_STATS = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  totalGuesses: 0,
  averageGuesses: 0,
  bestTime: null,
  achievements: [],
  guessDistribution: Array(NUM_ATTEMPTS).fill(0)
};

// Default game state
export const DEFAULT_GAME_STATE = {
  words: Array(NUM_ATTEMPTS).fill(Array(WORD_LENGTH).fill({})),
  currWord: 0,
  currLetter: 0,
  gameWon: false,
  gameLost: false,
  invalidWord: false,
  absentLetters: {},
  foundLetters: {},
  lastPlayedDate: null
};

// API endpoints
export const API_ENDPOINTS = {
  LEADERBOARD: 'https://words-935269737264.europe-west1.run.app/router',
  WORD_VALIDATION: 'https://words-935269737264.europe-west1.run.app/router'
};

// Date formatting utilities
export const pad = (num) => `${num < 10 ? "0" : ""}${num}`;
export const getDateStr = (date = new Date()) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;

// Keyboard layout
export const KEYBOARD_LAYOUT = {
  default: [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["{backspace}", "z", "x", "c", "v", "b", "n", "m", "{enter}"]
  ]
};

// Keyboard display mappings
export const KEYBOARD_DISPLAY = {
  "{backspace}": "⌫",
  "{enter}": "⏎"
}; 