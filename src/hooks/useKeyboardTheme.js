import { useMemo } from 'react';
import { WORD_LENGTH } from '../constants';

export const useKeyboardTheme = (state) => {
  const buttonTheme = useMemo(() => {
    const theme = {};
    
    // Process all letters in the alphabet
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    alphabet.forEach(letter => {
      // Priority: found letters (green) take precedence over absent letters (red)
      if (state.foundLetters[letter]) {
        theme[letter] = 'correct';
      }
      // Check if letter is in absentLetters (red - not in word)
      else if (state.absentLetters[letter]) {
        theme[letter] = 'absent';
      }
      // Default gray for unused letters
      else {
        theme[letter] = 'default';
      }
    });
    
    // Special keys
    theme['Submit'] = (state.currLetter === WORD_LENGTH && state.currWord !== null) ? 'current' : 'default';
    theme['⌫'] = state.invalidWord ? 'emphasis' : 'default';
    
    return theme;
  }, [state.absentLetters, state.foundLetters, state.invalidWord, state.currLetter, state.currWord]);

  return { buttonTheme };
}; 