import { initializeApp} from "firebase/app";
import { getDatabase, ref, set, get, push} from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoAVrIxxcziBjOi_SWJ9SH7MIG_nhHhfY",
  authDomain: "physioplay-c0bb6.firebaseapp.com",
  databaseURL: "https://physioplay-c0bb6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "physioplay-c0bb6",
  storageBucket: "physioplay-c0bb6.firebasestorage.app",
  messagingSenderId: "1059279294899",
  appId: "1:1059279294899:web:3a6b9d827b5da698d8bbc6"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);


// Add session results
export const saveSession = async (childUsername, savedData) => {
  if (!childUsername) return;
  const userRef = ref(db, `children/${childUsername}/savedSessions`);
  const newSessionRef = push(userRef);
  try {
    await set(newSessionRef, savedData);
    return true; 
  } catch (err) {
    console.error("Saving error:", err);
    throw err;
  }
};

// Check if a user exists in the database
export const checkUserExists = async (username) => {
  const userRef = ref(db, `users/${username}`);
  const snapshot = await get(userRef);
  return snapshot.exists();
};

// Check if an avatar exists for a user
export const checkAvatarExists = async (username, avatarName) => {
  const avatarRef = ref(db, `users/${username}/avatars/${avatarName}`);
  const snapshot = await get(avatarRef);
  return snapshot.exists();
};

// Save avatar data to the database
export const saveAvatar = async (username, avatarName, drawingData) => {
  const avatarRef = ref(db, `users/${username}/avatars/${avatarName}`);
  await set(avatarRef, {
    name: avatarName,
    drawing: drawingData,
    createdAt: Date.now()
  });
};

// Recover avatar drawings
export const getAvatarDrawing = async (username, avatar) => {
  const drawingRef = ref(db, `users/${username}/avatars/${avatar}`);
  const snapshot = await get(drawingRef);
  const data = snapshot.val();
  return data?.drawing || null; 
}; 

// Recover session results
export const getSavedSessions = async (username) => {
  const userRef = ref(db, `children/${username}/savedSessions`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    const arr = Object.values(snapshot.val()).sort((a, b) => b.timestamp - a.timestamp);
    return arr;
  }
  return [];
};