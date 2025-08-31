// Utility functions for common operations

/**
 * Calculate win percentage from games played and won
 */
export const calculateWinPercentage = (gamesPlayed, gamesWon) => {
  return gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
};

/**
 * Get fallback avatar URL for user
 */
export const getFallbackAvatar = (displayName) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=2563eb&color=fff&size=120`;
}; 