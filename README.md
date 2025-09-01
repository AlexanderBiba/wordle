# Wordle Game

A modern, feature-rich Wordle game built with React and Firebase, featuring achievements, leaderboards, and social features.

## Features

- **Daily Wordle Game**: Classic 5-letter word guessing with 6 attempts
- **User Authentication**: Google Sign-In integration
- **Achievement System**: Unlock badges for milestones and performance
- **Leaderboards**: Compete with other players across multiple metrics
- **Game Statistics**: Track your performance with detailed analytics
- **Dark/Light Mode**: Toggle between themes
- **Progressive Web App**: Installable on mobile and desktop devices
- **Real-time Updates**: Live leaderboard and game state synchronization

## Technology Stack

- **Frontend**: React 18, SCSS
- **Backend**: Firebase (Authentication, Firestore)
- **Cloud Functions**: Google Cloud Functions for word validation and leaderboards
- **Deployment**: GitHub Pages
- **Build Tool**: Create React App

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Firebase project with Firestore database
- Google Cloud Functions setup

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AlexanderBiba/wordle.git
cd wordle
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Deploy Cloud Functions:
```bash
cd functions
npm install
firebase deploy --only functions
```

5. Start the development server:
```bash
npm start
```

## Deployment

The app is configured for deployment to GitHub Pages:

```bash
npm run build:gh-pages
npm run deploy
```

## Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── achievements.js     # Achievement system
├── constants.js        # Game constants
├── firebase.js         # Firebase configuration
└── App.js              # Main application component

functions/
├── index.js            # Cloud Functions
└── words.js            # Word dictionary
```

## Game Rules

- Guess the 5-letter word in 6 attempts
- Green tile: Letter is correct and in the right position
- Yellow tile: Letter is in the word but wrong position
- Gray tile: Letter is not in the word
- One new word per day for authenticated users

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Author

**Alexander Biba**
