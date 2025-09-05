import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { auth, db } from '../config/firebase';
import { User, AuthContextType } from '../utils/types';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Firebase User to our User type
  const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    // Try to get additional user data from Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || userData.displayName || '',
      photoURL: firebaseUser.photoURL || userData.photoURL || '',
      createdAt: userData.createdAt || new Date(),
      lastLoginAt: new Date(),
    };
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        lastLoginAt: new Date(),
      }, { merge: true });
      
      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific error codes
      switch (error.code) {
        case 'auth/user-not-found':
          toast.error('No account found with this email address.');
          break;
        case 'auth/wrong-password':
          toast.error('Incorrect password.');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address.');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many failed attempts. Please try again later.');
          break;
        default:
          toast.error('Failed to sign in. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Create user document in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: userCredential.user.email,
        displayName: displayName || '',
        photoURL: '',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle specific error codes
      switch (error.code) {
        case 'auth/email-already-in-use':
          toast.error('An account with this email already exists.');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address.');
          break;
        case 'auth/weak-password':
          toast.error('Password should be at least 6 characters.');
          break;
        default:
          toast.error('Failed to create account. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      toast.success('Successfully signed out!');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out.');
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          toast.error('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address.');
          break;
        default:
          toast.error('Failed to send reset email. Please try again.');
      }
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await convertFirebaseUser(firebaseUser);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error converting Firebase user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;