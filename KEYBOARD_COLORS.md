# Keyboard Color Feature

## Overview
The keyboard now displays color-coded feedback for letters based on their usage in the game:

- **Green**: Letters that are present in the daily word (correct position or misplaced)
- **Red**: Letters that are not present in the daily word (absent)
- **Gray**: Letters that haven't been used in any guess yet (default)

## Implementation Details

### Color Logic
1. **Green (correct)**: Letters marked in `foundLetters` state
   - Applied when a letter is in the correct position (exact match)
   - Applied when a letter is present but in wrong position (misplaced)

2. **Red (absent)**: Letters marked in `absentLetters` state
   - Applied when a letter is not present in the daily word
   - Only applied if the letter is not already marked as found

3. **Gray (default)**: Letters not yet used in any guess
   - Default state for all letters at the start of a game
   - Applied when a letter hasn't been used in any guess

### Priority System
- Found letters (green) take precedence over absent letters (red)
- This handles cases where a letter appears multiple times in a guess

### Special Keys
- **Enter**: Always gray (default)
- **Backspace**: Gray by default, yellow (emphasis) when there's an invalid word

### Technical Implementation
- **Hook**: `useKeyboardTheme` processes game state and returns button theme object
- **Component**: `CustomKeyboard` applies CSS classes based on theme
- **CSS**: Color classes defined in `CustomKeyboard.scss`
- **State**: `foundLetters` and `absentLetters` objects in game state

### Color Values
- Green: `#10b981` (success color from palette)
- Red: `#ef4444` (error color from palette)  
- Gray: `#e2e8f0` (gray-200 for light mode, gray-700 for dark mode)

## Testing
The feature has been tested with:
- Initial state (all letters gray)
- Found letters (green)
- Absent letters (red)
- Priority handling (found overrides absent)
- Game state reset (colors reset on new day) 