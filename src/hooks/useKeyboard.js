import { useCallback } from 'react';
import { WORD_LENGTH, NUM_ATTEMPTS, API_ENDPOINTS } from '../constants';

export const useKeyboard = (state, gameLoading, updateGameState, saveGameStateToFirebase, handleGameEnd) => {
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
    
    if (gameLoading || gameWon || gameLost || (invalidWord && key !== "Backspace")) {
      return;
    }
    
    // Clear invalid word state when typing
    if (key !== "Backspace" && key !== "Enter") {
      state.invalidWord = false;
    }
    
    switch (key) {
      case "Enter":
        if (currLetter < WORD_LENGTH) return;
        
        try {
          const guessRequest = new URL("router", API_ENDPOINTS.WORD_VALIDATION);
          guessRequest.searchParams.append(
            "word",
            words[currWord].map(({ char }) => char).join("")
          );
          
          const response = await fetch(guessRequest);
          const guessResponse = await response.json();
          
          if (guessResponse.error === "INVALID_WORD") {
            updateGameState({
              ...state,
              invalidWord: true,
            });
            return;
          } else if (guessResponse.error) {
            console.error('Word validation error:', guessResponse.error);
            return;
          }
          
          // Process the guess result
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
          saveGameStateToFirebase(newState);
        } catch (error) {
          console.error('Error processing guess:', error);
          // Set invalid word state on error
          updateGameState({
            ...state,
            invalidWord: true,
          });
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

  return { onKeyDown };
}; 