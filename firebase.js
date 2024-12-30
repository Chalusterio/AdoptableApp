import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBbHDVj0AtAEeMQvwrUQnKKYq9NJdJ2q0A",
  authDomain: "adoptable-bca5b.firebaseapp.com",
  projectId: "adoptable-bca5b",
  storageBucket: "adoptable-bca5b.firebasestorage.app",
  messagingSenderId: "819583583252",
  appId: "1:819583583252:web:dd840cdfa648b854abd301",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

// Function to persist session data
export const persistSession = async (user) => {
  try {
    const sessionData = JSON.stringify(user);
    await AsyncStorage.setItem('userSession', sessionData);
    console.log('User session saved');
  } catch (error) {
    console.error('Error saving session: ', error);
  }
};

// Function to retrieve session data
export const getSession = async () => {
  try {
    const sessionData = await AsyncStorage.getItem('userSession');
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Error retrieving session: ', error);
    return null;
  }
};

// Function to clear session data
export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem('userSession');
    console.log('User session cleared');
  } catch (error) {
    console.error('Error clearing session: ', error);
  }
};

// Function to register a user and save their data in Firestore, now including role
export const registerUser = async (email, password, name, contactNumber, role) => {
  try {
    // Register user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save additional user data in Firestore
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      name,
      email,
      contactNumber,
      role,  // Add the role field
      createdAt: new Date(),
    });

    // Persist session in AsyncStorage
    await persistSession(user);

    console.log("User registered and data saved to Firestore");
    return user;  // Return the user object
  } catch (error) {
    console.error("Error registering user: ", error.message);
    throw error;
  }
};

// Function to log in a user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await persistSession(user);

    console.log("User logged in:", user);
  } catch (error) {
    console.error("Error logging in user: ", error.message);
    throw error;
  }
};

// Function to sign out the user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    await clearSession();
    console.log("User logged out");
  } catch (error) {
    console.error("Error logging out user: ", error.message);
    throw error;
  }
};

// Function to fetch user data from Firestore
export const getUserData = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data: ", error.message);
    throw error;
  }
};

export { auth, db, signInWithEmailAndPassword, signOut };
