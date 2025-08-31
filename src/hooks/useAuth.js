import { useState, useEffect, useCallback } from 'react';
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
import { DEFAULT_STATS } from '../constants';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);

  const getUserStats = useCallback(async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUserStats(userSnap.data().stats);
      } else {
        // User document doesn't exist (e.g., deleted from Firestore)
        // Set default stats to prevent null reference errors
        setUserStats(DEFAULT_STATS);
      }
    } catch (error) {
      console.error('Error getting user stats:', error);
      // Set default stats on error as well
      setUserStats(DEFAULT_STATS);
    }
  }, []);

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
  }, [getUserStats]);

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

  const createUserProfile = useCallback(async (user) => {
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
        stats: DEFAULT_STATS
      };
      
      await setDoc(userRef, userProfile);
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
    }
  }, []);

  const updateUserStats = useCallback(async (newStats) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        stats: newStats
      });
      
      // Update local state immediately for real-time UI updates
      setUserStats(newStats);
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }, [user]);

  return {
    user,
    userStats,
    loading,
    signInWithGoogle,
    signOutUser,
    updateUserStats
  };
}; 