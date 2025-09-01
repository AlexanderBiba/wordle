import React from 'react';
import './CustomKeyboard.scss';

const CustomKeyboard = ({ onKeyPress, buttonTheme = {} }) => {
  const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['⌫', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Submit']
  ];

  const handleKeyClick = (key) => {
    if (key === 'Submit') {
      onKeyPress('Enter');
    } else if (key === '⌫') {
      onKeyPress('Backspace');
    } else {
      onKeyPress(key);
    }
  };

  const getKeyClass = (key) => {
    const theme = buttonTheme[key] || 'default';
    return `keyboard-key ${theme}`;
  };

  return (
    <div className="custom-keyboard">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key, keyIndex) => (
            <button
              key={key}
              className={getKeyClass(key)}
              onClick={() => handleKeyClick(key)}
              type="button"
              aria-label={key === '⌫' ? 'Backspace' : key === 'Submit' ? 'Submit' : key}
              style={{
                '--ripple-delay': `${(rowIndex * 10 + keyIndex) * 0.03}s`
              }}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CustomKeyboard; 