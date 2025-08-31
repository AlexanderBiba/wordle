import { DEFAULT_STATS } from './constants';

// Utility functions for common operations

/**
 * Calculate win percentage from games played and won
 */
export const calculateWinPercentage = (gamesPlayed, gamesWon) => {
  return gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
};

/**
 * Calculate average guesses from total guesses and games played
 */
export const calculateAverageGuesses = (totalGuesses, gamesPlayed) => {
  return gamesPlayed > 0 ? Math.round((totalGuesses / gamesPlayed) * 10) / 10 : 0;
};

/**
 * Format display name for privacy (first name + last initial)
 */
export const formatDisplayName = (fullName) => {
  if (!fullName) return 'Anonymous';
  
  const nameParts = fullName.trim().split(' ');
  if (nameParts.length === 1) return fullName;
  
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  const lastNameInitial = lastName.charAt(0).toUpperCase();
  
  return `${firstName} ${lastNameInitial}.`;
};

/**
 * Get fallback avatar URL for user
 */
export const getFallbackAvatar = (displayName) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=2563eb&color=fff&size=120`;
};

/**
 * Deep clone an object (simple implementation)
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
};

/**
 * Merge stats objects, handling undefined/null cases
 */
export const mergeStats = (existingStats, newStats) => {
  if (!existingStats) return { ...DEFAULT_STATS, ...newStats };
  if (!newStats) return existingStats;
  
  return {
    ...DEFAULT_STATS,
    ...existingStats,
    ...newStats
  };
};

/**
 * Validate word input (5 letters, alphabetic only)
 */
export const validateWord = (word) => {
  if (!word || typeof word !== 'string') return false;
  if (word.length !== 5) return false;
  return /^[A-Za-z]{5}$/.test(word);
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}; 