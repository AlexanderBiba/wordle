export const ACHIEVEMENTS = {
  // First time achievements
  FIRST_WIN: {
    id: 'FIRST_WIN',
    title: 'First Victory',
    description: 'Win your first game of Wordle',
    icon: '🎉',
    category: 'milestone'
  },
  FIRST_STREAK: {
    id: 'FIRST_STREAK',
    title: 'Getting Started',
    description: 'Start your first winning streak',
    icon: '🔥',
    category: 'streak'
  },

  // Streak achievements
  STREAK_3: {
    id: 'STREAK_3',
    title: 'On Fire',
    description: 'Maintain a 3-day winning streak',
    icon: '🔥',
    category: 'streak'
  },
  STREAK_7: {
    id: 'STREAK_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day winning streak',
    icon: '⚡',
    category: 'streak'
  },
  STREAK_30: {
    id: 'STREAK_30',
    title: 'Month Master',
    description: 'Maintain a 30-day winning streak',
    icon: '👑',
    category: 'streak'
  },
  STREAK_100: {
    id: 'STREAK_100',
    title: 'Century Club',
    description: 'Maintain a 100-day winning streak',
    icon: '💎',
    category: 'streak'
  },

  // Performance achievements
  PERFECT_GAME: {
    id: 'PERFECT_GAME',
    title: 'Perfect Score',
    description: 'Solve the word in 1 guess',
    icon: '🎯',
    category: 'performance'
  },
  SPEED_DEMON: {
    id: 'SPEED_DEMON',
    title: 'Speed Demon',
    description: 'Solve a word in under 30 seconds',
    icon: '⚡',
    category: 'performance'
  },
  CONSISTENT_PLAYER: {
    id: 'CONSISTENT_PLAYER',
    title: 'Consistent Player',
    description: 'Win 10 games in a row',
    icon: '🎯',
    category: 'performance'
  },

  // Milestone achievements
  GAMES_10: {
    id: 'GAMES_10',
    title: 'Getting the Hang of It',
    description: 'Play 10 games',
    icon: '🎮',
    category: 'milestone'
  },
  GAMES_50: {
    id: 'GAMES_50',
    title: 'Wordle Veteran',
    description: 'Play 50 games',
    icon: '🎖️',
    category: 'milestone'
  },
  GAMES_100: {
    id: 'GAMES_100',
    title: 'Wordle Master',
    description: 'Play 100 games',
    icon: '🏆',
    category: 'milestone'
  },
  GAMES_365: {
    id: 'GAMES_365',
    title: 'Year of Words',
    description: 'Play for 365 days',
    icon: '📅',
    category: 'milestone'
  },

  // Special achievements
  WEEKEND_WARRIOR: {
    id: 'WEEKEND_WARRIOR',
    title: 'Weekend Warrior',
    description: 'Win games on 5 consecutive weekends',
    icon: '🌅',
    category: 'special'
  },
  EARLY_BIRD: {
    id: 'EARLY_BIRD',
    title: 'Early Bird',
    description: 'Solve the daily word before 8 AM',
    icon: '🐦',
    category: 'special'
  },
  NIGHT_OWL: {
    id: 'NIGHT_OWL',
    title: 'Night Owl',
    description: 'Solve the daily word after 10 PM',
    icon: '🦉',
    category: 'special'
  }
};

export const checkAchievements = (stats, gameResult) => {
  const newAchievements = [];
  const currentAchievements = stats.achievements || [];

  // Check if achievement already earned
  const hasAchievement = (achievementId) => 
    currentAchievements.some(a => a.id === achievementId);

  // First win
  if (stats.gamesWon === 1 && !hasAchievement('FIRST_WIN')) {
    newAchievements.push({
      ...ACHIEVEMENTS.FIRST_WIN,
      earnedAt: new Date()
    });
  }

  // First streak
  if (stats.currentStreak === 1 && !hasAchievement('FIRST_STREAK')) {
    newAchievements.push({
      ...ACHIEVEMENTS.FIRST_STREAK,
      earnedAt: new Date()
    });
  }

  // Streak milestones
  if (stats.currentStreak >= 3 && !hasAchievement('STREAK_3')) {
    newAchievements.push({
      ...ACHIEVEMENTS.STREAK_3,
      earnedAt: new Date()
    });
  }

  if (stats.currentStreak >= 7 && !hasAchievement('STREAK_7')) {
    newAchievements.push({
      ...ACHIEVEMENTS.STREAK_7,
      earnedAt: new Date()
    });
  }

  if (stats.currentStreak >= 30 && !hasAchievement('STREAK_30')) {
    newAchievements.push({
      ...ACHIEVEMENTS.STREAK_30,
      earnedAt: new Date()
    });
  }

  if (stats.currentStreak >= 100 && !hasAchievement('STREAK_100')) {
    newAchievements.push({
      ...ACHIEVEMENTS.STREAK_100,
      earnedAt: new Date()
    });
  }

  // Perfect game
  if (gameResult && gameResult.guesses === 1 && !hasAchievement('PERFECT_GAME')) {
    newAchievements.push({
      ...ACHIEVEMENTS.PERFECT_GAME,
      earnedAt: new Date()
    });
  }

  // Game count milestones
  if (stats.gamesPlayed >= 10 && !hasAchievement('GAMES_10')) {
    newAchievements.push({
      ...ACHIEVEMENTS.GAMES_10,
      earnedAt: new Date()
    });
  }

  if (stats.gamesPlayed >= 50 && !hasAchievement('GAMES_50')) {
    newAchievements.push({
      ...ACHIEVEMENTS.GAMES_50,
      earnedAt: new Date()
    });
  }

  if (stats.gamesPlayed >= 100 && !hasAchievement('GAMES_100')) {
    newAchievements.push({
      ...ACHIEVEMENTS.GAMES_100,
      earnedAt: new Date()
    });
  }

  return newAchievements;
};

export const getAchievementProgress = (stats) => {
  const progress = {};
  
  // Streak progress
  progress.streak = {
    current: stats.currentStreak || 0,
    next: getNextStreakMilestone(stats.currentStreak || 0),
    percentage: getStreakProgress(stats.currentStreak || 0)
  };

  // Games played progress
  progress.games = {
    current: stats.gamesPlayed || 0,
    next: getNextGameMilestone(stats.gamesPlayed || 0),
    percentage: getGameProgress(stats.gamesPlayed || 0)
  };

  return progress;
};

const getNextStreakMilestone = (currentStreak) => {
  const milestones = [3, 7, 30, 100];
  return milestones.find(m => m > currentStreak) || null;
};

const getNextGameMilestone = (currentGames) => {
  const milestones = [10, 50, 100, 365];
  return milestones.find(m => m > currentGames) || null;
};

const getStreakProgress = (currentStreak) => {
  const next = getNextStreakMilestone(currentStreak);
  if (!next) return 100;
  
  const previous = [3, 7, 30, 100].find(m => m <= currentStreak) || 0;
  return Math.min(100, ((currentStreak - previous) / (next - previous)) * 100);
};

const getGameProgress = (currentGames) => {
  const next = getNextGameMilestone(currentGames);
  if (!next) return 100;
  
  const previous = [10, 50, 100, 365].find(m => m <= currentGames) || 0;
  return Math.min(100, ((currentGames - previous) / (next - previous)) * 100);
}; 