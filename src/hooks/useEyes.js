import { useEffect, useState } from "react";


/*
* Makes the avatar blink its eyes.
*/
export const useEyes = (minDelay = 4000, maxDelay = 6000) => {
  const [eyesOpenState, setEyesOpenState] = useState(true);

  useEffect(() => {
    const eyes_interval = setInterval(() => {
      setEyesOpenState(false);
      setTimeout(() => setEyesOpenState(true), 150);
    }, minDelay + Math.random() * (maxDelay - minDelay));

    return () => clearInterval(eyes_interval);
  }, [minDelay, maxDelay]);

  return eyesOpenState;
}