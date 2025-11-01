import {useLayoutEffect, useRef, useState, useEffect} from "react";
import {saveAvatar} from "../firebase";
import {useUserCheck, useAvatarCheck} from "../hooks/useLoginCheck";
import {useEyes} from "../hooks/useEyes";
import eyesOpen from "../assets/eyes_op.png";
import eyesClosed from "../assets/eyes_clos.png";
import doodleLeft from "../assets/doodle-left.png";
import doodleRight from "../assets/doodle-right.png";
import {FaChevronCircleLeft, FaTimesCircle, FaPaintBrush, FaEraser, FaUndoAlt, FaRedoAlt, FaTrash} from "react-icons/fa";
import {FiSave } from "react-icons/fi";
import Lottie from "lottie-react";
import rotateAnimation from "../assets/rotate-tablet.json";
import "./TabletDraw.css";
import "../utils/utils.css";

/*
 * Allows users to create and save a personalized avatar by drawing on a tablet device.
 * Includes user authentication and avatar creation.
 */
function TabletDraw() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [phase, setPhase] = useState("auth"); 
  const [activeTool, setActiveTool] = useState("brush");

  // Authentication
  const [username, setUsername] = useState("");
  const [userExists, setUserExists] = useState(null);
  const [checking, setChecking] = useState(false);
  const [confirmedUser, setConfirmedUser] = useState(null);
  const [mode, setMode] = useState("login"); 

  // Avatar
  const [avatarName, setAvatarName] = useState("");
  const [avatarExists, setAvatarExists] = useState(null);
  const [confirmedAvatar, setConfirmedAvatar] = useState("");

  // Drawing
  const [drawing, setDrawing] = useState(false);
  const eyesOpenState = useEyes();
  const [color, setColor] = useState("#000000");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [brushSize, setBrushSize] = useState(2); 

  // Success Popup
  const [showPopup, setShowPopup] = useState(false);

  // Validation messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [avatarErrorMessage, setAvatarErrorMessage] = useState("");
  const [avatarSuccessMessage, setAvatarSuccessMessage] = useState("");


   /*
   * Updates the drawing context whenever the brush size changes.
   */
  useEffect(() => {
    if (ctxRef.current) ctxRef.current.lineWidth = brushSize;
  }, [brushSize]);


  /*
   * Saves the current canvas state as an image.
   * Used for undo/redo functionality.
   */
  const saveState = () => {
    const data = canvasRef.current.toDataURL();
    setUndoStack((prev) => [...prev, data]);
    setRedoStack([]); 
  };

  /*
   * Restores the previous canvas state.
   */
  const undo = () => {
    if (undoStack.length <= 1) return;
    const newUndo = [...undoStack];
    const current = newUndo.pop();
    const last = newUndo[newUndo.length - 1];
    setUndoStack(newUndo);
    setRedoStack((prev) => [...prev, current]);

    const img = new Image();
    img.src = last;
    img.onload = () => {
      ctxRef.current.globalCompositeOperation = "source-over";
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctxRef.current.drawImage(img, 0, 0);
      updateHasDrawn();
    };
    setActiveTool("brush");
  };

  /*
   * Reapplies the next canvas state.
   */
  const redo = () => {
    if (redoStack.length === 0) return;
    const newRedo = [...redoStack];
    const next = newRedo.pop();
    setRedoStack(newRedo);
    setUndoStack((prev) => [...prev, next]);

    const img = new Image();
    img.src = next;
    img.onload = () => {
      ctxRef.current.globalCompositeOperation = "source-over";
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctxRef.current.drawImage(img, 0, 0);
      updateHasDrawn();
    };
    setActiveTool("brush");
  };

  /*
   * Checks if the canvas is currently empty.
   */
  const isCanvasEmpty = () => {
    const canvas = canvasRef.current;
    if (!canvas) return true;

    const ctx = canvas.getContext("2d");
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] !== 0) return false;
    }
    return true;
  };

  const updateHasDrawn = () => {
    setHasDrawn(!isCanvasEmpty());
  };


  /*
   * Initializes the drawing canvas when entering the drawing phase.
   * Sets size, brush style, and prepares undo history.
   */
  useLayoutEffect(() => {
    if (phase !== "draw") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctxRef.current = ctx;

    setUndoStack([canvas.toDataURL()]);
    setRedoStack([]);
  }, [phase]);


  /*
   * Updates the stroke color in real-time when the color changes.
   */
  useEffect(() => {
    if (ctxRef.current) ctxRef.current.strokeStyle = color;
  }, [color]);

  /*
   * Automatically validates the existence of a username when typing in both the login and registration forms.
   */
  useUserCheck(username, setUserExists, setChecking, setErrorMessage, setSuccessMessage, mode);
  useAvatarCheck(avatarName, confirmedUser, setAvatarExists, setChecking, setAvatarErrorMessage, setAvatarSuccessMessage, "tablet_screen");

   /*
   * Calculates pointer position relative to canvas coordinates.
   */
  const getPointerPos = (evt, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY,
    };
  };

  /*
   * Starts a new drawing stroke when the pointer is pressed down.
   */
  const startDrawing = (e) => {
    if (!confirmedUser || !confirmedAvatar) return;
    setDrawing(true);
    const pos = getPointerPos(e, canvasRef.current);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
  };

  /*
   * Draws continuous lines following the pointer movement.
   */
  const draw = (e) => {
    if (!drawing) return;
    const pos = getPointerPos(e, canvasRef.current);
    ctxRef.current.lineTo(pos.x, pos.y);
    ctxRef.current.stroke();
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
    setHasDrawn(true);
  };

  /*
   * Ends the current drawing stroke and saves canvas state.
   */
  const stopDrawing = () => {
    if (!drawing) return;
    setDrawing(false);
    saveState();
    updateHasDrawn();
  };

  /*
   * Clears the canvas.
   */
  const handleClear = () => {
    saveState();
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const cleared = canvasRef.current.toDataURL();
    setUndoStack((prev) => [...prev, cleared]);
    setRedoStack([]);
    updateHasDrawn();
  };


   /*
   * Confirms the user during login or registration based on the current mode.
   */
  const handleConfirmUser = async () => {
    const upperName = username.toUpperCase();

    if (mode === "login") {
      if (userExists) {
        setConfirmedUser(upperName);
      } 
    }

    if (mode === "register") {
      if (!userExists) {
        setConfirmedUser(upperName);
      }
    }
  };

  /*
   * Confirms the avatar name and switches to drawing phase.
   */
  const handleConfirmAvatar = async () => {
    if (!avatarName.trim()) return;
    const upperAvatar = avatarName.toUpperCase();
    setConfirmedAvatar(upperAvatar);
    setPhase("draw");
    setActiveTool("brush");
  };

  /*
   * Saves the drawing to Firebase and resets UI.
   */
  const handleSave = async () => {
    const imageData = canvasRef.current.toDataURL("image/png");
    await saveAvatar(confirmedUser, confirmedAvatar, imageData);
    setShowPopup(true);
    handleClear();
    setPhase("auth");
    setMode("login");
    setUsername("");
    setAvatarName("");
    setConfirmedUser(null);
    setConfirmedAvatar("");
    setUserExists(null);
  };

  return (
    <>
      {/* === Avatar Creation Success popup === */}
      {showPopup && (
        <div className="success-popup-overlay"> 
          <div className="success-popup-card">
            <div className="success-popup-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="#00ffcc">
                <circle cx="12" cy="12" r="10" stroke="#00ffcc" strokeOpacity="0.3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25L15 10.5" />
              </svg>
            </div>
            <h2 className="success-popup-title">Success!</h2>
            <p className="success-popup-text">
              Your avatar has been successfully created.<br />
              You can view it by logging in from your computer.
            </p>
            <button className="success-popup-button" onClick={() => setShowPopup(false)}>Continue</button>
          </div>
        </div>
      )}


      {/* === Authentication Phase: Login/Registration and Avatar Creation === */}
      {phase === "auth" && (
        <div className="auth-screen-container">
          <h1 className="title">PhysioPlay</h1>
          <p className="subtitle">Train and play with fun!</p>

          {/* --- Login --- */}
          {!confirmedUser && (
            <div className="login-card-tablet">
              <div className="input-container">
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toUpperCase().trim());
                    setErrorMessage("");
                    setSuccessMessage("");
                    }
                  }
                  className="form-input glow-input"
                />
                {username && (<button className="clear-button" onClick={() => setUsername("")}><FaTimesCircle/></button>)}
              </div>
              
              {/* Input validation */}
              
              {checking && <p className="checking-text">Checking...</p>}
              {errorMessage && <p className="error-text">{errorMessage}</p>}
              {successMessage && <p className="success-text">{successMessage}</p>}

              {/* Login/Registration confirm button */}
              <button 
                className={"login-button " + (!username.trim() || (mode === "login" && !userExists) || 
                            (mode === "register" && userExists) ? "disabled" : "")}
                onClick={handleConfirmUser}
                disabled={!username.trim() || (mode === "login" && !userExists) || (mode === "register" && userExists)}>
                {mode === "login" ? "Login" : "Continue"}
              </button>

              {/* Switch to sign in/sign up */}
              {mode === "login" ? 
                (<p className="switch-text">Don't have an account yet?
                  <button 
                    className="link-button" 
                    onClick={() => {
                      setMode("register");
                      setUsername("");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    >
                      Sign up
                  </button>
                </p>) : 
                (<p className="switch-text">Already have an account?
                  <button 
                    className="link-button" 
                    onClick={() => {
                      setMode("login");
                      setErrorMessage("");
                      setSuccessMessage("");
                      setUsername("");
                    }}
                    >
                      Sign in
                  </button>
                </p>
              )}
            </div>
          )}

          {/* Avatar name choice */}
          {confirmedUser && !confirmedAvatar && (
            <div className="login-card-tablet">
              <button
                className="back-button"
                onClick={() => {
                  setConfirmedUser(null);
                  setAvatarName("");
                  setUsername("");
                }}
              >
                <FaChevronCircleLeft/>
              </button>

              <h3 className="subtitle">Create your avatar</h3>
              <div className="input-container">
                <input
                  type="text"
                  placeholder="Enter avatar name"
                  value={avatarName}
                  onChange={(e) => {
                    setAvatarName(e.target.value.toUpperCase().trim());
                    setAvatarErrorMessage("");
                    setAvatarSuccessMessage("");
                    }
                  }
                  className="form-input glow-input"
                />
                {avatarName && (<button className="clear-button" onClick={() => setAvatarName("")}><FaTimesCircle/></button>)}
              </div>

              {/* Avatar name validation */}
              {avatarErrorMessage && <p className="error-text">{avatarErrorMessage}</p>}
              {avatarSuccessMessage && <p className="success-text">{avatarSuccessMessage}</p>}
              <button
                className={"login-button " + (!avatarName.trim() || avatarExists ? "disabled" : "")}
                onClick={handleConfirmAvatar}
                disabled={!avatarName.trim() || avatarExists}
              >
                Confirm
              </button>
            </div>
          )}

          {/* Background doodles */}
          <img src={doodleLeft} alt="doodle left" className="doodle-left" />
          <img src={doodleRight} alt="doodle right" className="doodle-right" />
        </div>
      )}

      {/* === Draw Avatar Phase === */}
      {phase === "draw" && (
        <>
          {/* Landscape warning overlay - shown if the device is horizontal */}
          <div className="rotate-warning-draw">
            <Lottie animationData={rotateAnimation} loop style={{ width: 300, height: 300 }} />
            <p className="rotate-text">Please rotate your tablet vertically to draw your avatar</p>
          </div>

          {/* --- Drawing Section --- */}
          <div className="draw-screen">

            {/* Top Bar */}
            <header className="draw-topbar">

              <button 
                className="draw-topbar-btn back" 
                onClick={() => {
                  setPhase("auth");
                  setConfirmedUser(null);
                  setConfirmedAvatar(null);
                  setUsername("");
                  setAvatarName("");
                }}
                >
                  <FaChevronCircleLeft/> 
                  Back
              </button>

              <div className="draw-topbar-center">
                <h1 className="draw-topbar-title">PhysioPlay</h1>
              </div>
              
              <button
                className={"draw-topbar-btn save " + (!hasDrawn ? "disabled" : "")}
                onClick={handleSave}
                disabled={!hasDrawn}
              >
                <FiSave className="icon"/> 
                Save
              </button>
            </header>
            
            {/* --- Canvas Area --- */}
            <div className="canvas-area">

              {/* Canvas */}
              <canvas
                ref={canvasRef}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
              />

              {/* Eyes Overlay*/}
              <img
                src={eyesOpenState ? eyesOpen : eyesClosed}
                alt="eyes"
                className="eyes-overlay"
              />
            </div>

            {/* Brush Size Slider */}
            <div className="brush-slider">
                <div
                  className="brush-preview"
                  style={{
                    width: brushSize + "px",
                    height: brushSize + "px",
                  }}
                />

                <input
                  type="range"
                  min="1"
                  max="30"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                  orient="vertical"
                />
              </div>

            {/* --- Toolbar --- */}
            <footer className="toolbar">

              {/* Colors */}
              <div className="toolbar-section colors">
                {["#000000", "#FF6663", "#FFB703", "#00FFCC", "#00B4D8", "#0077B6", "#7209B7", "#8338EC",].map((c) => (
                  <button
                    key={c}
                    className={"color-btn " + (color === c ? "selected" : "")}
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      ctxRef.current.globalCompositeOperation = "source-over";
                      setColor(c);
                    }}
                  />
                ))}
              </div>

              {/* Drawing tools */}
              <div className="toolbar-section tools">

                {/* Brush */}
                <button
                  className={"tool-btn " + (activeTool === "brush" ? "selected" : "")}
                  onClick={() => {
                    ctxRef.current.globalCompositeOperation = "source-over";
                    setActiveTool("brush");
                  }}
                >
                  <FaPaintBrush/>
                </button>

                {/* Eraser */}
                <button
                  className={"tool-btn " + (activeTool === "eraser" ? "selected" : "")}
                  onClick={() => {
                    ctxRef.current.globalCompositeOperation = "destination-out";
                    setActiveTool("eraser");
                  }}
                >
                  <FaEraser/>
                </button>

                {/* Undo */}
                <button className="tool-btn" onClick={undo}>
                  <FaUndoAlt/>
                </button>
                  
                {/* Redo */}
                <button className="tool-btn" onClick={redo}>
                  <FaRedoAlt/>
                </button>

                {/* Clear */}
                <button className="tool-btn clear-btn" onClick={handleClear}>
                  <FaTrash/>
                </button>
              </div>
            </footer>
          </div>
        </>
      )}
    </>
  );
}

export default TabletDraw;
