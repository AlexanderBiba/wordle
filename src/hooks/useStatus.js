import { useMemo } from 'react';
import { NUM_ATTEMPTS, WORD_LENGTH } from '../constants';

export const useStatus = (state, gameLoading) => {
  const statusMessage = useMemo(() => {
    if (gameLoading) return "Checking word...";
    if (state.gameWon) return "🎉 Amazing! You got it! Come back tomorrow for a new challenge!";
    if (state.gameLost) return "😔 Game over! The word was tough today. Try again tomorrow!";
    if (state.invalidWord) return "❌ Not a valid word. Try something else!";
    if (state.currWord) {
      const attemptsLeft = NUM_ATTEMPTS - state.currWord;
      return `${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left`;
    }
    return `Welcome to Wordle! Guess the ${WORD_LENGTH}-letter word in ${NUM_ATTEMPTS} attempts.`;
  }, [state, gameLoading]);

  const statusClass = useMemo(() => {
    if (gameLoading) return "loading";
    if (state.gameWon) return "win";
    if (state.gameLost) return "lose";
    if (state.invalidWord) return "invalid";
    return "";
  }, [state, gameLoading]);

  return { statusMessage, statusClass };
}; 