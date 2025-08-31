import { useMemo } from 'react';

export const useWordRendering = (state) => {
  const renderedWords = useMemo(() => {
    return state.words.map((word, i) => {
      const current = i === state.currWord;
      const classes = [];
      if (current) classes.push("current");
      if (i === state.currWord && state.invalidWord) classes.push("invalid");

      const letters = (current
        ? word.map((letter, j) =>
            j === state.currLetter
              ? { ...letter, current: true }
              : { ...letter, current: false }
          )
        : word
      ).map(({ exact, misplaced, current, char }, j) => {
        const letterClasses = [];
        if (!char) letterClasses.push("empty");
        if (exact) letterClasses.push("exact");
        if (misplaced) letterClasses.push("misplaced");
        if (current) letterClasses.push("current");
        
        return {
          key: j,
          char: char ?? "",
          classes: letterClasses
        };
      });

      return {
        key: i,
        classes: ["word"].concat(classes).join(" "),
        letters
      };
    });
  }, [state.words, state.currWord, state.currLetter, state.invalidWord]);

  return { renderedWords };
}; 