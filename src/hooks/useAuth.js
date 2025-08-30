import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Get or create user stats
        await getUserStats(user.uid);
      } else {
        setUser(null);
        setUserStats(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create or update user profile
      await createUserProfile(user);
      
      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const createUserProfile = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        lastLogin: new Date(),
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          maxStreak: 0,
          totalGuesses: 0,
          averageGuesses: 0,
          bestTime: null,
          achievements: [],
          guessDistribution: Array(6).fill(0)
        }
      };
      
      await setDoc(userRef, userProfile);
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
    }
  };

  const getUserStats = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUserStats(userSnap.data().stats);
      }
    } catch (error) {
      console.error('Error getting user stats:', error);
    }
  };

  const updateUserStats = async (newStats) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        stats: newStats
      });
      
      setUserStats(newStats);
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  return {
    user,
    userStats,
    loading,
    signInWithGoogle,
    signOutUser,
    updateUserStats
  };
}; 