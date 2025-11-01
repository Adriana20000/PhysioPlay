import { useEffect } from "react";
import { checkUserExists, checkAvatarExists} from "../firebase";

/*
* - Checks if the user exists.
* - Skips the check if the username field is empty or contains only spaces.
*/
export function useUserCheck(username, setExists, setChecking, setErrorMessage, setSuccessMessage, mode = "login", delay = 400) {
  useEffect(() => {
    if (!username.trim()) {
        setErrorMessage("");
        setSuccessMessage("");
        return;
    }
    const timeout = setTimeout(async () => {
      setChecking(true);
      const exists = await checkUserExists(username.toUpperCase());
      setExists(exists);
      setChecking(false);
      
      if (mode === "login") {
        if (!exists) setErrorMessage("Username not found");
      } else if (mode === "register") {
        if (exists) setErrorMessage("Username already exists");
        else setSuccessMessage("Username available");
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [username, mode]);
}


/*
* - Checks if the avatar associated with the user exists.
* - Skips the check if the avatar field is empty.
*/
export function useAvatarCheck( avatar, username, setExists, setChecking, setErrorMessage, setSuccessMessage, mode, delay = 400) {
  useEffect(() => {
    if (!avatar.trim() || !username) {
      setErrorMessage("");
      setSuccessMessage("");
      return;
    }
    const timeout = setTimeout(async () => {
        setChecking(true);
        const exists = await checkAvatarExists(username.toUpperCase(), avatar.toUpperCase());
        setExists(exists);
        setChecking(false);
        if (exists) {
            if (mode === "main_screen"){
                setSuccessMessage("Avatar found");
                setErrorMessage("");
            }
            else if (mode === "tablet_screen"){
                setErrorMessage("Avatar name already exists");
                setSuccessMessage("");
            }
        } 
        else {
            if (mode === "main_screen"){
                setErrorMessage("Avatar not found");
                setSuccessMessage("");
            }
            else if (mode === "tablet_screen"){
                setSuccessMessage("Avatar name available")
                setErrorMessage("");
            }
        }
    }, delay);

    return () => clearTimeout(timeout);
  }, [username, avatar]);
}