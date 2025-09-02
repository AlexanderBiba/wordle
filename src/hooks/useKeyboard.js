import { useCallback } from 'react';
import { WORD_LENGTH, NUM_ATTEMPTS, API_ENDPOINTS } from '../constants';

export const useKeyboard = (state, gameLoading, updateGameState, saveGameStateToFirebase, handleGameEnd, user) => {
  const onKeyDown = useCallback(async ({ key }) => {
    const {
      words,
      currWord,
      currLetter,
      gameWon,
      gameLost,
      absentLetters,
      foundLetters,
    } = state;
    
    // Clear invalid word state when typing (before early return check)
    if (key !== "Backspace" && key !== "Enter") {
      state.invalidWord = false;
    }
    
    if (gameLoading || gameWon || gameLost) {
      return;
    }
    
    switch (key) {
      case "Enter":
        if (currLetter < WORD_LENGTH) return;
        
        // Set loading state
        updateGameState(prevState => ({
          ...prevState,
          checkingWord: true,
        }));
        
        try {
          const guessRequest = new URL("router", API_ENDPOINTS.WORD_VALIDATION);
          guessRequest.searchParams.append(
            "word",
            words[currWord].map(({ char }) => char).join("")
          );
          
          // Prepare headers for the request
          const headers = {
            'Content-Type': 'application/json',
          };
          
          // Add authentication token if user is logged in
          if (user) {
            try {
              const token = await user.getIdToken();
              headers['Authorization'] = `Bearer ${token}`;
            } catch (error) {
              // Failed to get auth token, proceeding as anonymous user
            }
          }
          
          const response = await fetch(guessRequest, {
            method: 'GET',
            headers: headers
          });
          const guessResponse = await response.json();
          
          if (guessResponse.error === "INVALID_WORD") {
            updateGameState(prevState => ({
              ...prevState,
              invalidWord: true,
              checkingWord: false,
            }));
            return;
          } else if (guessResponse.error) {
            console.error('Word validation error:', guessResponse.error);
            updateGameState(prevState => ({
              ...prevState,
              checkingWord: false,
            }));
            return;
          }
          
          // Process the guess result
          const newFoundLetters = { ...foundLetters };
          const newAbsentLetters = { ...absentLetters };
          
          const tmpWords = words.map((word, i) => {
            if (i !== currWord) return word;
            return word.map((letter, j) => {
              switch (guessResponse[j]) {
                case 2:
                  newFoundLetters[letter.char] = true;
                  return { ...letter, exact: true };
                case 1:
                  newFoundLetters[letter.char] = true;
                  return { ...letter, misplaced: true };
                default:
                  // Only mark as absent if it's not already found
                  if (!newFoundLetters[letter.char]) {
                    newAbsentLetters[letter.char] = true;
                  }
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
            words: tmpWords,
            currWord: gameWon ? null : currWord + 1,
            currLetter: gameWon ? null : 0,
            gameWon: gameWon,
            gameLost: gameLost,
            checkingWord: false,
            absentLetters: newAbsentLetters,
            foundLetters: newFoundLetters,
          };
          

          
          updateGameState(newState);
          
          // Save to Firebase when word is submitted or game ends
          saveGameStateToFirebase(newState);
        } catch (error) {
          console.error('Error processing guess:', error);
          // Set invalid word state on error
          updateGameState(prevState => ({
            ...prevState,
            invalidWord: true,
            checkingWord: false,
          }));
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
  }, [state, gameLoading, updateGameState, saveGameStateToFirebase, handleGameEnd, user]);

  return { onKeyDown };
}; 