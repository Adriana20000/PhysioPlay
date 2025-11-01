import {useEffect, useState, useRef} from "react";
import {useAvatarDrawing} from "../hooks/useAvatarDrawing";
import {useEyes} from "../hooks/useEyes";
import {FaPause} from "react-icons/fa";
import eyesOpen from "../assets/eyes_op.png";
import eyesClosed from "../assets/eyes_clos.png";
import pemmyTalking from "../assets/pemmy_talking.mp4";
import TopBar from "../components/TopBar";
import {FaRedo} from "react-icons/fa";

import doodleBottomRight from "../assets/doodle-bottom-right.png";
import doodleBottomLeft from "../assets/doodle-bottom-left.png";
import "./GameLayout.css";


/*
 * GameLayout Component:
 * 
 * Receives specific props from the game components (Game1.js, Game2.js, Game3.js).
 * 
 * Props:
 *   gameId (number): Game identifier.
 *   gameTitle (string): Title of the selected game.
 *   statusItems (array): List of game element values.
 *   gameState (string): Current game state (preparing, countdown, playing, paused, gameover).
 *   countdown (number): Time before to start.
 *   onPause (function): Callback to pause the game.
 *   onResume (function): Callback to resume the game.
 *   onRestart (function): Callback to restart the game.
 *   onQuit (function): Callback to quit the game and navigate back home.
 *   resultsTable (array): Table of results to display after game session.
 *   onSaveResults (function): Callback to save game results.
 *   helpText: Game instructions.
 *   children: React elements representing game canvas or video.
 *
 */

function GameLayout({gameId, gameTitle, statusItems = [], gameState, countdown, onPause, onResume, onRestart, onQuit, resultsTable, 
                      onSaveResults, helpText, children}) {
  const [pauseSubState, setPauseSubState] = useState("menu");
  const videoBoxRef = useRef(null);

  const [userLevel, setUserLevel] = useState("");
  const [userTimer, setUserTimer] = useState("");
  const [numClouds, setNumClouds] = useState(null);
  const [numObstacles, setNumObstacles] = useState(null);

  const childUsername = sessionStorage.getItem("childUsername");
  const avatar = sessionStorage.getItem("childAvatar");
  const childDrawing = useAvatarDrawing(childUsername, avatar);
  const [hasSaved, setHasSaved] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const eyesOpenState = useEyes();

  
  /*
  * Loads stored game data from sessionStorage depending on selected game:
  *   - Game 1: Star Game -> level and timer.
  *   - Game 2: Balloon Game -> number of clouds.
  *   - Game 3: Avoid the Obstacles -> number of obstacles.
  */
  useEffect(() => {
    if (gameId === 1) {
      setUserLevel(sessionStorage.getItem("starGameLevel"));
      setUserTimer(sessionStorage.getItem("starGameTimer"));
    } 
    else if (gameId === 2) {
      setNumClouds(sessionStorage.getItem("game2NumClouds"));
    } 
    else if (gameId === 3) {
      setNumObstacles(sessionStorage.getItem("game3NumObstacles"));
    }
  }, [gameId]);

  /* 
   * Pause the camera when game is over, resume when entering "playing".
  */
  useEffect(() => {
    if (gameState === "gameover") {
      pauseCamera();
    } else if (gameState === "playing") {
      playCamera();
    }
  }, [gameState]);


  /* 
   * Pause the <video> element inside video-box container.
   */
  const pauseCamera = () => {
    const root = videoBoxRef.current;
    if (!root) return;
    const vid = root.querySelector("video"); 
    try {
      vid?.pause();
    } catch (e) {}
  };

  /*
  * Resume the <video> element inside video-box container.
  */
  const playCamera = async () => {
    const root = videoBoxRef.current;
    if (!root) return;
    const vid = root.querySelector("video");
    try {
      await vid?.play();
    } catch (e) {}
  };


  return (
    <>
      {/* Top Bar */}
      <TopBar childUsername={sessionStorage.getItem("childUsername")} />

      <div className="game-container">

        {/* === Left Column === */}
        <div className="gl-left-column">

          {/* Avatar Box */}
          <div className="gl-avatar-box" style={{backgroundColor: childDrawing ? "#EEE5E9" : "rgba(0, 255, 204, 0.05)",}}>

            {/* Avatar drawing or default video  */}
            {childDrawing ? (
              <div className="gl-avatar-media">
                <img
                  src={childDrawing}
                  alt="Child Avatar"
                  className="avatar-drawing"
                />
                <img
                  src={eyesOpenState ? eyesOpen : eyesClosed}
                  alt="eyes"
                  className="eyes-overlay-avatar"
                />
              </div>
            ) : (
              <video src={pemmyTalking} autoPlay loop muted playsInline className="pemmy-talking"/>
            )}
          </div>
        </div>

        {/* === Center Column === */}
        <div className="gl-center-column">
          <div className="video-box" ref={videoBoxRef}>

            {/* Game video */}
            {children}

            {/* Overlays */}
            {(gameState === "preparing" ||
              gameState === "countdown") && (
              <div className="veil">
                <div className="center-overlay-text">
                  {gameState === "preparing" && (<p>Position yourself at the center of the screen to start</p>)}
                  {gameState === "countdown" && (<h1 className="countdown-text">{countdown}</h1>)}
                </div>
              </div>
            )}

            {/* Pause button  */}
            {(gameState === "playing" || gameState === "preparing") && (
              <button
                className="pause-button"
                onClick={() => {
                  setPauseSubState("menu");
                  pauseCamera();
                  onPause();
                }}
              >
                <FaPause/>
              </button>
            )}

            {/* Pause Menu */}
            {gameState === "paused" && (
              <div className="pause-overlay">
                {pauseSubState === "menu" && (
                  <>
                    <h2>Pause</h2>
                    <button className="pause-menu-button" onClick={() => {
                        playCamera(); 
                        onResume();
                      }}>Resume</button>
                    <button className="pause-menu-button" onClick={onRestart}>Restart</button>
                    <button className="pause-menu-button quit"onClick={() => setPauseSubState("confirmQuit")}>Quit</button>
                  </>
                )}
                
                {/* Confirm quit menu */}
                {pauseSubState === "confirmQuit" && (
                  <>
                    <h2>Quit Game?</h2>
                    <p style={{ color: "#EEE5E9", marginBottom: "2vh" }}>Your current progress will be lost.</p>
                    <div style={{ display: "flex", gap: "3vw", justifyContent: "center" }}>
                      <button className="pause-menu-button quit" onClick={onQuit}>Yes</button>
                      <button className="pause-menu-button" onClick={() => setPauseSubState("menu")}>No</button>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
            
          {/* == Game Over === */}
          {gameState === "gameover" && (
            <div className="game-results-overlay">

              {/* Results */}
              <div className="game-results-card">
                <h2 className="game-results-header">Results</h2>
                <div className="game-results-divider" />

                {/* Summary section */}
                <div className="game-results-summary">
                  {gameId === 1 && (
                    <p>
                      <strong>Score:</strong> {statusItems.find(i => i.label === "Score")?.value ?? "—"} |
                      <strong> Level:</strong> {userLevel || "—"} |
                      <strong> Duration:</strong> {userTimer ? userTimer + "s" : "—"}
                    </p>
                  )}
                  {gameId === 2 && <p><strong>Number of Clouds:</strong> {numClouds ?? "—"}</p>}
                  {gameId === 3 && <p><strong>Number of Obstacles:</strong> {numObstacles ?? "—"}</p>}
                </div>

                {/* Results table */}
                {resultsTable ? resultsTable : <p className="game-results-noData">No data available.</p>}
                
                
                <div className="game-results-buttons">

                  {/* Quit button */}
                  <button className="game-results-btn-exit" onClick={onQuit}>Quit</button>
                  
                  {/* Save button */}
                  <button
                    className="game-results-btn-save"
                    disabled={hasSaved}
                    onClick={() => {
                      if (!hasSaved) {
                        onSaveResults(resultsTable);
                        setHasSaved(true);
                        setShowSaveMessage(true);
                        setTimeout(() => setShowSaveMessage(false), 2500);
                      }
                    }}
                  >
                    {hasSaved ? "Saved" : "Save"}
                  </button>

                  {/* Retry button */}
                  <button className="game-results-btn-retry" onClick={onRestart}><FaRedo/> Retry</button>

                </div>

                {/* Successful save message */}
                {showSaveMessage && (<div className="saveMessage">Results successfully saved!</div>)}

              </div>
            </div>

          )}

        </div>

        {/* === Right Column === */}
        <div className="gl-right-column">

          {/* Status box */}
          <div className="status-box">
            {statusItems.map((item, i) => (
              <div key={i} className="status-item">
                {item.label}: {item.value}
              </div>
            ))}
          </div>

          {/* Game Rules box */}
          <div className="help-box">
            <h2 className="game-title">{gameTitle}</h2>
            <div className="gl-game-rules"> {helpText || <p>No help text provided for this game.</p>}</div>
          </div>
        </div>

        {/* Background doodles */}
        <img src={doodleBottomLeft} alt="doodle bottom left" className="doodle-bottom-left" />
        <img src={doodleBottomRight} alt="doodle bottom right" className="doodle-bottom-right" />

      </div>
    </>
  );
}

export default GameLayout;
