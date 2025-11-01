import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {FaTimesCircle, FaChevronDown, FaChevronUp} from "react-icons/fa";
import {saveAvatar} from "../firebase";
import {useUserCheck, useAvatarCheck} from "../hooks/useLoginCheck";
import "./StartScreen.css";
import "../utils/utils.css";

import doodleLeft from "../assets/doodle-left.png";
import doodleRight from "../assets/doodle-right.png";

import "./StartScreen.css";

/*
 * Displays the initial screen for authentication.
*/

function StartScreen() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarExists, setAvatarExists] = useState(true);
  const [userExists, setUserExists] = useState(true);
  const [newUserExists, setNewUserExists] = useState(false);
  
  const [checking, setChecking] = useState(false);
  const [checkingNewUser, setCheckingNewUser] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [showAvatar, setShowAvatar] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [avatarErrorMessage, setAvatarErrorMessage] = useState("");
  const [avatarSuccessMessage, setAvatarSuccessMessage] = useState("");


  /*
   * Clears any previous session data when the StartScreen mounts.
   */
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  
  /*
   * Automatically validates the existence of a username when typing in both the login and registration forms.
   */
  useUserCheck(username, setUserExists, setChecking, setErrorMessage, setSuccessMessage, "login");
  useUserCheck(newUsername, setNewUserExists, setCheckingNewUser, setErrorMessage, setSuccessMessage, "register");

  /*
   * Checks if the entered avatar name exists for the current username.
   */
  useAvatarCheck(avatar, username, setAvatarExists, setChecking, setAvatarErrorMessage, setAvatarSuccessMessage, "main_screen")

  
  /*
   * Monitors all inputs to enable or disable the buttons accordingly.
   */
  useEffect(() => {
    setIsFormComplete(username.trim() && userExists && (!avatar.trim() || avatarExists));
  }, [username, userExists, avatar, avatarExists]);


  /*
   * Handles user login by saving the selected username and avatar to storage
   * and navigating to the Home page.
   */
  const handleStart = () => {
    const finalAvatar = avatar.trim() ? avatar : "PEMMY";
    sessionStorage.setItem("childUsername", username.toUpperCase());
    sessionStorage.setItem("childAvatar", finalAvatar.toUpperCase());
    navigate("/home");
  };

  /*
   * Handles new user registration by saving them in Firebase with a default avatar ("PEMMY").
   * Shows a success message and switches back to the login form.
   */
  const handleRegister = async () => {
    const upperName = newUsername.toUpperCase();
    await saveAvatar(upperName, "PEMMY", null);
    setShowRegister(false);
    setRegistrationSuccess(true);
    setNewUsername("");
  };

  return (
    <div className="auth-screen-container">
      <h1 className="title">PhysioPlay</h1>
      <p className="subtitle">Train and play with fun!</p>

      {/* === Login === */}
      {!showRegister && (
        <div className="login-card">

          {/* --- Username Section --- */}
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

          {/* Username validation */}
          {checking && <p className="checking-text">Checking...</p>}
          {errorMessage && <p className="error-text">{errorMessage}</p>}

          {/* --- Avatar Section --- */}
          <div className="avatar-section">

            {/* Show Avatar toggle */}
            <div className="avatar-toggle" onClick={() => setShowAvatar((prev) => !prev)}>
              <p>{showAvatar ? "Hide avatar field" : "Do you have an avatar?"}</p>
              {showAvatar ? <FaChevronUp/> : <FaChevronDown/>}
            </div>

            {/* Avatar name input */}
            <div className={"avatar-input-wrapper" + (showAvatar ? "expanded" : "")}>
              {showAvatar && (
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Enter avatar name"
                    value={avatar}
                    onChange={(e) => {
                      setAvatar(e.target.value.toUpperCase().trim());
                      setAvatarErrorMessage("");
                      setAvatarSuccessMessage("");
                      }
                    }
                    className="form-input glow-input"
                  />
                  {avatar && ( 
                    <button className="clear-button" onClick={() => setAvatar("")}>
                      <FaTimesCircle/>
                    </button>
                  )}
                </div>
              )}

              {/* Avatar name validation */}
              {avatarErrorMessage && <p className="error-text">{avatarErrorMessage}</p>}
              {avatarSuccessMessage && <p className="success-text">{avatarSuccessMessage}</p>}
              
            </div>
          </div>

          {/* Login Button */}
          <button
            className={"login-button " + (!isFormComplete ? "disabled" : "")}
            onClick={handleStart}
            disabled={!isFormComplete}
            >
              Login
            </button>
          
          {/* Switch to Registration */}
          <p className="switch-text">Don't have an account yet?
            <button className="link-button" onClick={() => {
              setUsername("");
              setAvatar("");
              setErrorMessage("");
              setSuccessMessage("");
              setShowAvatar(false);
              setShowRegister(true);
            }}>
              Sign up
            </button>
          </p>
        </div>
      )}

      {/* Account Creation Success Banner */}
      {!showRegister && registrationSuccess && (
        <div className="success-banner">
          Account created successfully! Please log in.
        </div>
      )}

      {/* === Sign Up === */}
      {showRegister && (
        <div className="card login-card">
          <div className="input-container">
            <input
              type="text"
              placeholder="Enter username"
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value.toUpperCase().trim());
                setErrorMessage("");
                setSuccessMessage("");
                }
              }
              className="form-input glow-input"
            />
            {newUsername && (
              <button
                className="clear-button"
                onClick={() => setNewUsername("")}
                ><FaTimesCircle/>
              </button>
            )}
          </div>
          
          {/* New Username validation */}
          {checkingNewUser && <p className="checking-text">Checking...</p>}
          {errorMessage && <p className="error-text">{errorMessage}</p>}
          {successMessage && <p className="success-text">{successMessage}</p>}

          {/* Create Account button */}
          <button 
            className={"login-button " + (newUsername.trim() && !newUserExists ? "" : "disabled")}
            onClick={handleRegister}
            disabled={!newUsername.trim() || newUserExists}
            >
            Create account
          </button>
          
          {/* Switch to Login */}
          <p className="switch-text">Already have an account?
            <button className="link-button" onClick={() => {
                setRegistrationSuccess(false);
                setShowRegister(false);
                setErrorMessage("")
                setSuccessMessage("")
                setNewUsername("")
              }}>
                Sign in
            </button>
          </p>
        </div>
      )}

      {/* Background doodles */}
      <img src={doodleLeft} alt="doodle left" className="doodle-left" />
      <img src={doodleRight} alt="doodle right" className="doodle-right" />
    </div>
  );
}

export default StartScreen;
