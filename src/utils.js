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

/**
 * Calculate time remaining until next word (next UTC day)
 * Returns an object with hours, minutes, seconds, timeRemaining (in ms), and timeString
 * The timeString is formatted for display in hh:mm:ss format
 */
export const getTimeUntilNextWord = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  
  const timeRemaining = tomorrow.getTime() - now.getTime();
  
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  
  // Format time string in hh:mm:ss format
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  return { hours, minutes, seconds, timeRemaining, timeString };
}; 