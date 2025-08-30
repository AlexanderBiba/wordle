import { useState, useEffect, useMemo, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const NUM_ATTEMPTS = 6;
const WORD_LENGTH = 5;

const pad = (num) => `${num < 10 ? "0" : ""}${num}`;
const getDateStr = (date = new Date()) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
    date.getUTCDate()
  )}`;

export const useGameState = (user) => {
  const today = getDateStr();
  
  // Default game state
  const defaultState = useMemo(() => ({
    words: Array(NUM_ATTEMPTS).fill(Array(WORD_LENGTH).fill({})),
    currWord: 0,
    currLetter: 0,
    gameWon: false,
    gameLost: false,
    invalidWord: false,
    absentLetters: {},
    foundLetters: {},
    lastPlayedDate: today,
  }), [today]);

  // Default stats
  const defaultStats = useMemo(() => ({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: Array(NUM_ATTEMPTS).fill(0),
  }), []);

  const [state, setState] = useState(defaultState);
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Track if state needs saving

  // Get user's game document reference
  const getUserGameDoc = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid, 'games', 'current');
  }, [user]);

  const getUserStatsDoc = useCallback(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid, 'stats', 'wordle');
  }, [user]);





  // Serialize game state for Firebase (convert nested arrays to flat structure)
  const serializeGameState = useCallback((gameState) => {
    // Deep clone and flatten the state
    const serialized = {
      currWord: gameState.currWord || 0,
      currLetter: gameState.currLetter || 0,
      gameWon: gameState.gameWon || false,
      gameLost: gameState.gameLost || false,
      invalidWord: gameState.invalidWord || false,
      lastPlayedDate: gameState.lastPlayedDate || today,
      // Convert words array to a flat structure
      wordsData: gameState.words.map((word, wordIndex) => 
        word.map((letter, letterIndex) => ({
          wordIndex,
          letterIndex,
          char: letter.char || '',
          exact: letter.exact || false,
          misplaced: letter.misplaced || false,
          current: letter.current || false
        }))
      ).flat(),
      // Convert objects to arrays for Firebase compatibility
      absentLetters: Object.keys(gameState.absentLetters || {}),
      foundLetters: Object.keys(gameState.foundLetters || {})
    };
    
    return serialized;
  }, [today]);

  // Deserialize game state from Firebase (convert flat structure back to nested)
  const deserializeGameState = useCallback((firebaseData) => {
    if (!firebaseData) return defaultState;
    
    // Reconstruct the words array from flat data
    const words = Array(NUM_ATTEMPTS).fill(null).map(() => Array(WORD_LENGTH).fill({}));
    
    if (firebaseData.wordsData) {
      firebaseData.wordsData.forEach(letterData => {
        const { wordIndex, letterIndex, char, exact, misplaced, current } = letterData;
        if (wordIndex < NUM_ATTEMPTS && letterIndex < WORD_LENGTH) {
          words[wordIndex][letterIndex] = {
            char: char || '',
            exact: exact || false,
            misplaced: misplaced || false,
            current: current || false
          };
        }
      });
    }
    
    return {
      currWord: firebaseData.currWord || 0,
      currLetter: firebaseData.currLetter || 0,
      gameWon: firebaseData.gameWon || false,
      gameLost: firebaseData.gameLost || false,
      invalidWord: firebaseData.invalidWord || false,
      lastPlayedDate: firebaseData.lastPlayedDate || today,

      words: words,
      absentLetters: (firebaseData.absentLetters || []).reduce((acc, letter) => {
        acc[letter] = true;
        return acc;
      }, {}),
      foundLetters: (firebaseData.foundLetters || []).reduce((acc, letter) => {
        acc[letter] = true;
        return acc;
      }, {})
    };
  }, [defaultState, today]);

  // Load game state from Firebase
  const loadGameState = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const gameDoc = getUserGameDoc();
      const statsDoc = getUserStatsDoc();

      // Load game state
      const gameSnapshot = await getDoc(gameDoc);
      if (gameSnapshot.exists()) {
        const gameData = gameSnapshot.data();
        
        // Check if it's a new day
        if (gameData.lastPlayedDate !== today) {
          // Reset game for new day
          const newState = { ...defaultState, lastPlayedDate: today };
          const serializedState = serializeGameState(newState);
          await setDoc(gameDoc, serializedState);
          setState(newState);
        } else {
          // Deserialize the data from Firebase
          const deserializedState = deserializeGameState(gameData);
          setState(deserializedState);
        }
      } else {
        // Create new game document
        const serializedState = serializeGameState(defaultState);
        await setDoc(gameDoc, serializedState);
        setState(defaultState);
      }

      // Load stats
      const statsSnapshot = await getDoc(statsDoc);
      if (statsSnapshot.exists()) {
        setStats(statsSnapshot.data());
      } else {
        // Create new stats document
        await setDoc(statsDoc, defaultStats);
        setStats(defaultStats);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading game state:', error);
      setLoading(false);
    }
  }, [user, defaultState, defaultStats, deserializeGameState, getUserGameDoc, getUserStatsDoc, serializeGameState, today]);



  // Save stats to Firebase
  const saveStats = async (newStats) => {
    if (!user) return;

    try {
      const statsDoc = getUserStatsDoc();
      await setDoc(statsDoc, newStats);
      setStats(newStats);
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  };



  // Update game state locally (marks as dirty, doesn't save immediately)
  const updateGameState = (updater) => {
    const newState = typeof updater === 'function' ? updater(state) : updater;
    setState(newState);
    setIsDirty(true); // Mark as needing to be saved
  };

  // Save game state to Firebase (only when explicitly called)
  const saveGameStateToFirebase = async (gameState = state) => {
    if (!user) return;

    try {
      const gameDoc = getUserGameDoc();
      const serializedState = serializeGameState(gameState);
      
      await setDoc(gameDoc, serializedState);
      setIsDirty(false); // Mark as saved
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  // Force save current state (useful for game end, etc.)
  const forceSave = () => {
    if (isDirty) {
      saveGameStateToFirebase();
    }
  };

  // Update stats
  const updateStats = (updater) => {
    const newStats = typeof updater === 'function' ? updater(stats) : updater;
    saveStats(newStats);
  };

  // Toggle dark mode (local only, no Firebase sync)
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Load initial state when user changes
  useEffect(() => {
    if (user) {
      loadGameState();
    } else {
      // Reset to defaults when no user
      setState(defaultState);
      setStats(defaultStats);
      setDarkMode(false);
      setLoading(false);
    }
  }, [user, defaultState, defaultStats, loadGameState]);



  return {
    state,
    stats,
    darkMode,
    loading,
    updateGameState,
    updateStats,
    toggleDarkMode,
    saveGameStateToFirebase,
    forceSave,
    isDirty,
  };
}; 