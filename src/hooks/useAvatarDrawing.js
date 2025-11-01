import { useState, useEffect } from "react";
import { getAvatarDrawing } from "../firebase";



/*
* Loads the drawing of a user's avatar from Firebase.
*/
export const useAvatarDrawing = (username, avatar) => {
  const [drawing, setDrawing] = useState(null);

  useEffect(() => {
    if (!username || !avatar) return;

    const fetchDrawing = async () => {
      try {
        const data = await getAvatarDrawing(username, avatar);
        setDrawing(data);
      } catch (err) {
        console.error(err);
        setDrawing(null);
      }
    };

    fetchDrawing();
  }, [username, avatar]);

  return drawing;
};
