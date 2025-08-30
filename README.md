# 🧩 Wordle

A beautiful, modern Wordle game built with React and Firebase. Features a clean, responsive design with smooth animations and comprehensive statistics tracking.

## ✨ Features

- **Modern UI/UX**: Clean, beautiful design with smooth animations and transitions
- **Responsive Design**: Optimized for all devices (desktop, tablet, mobile)
- **Statistics Tracking**: 
  - Games played and win percentage
  - Current and maximum streaks
  - Guess distribution visualization
- **Smooth Animations**: Letter flip animations, ripple effects, and smooth transitions
- **Keyboard Integration**: Virtual keyboard with visual feedback
- **Daily Challenges**: New word every day with persistent game state
- **Local Storage**: Game progress and statistics saved locally

## 🎨 Design Features

- **Modern Color Palette**: Beautiful gradients and shadows
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
- **Styling**: Modern CSS with custom design system
- **Animations**: CSS animations and transitions
- **Backend**: Firebase Cloud Functions
- **Deployment**: GitHub Pages

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
- Color palette in `src/_palette.scss`
- Animation settings in `src/_animation.scss`
- Component styles in `src/App.scss`

## 📊 Statistics

Track your Wordle performance with:
- Total games played
- Win percentage
- Current streak
- Maximum streak
- Guess distribution chart

## 🌟 Future Enhancements

- Dark mode toggle
- Share results functionality
- Practice mode
- Word hints
- Accessibility improvements
