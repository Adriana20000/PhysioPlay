import { saveSession } from "../firebase";

/*
 * Saves a game session to the database.
 */
export async function saveGameSession(childUsername, gameName, gameData) {

  const savedData = {
    timestamp: Date.now(),
    name: childUsername,
    game: gameName,
    ...gameData, 
  };

  try {
    await saveSession(childUsername, savedData);
  } catch (err) {
    console.error(err);
  }
}
