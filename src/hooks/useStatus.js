import { useMemo, useState, useEffect } from 'react';
import { NUM_ATTEMPTS, WORD_LENGTH } from '../constants';
import { getTimeUntilNextWord } from '../utils';

export const useStatus = (state, gameLoading, user, loginPromptDismissed) => {
  const [nextWordTime, setNextWordTime] = useState(null);

  // Update next word time every second when game is over for logged-in users
  useEffect(() => {
    if (!user || (!state.gameWon && !state.gameLost)) {
      setNextWordTime(null);
      return;
    }

    const updateTime = () => {
      const timeData = getTimeUntilNextWord();
      setNextWordTime(timeData);
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [user, state.gameWon, state.gameLost]);

  const statusMessage = useMemo(() => {
    if (gameLoading) return "Loading game...";
    if (state.checkingWord) return "Checking word...";
    
    // Different messages based on authentication status
    if (state.gameWon) {
      if (user) {
        const timeStr = nextWordTime ? `\nNext word in ${nextWordTime.timeString}` : '';
        return `🎉 Amazing! You got it! Come back tomorrow for a new challenge!${timeStr}`;
      } else {
        return "🎉 Great job! Sign in to play daily challenges and track your progress!";
      }
    }
    
    if (state.gameLost) {
      if (user) {
        const timeStr = nextWordTime ? `\nNext word in ${nextWordTime.timeString}` : '';
        return `😔 Game over! The word was tough today. Try again tomorrow!${timeStr}`;
      } else {
        return "😔 Game over! Sign in to play daily challenges and track your progress!";
      }
    }
    
    if (state.invalidWord) return "❌ Not a valid word. Try something else!";
    
    if (state.currWord) {
      const attemptsLeft = NUM_ATTEMPTS - state.currWord;
      return `${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left`;
    }
    
    // Different welcome messages based on authentication status
    if (user) {
      return `Welcome to Wordle! Guess today's ${WORD_LENGTH}-letter word in ${NUM_ATTEMPTS} attempts.`;
    } else {
      return `Welcome to Wordle! Guess the ${WORD_LENGTH}-letter word in ${NUM_ATTEMPTS} attempts. (Demo mode - sign in for daily challenges!)`;
    }
  }, [state, gameLoading, user, nextWordTime]);

  const statusClass = useMemo(() => {
    if (gameLoading) return "loading";
    if (state.checkingWord) return "loading";
    if (state.gameWon) return "win";
    if (state.gameLost) return "lose";
    if (state.invalidWord) return "invalid";
    return "";
  }, [state, gameLoading]);

  // Determine if we should show a sign-in button
  const showSignInButton = useMemo(() => {
    return !user && loginPromptDismissed && (state.gameWon || state.gameLost);
  }, [user, loginPromptDismissed, state.gameWon, state.gameLost]);

  return { statusMessage, statusClass, showSignInButton };
}; 