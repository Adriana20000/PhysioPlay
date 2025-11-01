import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import "./TopBar.css";
import logo from "../logo.svg";


function TopBar({ childUsername }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const path = window.location.pathname;

  // Toggles the profile dropdown visibility
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Logout function 
  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <header className="topbar">

      {/* === Left Section === */}
      <div className="topbar-left" 
        onClick={() => { 
          navigate("/home"); 
          window.location.reload(); 
        }}>
        <img src={logo} alt="PhysioPlay Logo" className="topbar-logo" />
        <h1 className="topbar-title">PhysioPlay</h1>
      </div>

      {/* === Right Section === */}      
        <div className="topbar-right">

          {/* Greetings */}
          {(path === "/home") && (<span className="topbar-greeting">Hi {childUsername || "Player"}!</span>)}

          {/* Profile Button */}
          <div className="profile-button">
            <div className="profile-icon" onClick={toggleMenu}>
              {childUsername ? childUsername.charAt(0).toUpperCase() : "P"}
            </div>

            {/* Profile Menu */}
            {menuOpen && (
              <div className="profile-menu">
                {!(path === "/profile") && (
                  <button onClick={() => navigate("/profile")}>
                    <FaUserCircle className="menu-icon"/>
                    My Results
                  </button>
                )}
                <button onClick={logout}>
                  <FaSignOutAlt className="menu-icon"/>
                  Logout
                </button>
              </div>
            )}

          </div>
        </div>
          
    </header>
  );
}

export default TopBar;
