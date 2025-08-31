import { useMemo } from 'react';

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
    theme['Enter'] = 'default';
    theme['⌫'] = state.invalidWord ? 'emphasis' : 'default';
    
    console.log('Keyboard theme generated:', {
      foundLetters: Object.keys(state.foundLetters),
      absentLetters: Object.keys(state.absentLetters),
      theme: theme
    });
    
    return theme;
  }, [state.absentLetters, state.foundLetters, state.invalidWord]);

  return { buttonTheme };
}; 