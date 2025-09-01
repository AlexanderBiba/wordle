# 🧩 Wordle - Progressive Web App

A modern, feature-rich Wordle game built with React, Firebase, and PWA capabilities. Experience the classic word puzzle game with achievements, leaderboards, social features, and full offline support.

![Wordle Game](https://img.shields.io/badge/Wordle-Daily%20Challenge-blue?style=for-the-badge&logo=react)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge&logo=pwa)
![React](https://img.shields.io/badge/React-18.1.0-blue?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange?style=for-the-badge&logo=firebase)

## ✨ Features

### 🎮 Core Gameplay
- **Daily Word Challenge**: New 5-letter word every day
- **6 Attempts**: Strategic guessing with color-coded feedback
- **Smart Keyboard**: Visual feedback for letter status
- **Responsive Design**: Optimized for all devices

### 🏆 Achievement System
- **Milestone Badges**: Unlock achievements for streaks and wins
- **Progress Tracking**: Visual progress bars for next milestones
- **Category System**: Organized by milestone, streak, performance, and special
- **Earned History**: Track when and how you earned each badge

### 📊 Advanced Statistics
- **Win Percentage**: Track your success rate
- **Streak Counter**: Current and maximum winning streaks
- **Guess Distribution**: Visual breakdown of your solving patterns
- **Average Guesses**: Performance metrics over time

### 🌐 Social Features
- **Leaderboards**: Compete with friends across multiple metrics
- **User Profiles**: Detailed stats and achievement showcases
- **Google Authentication**: Secure sign-in with Google accounts
- **Real-time Updates**: Live leaderboard and stats synchronization

### 📱 Progressive Web App (PWA)
- **Offline Play**: Full game functionality without internet
- **Installable**: Add to home screen on any device
- **Push Notifications**: Daily reminders and game updates
- **Background Sync**: Automatic data synchronization
- **App-like Experience**: Native app feel in the browser

### 🎨 Modern UI/UX
- **Dark/Light Mode**: Toggle between themes
- **Smooth Animations**: Polished interactions and transitions
- **Sequential Ripple Wave Effect**: Beautiful wave animation that flows from letters to keyboard on app load
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Accessibility**: ARIA labels and keyboard navigation
- **Modern Design**: Clean, intuitive interface

## 🚀 PWA Capabilities

### 📱 Installation
- **Add to Home Screen**: Install on mobile and desktop
- **Standalone Mode**: Runs in its own window
- **App Icons**: Custom icons for all platforms
- **Splash Screen**: Professional app launch experience

### 🔄 Offline Functionality
- **Service Worker**: Intelligent caching strategies
- **Offline Gameplay**: Play without internet connection
- **Data Persistence**: Local storage for game state
- **Background Sync**: Automatic updates when online

### 📲 Mobile Experience
- **Touch Optimized**: Designed for touch interfaces
- **Responsive Layout**: Adapts to all screen sizes
- **Native Feel**: App-like navigation and interactions
- **Performance**: Optimized for mobile devices

## 🛠️ Technology Stack

### Frontend
- **React 18.1.0**: Modern React with hooks and functional components
- **SCSS**: Advanced CSS with variables and mixins
- **Progressive Web App**: Service workers and web app manifest
- **Responsive Design**: Mobile-first approach

### Backend & Services
- **Firebase 10.7.1**: Authentication, database, and hosting
- **Firestore**: Real-time NoSQL database
- **Google Auth**: Secure user authentication
- **Cloud Functions**: Serverless backend logic

### Development Tools
- **Create React App**: Modern build tooling
- **ESLint**: Code quality and consistency
- **Sass**: Advanced CSS preprocessing
- **GitHub Actions**: Automated deployment

## 📱 Installation & Setup

### For Users

#### Web Browser
1. Visit [Wordle Game](https://alexanderbiba.github.io/wordle)
2. Start playing immediately - no installation required!

#### Install as PWA
1. **Chrome/Edge**: Click the install icon in the address bar
2. **Safari**: Use "Add to Home Screen" from the share menu
3. **Mobile**: Look for the "Add to Home Screen" prompt

### For Developers

#### Prerequisites
- Node.js 16+ and npm
- Firebase project setup
- Google Cloud account

#### Local Development
```bash
# Clone the repository
git clone https://github.com/AlexanderBiba/wordle.git
cd wordle

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your Firebase configuration

# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

#### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 🎯 How to Play

### Basic Rules
1. **Guess the Word**: You have 6 attempts to guess a 5-letter word
2. **Color Feedback**: 
   - 🟩 Green: Letter is correct and in right position
   - 🟨 Yellow: Letter is correct but in wrong position
   - ⬜ Gray: Letter is not in the word
3. **Strategic Guessing**: Use feedback to narrow down possibilities
4. **Daily Challenge**: New word every day at midnight UTC

### Tips for Success
- Start with common letters (E, A, R, T, O)
- Use feedback to eliminate possibilities
- Consider letter frequency in English
- Don't waste guesses on impossible combinations

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Leaderboard.js  # Leaderboard modal
│   └── UserProfile.js  # User profile modal
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Authentication logic
│   ├── useGameState.js # Game state management
│   ├── usePWA.js       # PWA functionality
│   └── ...             # Other game hooks
├── _animation.scss     # Animation definitions
├── _palette.scss       # Color variables
├── App.js              # Main application component
├── App.scss            # Main styles
└── firebase.js         # Firebase configuration
```

### Key Features Implementation

#### PWA Integration
- **Service Worker**: `/public/sw.js` handles offline functionality
- **Web App Manifest**: `/public/manifest.json` defines PWA properties
- **PWA Hook**: `usePWA()` manages installation and updates

#### Game Logic
- **State Management**: Custom hooks for game state and statistics
- **Firebase Integration**: Real-time data synchronization
- **Achievement System**: Automated badge unlocking

#### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Flexible Layout**: Adapts to all screen sizes
- **Touch Friendly**: Optimized for touch interfaces

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Performance & Optimization

### Bundle Size
- **JavaScript**: ~204KB (gzipped)
- **CSS**: ~6.6KB (gzipped)
- **Total**: Optimized for fast loading

### PWA Performance
- **Lighthouse Score**: 90+ across all categories
- **First Contentful Paint**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Offline Support**: Full functionality without internet

### Optimization Techniques
- **Code Splitting**: Lazy loading for non-critical components
- **Service Worker Caching**: Intelligent asset caching
- **Image Optimization**: Compressed and responsive images
- **CSS Optimization**: Purged unused styles

## 🌟 What Makes This Special

### 🚀 Modern Architecture
- Built with the latest React patterns and hooks
- Comprehensive PWA implementation
- Real-time Firebase integration
- Professional-grade code quality

### 🎨 Beautiful Design
- Modern, clean interface design
- Smooth animations and transitions
- Dark/light theme support
- Responsive across all devices

### 🔒 Enterprise Features
- Secure Google authentication
- Real-time data synchronization
- Comprehensive error handling
- Performance monitoring

### 📱 PWA Excellence
- Full offline functionality
- Native app installation
- Push notification support
- Background synchronization

## 🚀 Deployment

### GitHub Pages (Recommended)
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Deploy to GitHub Pages
npm run deploy
```

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting

# Deploy
firebase deploy
```

## 📈 Roadmap

### 🎯 Upcoming Features
- [ ] **Multiplayer Mode**: Real-time competitive play
- [ ] **Custom Word Lists**: Create and share word sets
- [ ] **Advanced Analytics**: Detailed performance insights
- [ ] **Social Sharing**: Share results on social media
- [ ] **Achievement Leaderboards**: Compete for badges

### 🔧 Technical Improvements
- [ ] **Performance Monitoring**: Real-time performance metrics
- [ ] **A/B Testing**: Feature experimentation framework
- [ ] **Internationalization**: Multi-language support
- [ ] **Accessibility**: Enhanced screen reader support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork and clone the repository
2. Install dependencies with `npm install`
3. Set up Firebase configuration
4. Start development server with `npm start`
5. Make your changes and submit a PR

### Code Standards
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Include tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Wordle Original**: Inspired by the original Wordle game
- **React Community**: For the amazing React ecosystem
- **Firebase Team**: For excellent backend services
- **PWA Community**: For progressive web app standards

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/AlexanderBiba/wordle/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AlexanderBiba/wordle/discussions)
- **Live Demo**: [Play Wordle](https://alexanderbiba.github.io/wordle)

---

**Made with ❤️ by the Wordle Team**

*Experience the future of word games with our Progressive Web App!*
