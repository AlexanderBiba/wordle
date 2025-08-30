# 🧩 Wordle

A beautiful, modern Wordle game built with React and Firebase. Features a clean, responsive design with smooth animations, comprehensive statistics tracking, and a beautiful dark mode toggle.

## ✨ Features

- **Modern UI/UX**: Clean, beautiful design with smooth animations and transitions
- **🌙 Dark Mode Toggle**: Beautiful theme switcher with persistent preference
- **Responsive Design**: Optimized for all devices (desktop, tablet, mobile)
- **🏆 Leaderboard System**: Compete with other players across multiple metrics
  - Win rate rankings
  - Best streak competitions
  - Current streak tracking
  - Games played leaderboards
  - Average guesses rankings
- **Statistics Tracking**: 
  - Games played and win percentage
  - Current and maximum streaks
  - Guess distribution visualization
- **Smooth Animations**: Letter flip animations, ripple effects, and smooth transitions
- **Keyboard Integration**: Virtual keyboard with visual feedback
- **Daily Challenges**: New word every day with persistent game state
- **Local Storage**: Game progress, statistics, and theme preference saved locally

## 🎨 Design Features

- **Modern Color Palette**: Beautiful gradients and shadows for both light and dark themes
- **Theme System**: Comprehensive light/dark mode with smooth transitions
- **Smooth Transitions**: CSS animations and micro-interactions
- **Card-based Layout**: Clean, organized interface
- **Typography**: Modern font stack with proper hierarchy
- **Visual Feedback**: Hover effects, focus states, and animations

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Build for production: `npm run build`

## 🛠️ Tech Stack

- **Frontend**: React 18, SCSS
- **Styling**: Modern CSS with custom design system and theme support
- **Animations**: CSS animations and transitions
- **Backend**: Firebase Cloud Functions
- **Deployment**: GitHub Pages

## 🌙 Dark Mode

The app features a beautiful dark mode toggle:
- **Toggle Button**: Located in the header next to the title
- **Persistent Preference**: Your theme choice is saved locally
- **Smooth Transitions**: Beautiful animations when switching themes
- **Comprehensive Coverage**: All components support both themes
- **Accessibility**: Proper contrast ratios for both themes

## 📱 Responsive Design

The app is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🎯 Game Rules

- Guess the 5-letter word in 6 attempts
- Green tiles indicate correct letters in correct positions
- Yellow tiles indicate correct letters in wrong positions
- Gray tiles indicate letters not in the word
- New word available every day

## 🔧 Customization

The design system is built with SCSS variables for easy customization:
- **Color Palette**: `src/_palette.scss` - Light and dark theme colors
- **Animation Settings**: `src/_animation.scss` - Transition timings and keyframes
- **Component Styles**: `src/App.scss` - Main component styling with theme support

## 📊 Statistics & Leaderboards

Track your Wordle performance with:
- Total games played
- Win percentage
- Current streak
- Maximum streak
- Guess distribution chart

**🏆 Leaderboard Features:**
- **Multi-metric Rankings**: View top players by win rate, streaks, games played, and more
- **Real-time Updates**: Leaderboard data updates as players complete games
- **Public Access**: View rankings even without signing in
- **Competitive Spirit**: See how you stack up against other Wordle enthusiasts
- **Beautiful UI**: Modern, responsive leaderboard with smooth animations

## 🌟 Future Enhancements

- Share results functionality
- Practice mode
- Word hints
- Accessibility improvements
- Additional theme options
