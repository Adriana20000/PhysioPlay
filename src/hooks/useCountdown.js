
import { useState } from "react";

/*
* Manages a countdown before starting the game.
*/
export function useCountdown(initialCount = 3) {
  const [countdown, setCountdown] = useState(null);
  const [isCounting, setIsCounting] = useState(false);

  function start(setGameState) {
    setGameState("countdown");
    let count = initialCount;
    setCountdown(count);
    setIsCounting(true);

    const interval = setInterval(() => {
      count--;
      if (count > 0) setCountdown(count);
      else {
        clearInterval(interval);
        setCountdown(null);
        setIsCounting(false);
        setGameState("playing");
      }
    }, 1000);
  }

  return { countdown, isCounting, start };
}
