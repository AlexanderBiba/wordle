import { useMemo } from 'react';

export const useKeyboardTheme = (state) => {
  const buttonTheme = useMemo(() => {
    const themes = [];
    
    // Invalid word theme for backspace
    if (state.invalidWord) {
      themes.push({
        class: "emphasis",
        buttons: "{backspace}",
      });
    }
    
    // Enter button emphasis when word is complete
    if (!state.invalidWord && 
        state.words[state.currWord]?.filter(({ char }) => char).length === 5) {
      themes.push({
        class: "emphasis",
        buttons: "{enter}",
      });
    }
    
    // Absent letters theme
    if (Object.keys(state.absentLetters).length > 0) {
      themes.push({
        class: "absent-letter",
        buttons: Object.keys(state.absentLetters)
          .map((c) => c.toLowerCase())
          .join(" "),
      });
    }
    
    // Found letters theme
    if (Object.keys(state.foundLetters).length > 0) {
      themes.push({
        class: "found-letter",
        buttons: Object.keys(state.foundLetters)
          .map((c) => c.toLowerCase())
          .join(" "),
      });
    }
    
    return themes;
  }, [state.invalidWord, state.words, state.currWord, state.absentLetters, state.foundLetters]);

  return { buttonTheme };
}; 