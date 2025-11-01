import { useEffect } from "react";

/*
 * Sets the starting score and updates the game state.
*/
export function useGameSetup({ gameState, gameStateRef, setScore, initialScore }) {
  useEffect(() => {
    if (setScore && initialScore !== undefined) {
      setScore(initialScore);
    }
  }, [initialScore, setScore]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState, gameStateRef]);
}
