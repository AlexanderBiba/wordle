# 🔥 Firebase Setup Guide

To enable user authentication and cloud features in your Wordle app, you'll need to configure Firebase.

## 📋 Prerequisites

1. A Google account
2. Firebase project (can be created for free)

## 🚀 Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "wordle-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click "Google" and enable it
5. Add your authorized domain (localhost for development)
6. Click "Save"

### 3. Enable Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### 4. Get Firebase Config

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname
6. Copy the firebaseConfig object

### 5. Update Your App

1. Open `src/firebase.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### 6. Set Firestore Rules

In your Firebase console, go to Firestore Database > Rules and update them to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔧 Development vs Production

### Development
- Use Firebase emulators for local development
- Your current `firebase.json` already has emulator config
- Run `firebase emulators:start` to start local emulators

### Production
- Deploy your Firebase functions: `firebase deploy --only functions`
- Update your app to use production Firebase URLs
- Set proper security rules

### Leaderboard Function

The leaderboard feature requires the `getLeaderboard` function to be deployed:

1. **Deploy Functions**: Run `firebase deploy --only functions` from your project root
2. **Function URL**: The leaderboard will automatically use the deployed function URL
3. **Data Access**: The function reads from the `users` collection to generate rankings
4. **Security**: Only public read access is needed for leaderboard data

**Note**: The leaderboard function aggregates user statistics to create rankings. Make sure your Firestore rules allow reading user data for leaderboard purposes.

## 🎯 Features You'll Get

Once configured, your app will have:

- ✅ **Google Sign-In**: One-click authentication
- ✅ **User Profiles**: Persistent user data
- ✅ **Cloud Statistics**: Stats saved across devices
- ✅ **Achievement System**: Badges and milestones
- ✅ **Progress Tracking**: Detailed performance metrics
- ✅ **Social Features**: Share results and compete
- ✅ **🏆 Leaderboard System**: Real-time player rankings

## 🚨 Security Notes

- Never commit your Firebase config to public repositories
- Use environment variables for production
- Set appropriate Firestore security rules
- Monitor your Firebase usage (free tier is generous)

## 🆘 Troubleshooting

### Common Issues:
1. **"Firebase not initialized"**: Check your config values
2. **"Permission denied"**: Verify Firestore security rules
3. **"Auth domain not authorized"**: Add your domain to authorized domains

### Need Help?
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)

## 🎉 Next Steps

After setup, you can:
1. Test authentication locally
2. Add more social features
3. Implement global leaderboards
4. Add friend systems
5. Create achievement challenges

Your Wordle app will be transformed into a full social gaming experience! 🎮✨ 