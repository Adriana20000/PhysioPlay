/*
 * Profile.js
 * 
 * Displays the user profile with the recent game sessions
 * and detailed infos for each one.
 * 
*/

import { useEffect, useState } from "react";
import { useAvatarDrawing } from "../hooks/useAvatarDrawing";
import { useEyes } from "../hooks/useEyes";
import { getSavedSessions } from "../firebase";
import { FaTimes } from "react-icons/fa";
import TopBar from "../components/TopBar";
import doodleBottomRight from "../assets/doodle-bottom-right.png";
import doodleBottomLeft from "../assets/doodle-bottom-left.png";
import pemmyGreetings from "../assets/pemmy_greetings.mp4";
import eyesOpen from "../assets/eyes_op.png";
import eyesClosed from "../assets/eyes_clos.png";
import "./Profile.css";


function Profile() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const username = sessionStorage.getItem("childUsername");
  const avatar = sessionStorage.getItem("childAvatar");
  const childDrawing = useAvatarDrawing(username, avatar);
  const eyesOpenState = useEyes();
  
  
  /**
   * Retrieves all saved game sessions associated with the username.
   *  */ 
  useEffect(() => {
    if (!username) return;
    const fetchData = async () => {
        const sessions_data = await getSavedSessions(username);
        setSessions(sessions_data);
      };
    fetchData();
  }, [username]);

  return (
    <div className="profile-page">

      {/* Top Bar */}
      <TopBar childUsername={username}/> 

      {/* === Profile Card Section === */}
      <div className="profile-card">

        {/* Profile Avatar */}
        <div className="profile-avatar-container"
          style={{
            backgroundColor: childDrawing ? "#EEE5E9" : "transparent",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Avatar Drawing or Default video*/}
          {childDrawing ? (
            <>
              <img
                src={childDrawing}
                alt="Child Avatar"
                className="profile-avatar"
              />
              <img
                src={eyesOpenState ? eyesOpen : eyesClosed}
                alt="eyes"
                className="eyes-overlay-profile"
              />
            </>
          ) : (
            <video src={pemmyGreetings} autoPlay loop muted playsInline className="profile-avatar"/>
          )}
        </div>

        {/* User Info */}
        <h1 className="profile-title">User Profile</h1>
        <h2 className="profile-subtitle">Welcome back, {username}!</h2>

        {/* Last sessions table */}
        {sessions.length === 0 ? (
          <p className="no-sessions">No saved sessions yet.</p>
        ) : (
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Game</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, index) => (
                <tr key={index}>
                  <td>
                    {new Date(session.timestamp).toLocaleDateString("en-GB")}
                    <br />
                    <small>
                      {new Date(session.timestamp).toLocaleTimeString("en-GB")}
                    </small>
                  </td>
                  <td>{session.game}</td>
                  <td>
                    <button
                      className="info-button"
                      onClick={() => setSelectedSession(session)}
                    >
                      More Info
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

      {/* Overlay Session Info */}
      {selectedSession && (
        <div className="session-info-overlay">
          <div className="session-info-card">
            <h2>{selectedSession.game} — Details</h2>

            {/* Session Details */}
            <p>
              <strong>Date: </strong>
              {new Date(selectedSession.timestamp).toLocaleString()}
            </p>

            {/* Game 1 settings selected */}
            {selectedSession.game === "Star Game" && (
              <p>
                <strong>Score:</strong> {selectedSession.score ?? "N/A"} |{" "}
                <strong>Duration:</strong> {selectedSession.duration ?? "N/A"}s |{" "}
                <strong>Level:</strong> {selectedSession.level ?? "N/A"}
              </p>
            )}

            {/* Game 2 settings selected */}
            {selectedSession.game === "Balloon Game" && (
              <p>
                <strong>Number of Clouds: </strong>
                {selectedSession.numClouds ?? sessionStorage.getItem("game2NumClouds") ?? "N/A"}
              </p>
            )}

            {/* Game 3 settings selected */}
            {selectedSession.game === "Avoid the Obstacles!" && (
              <p>
                <strong>Number of Obstacles: </strong>
                {selectedSession.numObstacles ?? sessionStorage.getItem("game3NumObstacles") ?? "N/A"}
              </p>
            )}

            {/* Session results */}
            <div className="results-table-container">
              <table className="results-table">

                {/* Column headers for each game */}
                <thead>
                  {selectedSession.game === "Star Game" ? (
                    <tr>
                      <th>Phase</th>
                      <th>Stars</th>
                      <th>Right Angle (°)</th>
                      <th>Left Angle (°)</th>
                      <th>Right Range</th>
                      <th>Left Range</th>
                    </tr>
                  ) : selectedSession.game === "Avoid the Obstacles!" ? (
                    <tr>
                      <th>Obstacle</th>
                      <th>Passed</th>
                      <th>Min Knee Angle (°)</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Cloud</th>
                      <th>Stability (%)</th>
                    </tr>
                  )}
                </thead>

                {/* Rows for each game */}
                <tbody>
                  
                  {selectedSession.game === "Star Game" ? 
                    (["start", "middle", "end"].map((phase) => (
                      <tr key={phase}>
                        <td>{phase}</td>

                        <td>{selectedSession.phaseScores?.[phase] ?? "—"}</td>

                        <td>{selectedSession.handAngles?.right?.[phase]?.length ? 
                              Math.max(...selectedSession.handAngles.right[phase]).toFixed(1) : "—"}</td>

                        <td>{selectedSession.handAngles?.left?.[phase]?.length ? 
                              Math.max(...selectedSession.handAngles.left[phase]).toFixed(1) : "—"}</td>

                        <td>{selectedSession.handHeights?.right?.[phase]?.length ? 
                              (Math.max(...selectedSession.handHeights.right[phase]) -
                                Math.min(...selectedSession.handHeights.right[phase])).toFixed(3) : "—"}</td>

                        <td>{selectedSession.handHeights?.left?.[phase]?.length ? 
                              (Math.max(...selectedSession.handHeights.left[phase]) -
                                Math.min(...selectedSession.handHeights.left[phase])).toFixed(3) : "—"}</td>
                      </tr>
                      ))
                    ) :                    
                    selectedSession.game === "Avoid the Obstacles!" ? (selectedSession.results.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.obstacle}</td>
                        <td>{r.passed}</td>
                        <td>{r.minKneeAngle}</td>
                      </tr>
                    ))
                  ) : (
                    selectedSession.results?.map((c, idx) => (
                      <tr key={idx}>
                        <td>{c.Cloud}</td>
                        <td>{c["Stability (%)"]}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Advice Section */}
            {selectedSession.advice && selectedSession.advice.length > 0 && (
              <div className="adviceSection">
                <h3>Advice</h3>
                <ul>{selectedSession.advice.map((tip, idx) => (<li key={idx}>{tip}</li>))}</ul>
              </div>
            )}

            <button className="close-button" onClick={() => setSelectedSession(null)}>
              <FaTimes className="close-icon"/> Close
            </button>
          </div>
        </div>
      )}

      {/* Background doodles */}
      <img src={doodleBottomLeft} alt="doodle bottom left" className="doodle-bottom-left" />
      <img src={doodleBottomRight} alt="doodle bottom right" className="doodle-bottom-right" />
    </div>
  );
}

export default Profile;
