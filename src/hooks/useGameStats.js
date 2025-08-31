import { useCallback } from 'react';
import { checkAchievements } from '../achievements';

export const useGameStats = (stats, updateStats, user, userStats, updateUserStats) => {
  const handleGameEnd = useCallback((won, attempts) => {
    const newStats = { ...stats };
    newStats.gamesPlayed += 1;
    
    if (won) {
      newStats.gamesWon += 1;
      newStats.currentStreak += 1;
      newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
      newStats.guessDistribution[attempts - 1] += 1;
    } else {
      newStats.currentStreak = 0;
    }
    
    // Update Firebase stats
    updateStats(newStats);

    // Update cloud stats if user is signed in
    if (user && userStats) {
      const cloudStats = { ...userStats };
      cloudStats.gamesPlayed += 1;
      
      if (won) {
        cloudStats.gamesWon += 1;
        cloudStats.currentStreak += 1;
        cloudStats.maxStreak = Math.max(cloudStats.maxStreak, cloudStats.currentStreak);
        cloudStats.totalGuesses += attempts;
      } else {
        cloudStats.currentStreak = 0;
        cloudStats.totalGuesses += 6; // NUM_ATTEMPTS
      }

      // Calculate and update average guesses
      cloudStats.averageGuesses = cloudStats.gamesPlayed > 0 
        ? parseFloat(((cloudStats.totalGuesses / cloudStats.gamesPlayed)).toFixed(1))
        : 0;

      // Check for new achievements
      const newAchievements = checkAchievements(cloudStats, { guesses: attempts });
      if (newAchievements.length > 0) {
        cloudStats.achievements = [...(cloudStats.achievements || []), ...newAchievements];
      }

      updateUserStats(cloudStats);
    }
  }, [stats, updateStats, user, userStats, updateUserStats]);

  return { handleGameEnd };
}; 