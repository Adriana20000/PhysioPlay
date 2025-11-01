import { useEffect, useState } from "react";
import pemmyGreetings from "../assets/pemmy_greetings.mp4";
import pemmyTalking from "../assets/pemmy_talking.mp4";
import {useEyes} from "../hooks/useEyes";
import eyesOpen from "../assets/eyes_op.png";
import eyesClosed from "../assets/eyes_clos.png";
import "../pages/Home.css";

/*
 * Returns the correct avatar message based on the game state.
 *
 * - If a game is selected -> shows the avatar message for that game.
 * - When hovering a game -> shows the benefit/description.
 * - Otherwise -> shows a default greeting message.
 */
function getAvatarMessage(selectedGame, hoveredGame, username, avatar) {
  if (selectedGame) return selectedGame.avatarMessage;
  if (hoveredGame) return hoveredGame.benefit;
  return "Hi " + username + ", I'm " + avatar + "! Please choose a game to start.";
}

/*
 * AvatarBox Component:
 *
 * Displays the user's avatar (or default video) along with a speech bubble 
 * that reacts dynamically based on game selection or hover state.
 * 
 * Props:
 *    selectedGame (object): Game currently selected by the user or null.
 *    hoveredGame (object): Game currently hovered by the user or null.
 *    childUsername (string): Username of the user.
 *    childDrawing (base64): Image data of the avatar drawing or default.
 *    avatar (string): Avatar name.  
 */
function AvatarBox({selectedGame, hoveredGame, childUsername, childDrawing, avatar}) {
  const [isTalking, setIsTalking] = useState(false);
  const [message, setMessage] = useState("");
  const [videoSrc, setVideo] = useState("");
  const eyesOpenState = useEyes();
  
  /*
   * Updates the avatar message and animation when the user hovers
   * or selects a game. Default Pemmy's video switches to "talking mode" when
   * interacting with game elements, and returns to idle otherwise.
   */
  useEffect(() => {
    const newMessage = getAvatarMessage(selectedGame, hoveredGame, childUsername, avatar);
    setMessage(newMessage);
    if (avatar === "PEMMY" && (selectedGame || hoveredGame)) {
      setIsTalking(true);
      setVideo(pemmyTalking);
      const timeout = setTimeout(() => 
        setIsTalking(false), 1600);
        return () => clearTimeout(timeout);
      } 
    else {
      setVideo(pemmyGreetings);
    }
  }, [selectedGame, hoveredGame, childUsername, avatar]);
  
  
  return (
    <div className="avatar-box">

      {/* Shows Avatar drawing or default video */}
      {childDrawing ? (
        <div className="avatar-media" style={{ backgroundColor: "#EEE5E9", position: "relative" }}>
          <img
            src={childDrawing}
            alt="Child Avatar"
            className="pemmy-video"
          />
          <img
            src={eyesOpenState ? eyesOpen : eyesClosed}
            alt="eyes"
            className="eyes-overlay-avatar"
          />
        </div>
      ) : (
        <div
          className={"avatar-media " + (isTalking ? "talking" : "")}
        >
          <video src={videoSrc} autoPlay loop muted playsInline className="pemmy-video"/>
        </div>
      )}

      {/* Avatar bubble speech */}
      <div className="avatar-bubble-speech">
        <p>{message}</p>
      </div>
    </div>
  );
}

export default AvatarBox;