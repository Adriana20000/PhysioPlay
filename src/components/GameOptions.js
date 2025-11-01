import "./GameOptions.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/*
 * GameOptions Component
 * 
 * Displays configurable options for each game type, allowing the user
 * to adjust difficulty levels, duration, and quantity-based parameters
 * before starting.
 * 
 * Props:
 *   gameId (number): Identifier of the selected game.
 *   level (string): Current difficulty level for Game 1.
 *   setLevel (function): Updates the selected difficulty level.
 *   timer (number): Current game duration in seconds for Game 1.
 *   setTimer (function): Updates the duration time.
 *   numClouds (number): Number of clouds to display in Game 2.
 *   setNumClouds (function): Updates the number of clouds.
 *   numObstacles (number): Number of obstacles for Game 3.
 *   setNumObstacles (function): Updates the number of obstacles.
 * 
 * 
 *   Configuration panels based on the selected game:
 *   - Game 1: shows selectors for level and duration using navigation arrows.
 *   - Game 2: allows input of the number of clouds.
 *   - Game 3: allows input of the number of obstacles.
 * 
 */

function GameOptions({gameId, level, setLevel, timer, setTimer, numClouds, setNumClouds, numObstacles, setNumObstacles}) {

  return (
    <div className="game-settings">

      {/* === Game 1 === */}
      {gameId === 1 && (
        <>
          {/* Level Selector */}
          <div className="option-container">
            <div className="option-header"><span>Level</span></div>
            <div className="option-control">
              <button
                className="arrow-button"
                disabled={level === "low"}
                onClick={() => setLevel(level === "high" ? "medium" : level === "medium" ? "low" : "low")}
              >
                <FaChevronLeft/>
              </button>
              <div className="option-value">{level}</div>
              <button
                className="arrow-button"
                disabled={level === "high"}
                onClick={() => setLevel(level === "low" ? "medium" : level === "medium" ? "high" : "high")}
              >
                <FaChevronRight/>
              </button>
            </div>
          </div>
          
          {/* Duration Selector */}
          <div className="option-container">
            <div className="option-header"><span>Duration</span></div>
            <div className="option-control">
              <button
                className="arrow-button"
                disabled={timer === 30}
                onClick={() => setTimer(timer === 90 ? 60 : timer === 60 ? 30 : 30)}
              >
                <FaChevronLeft/>
              </button>
              <div className="option-value">{timer}s</div>
              <button
                className="arrow-button"
                disabled={timer === 90}
                onClick={() => setTimer(timer === 30 ? 60 : timer === 60 ? 90 : 90)}
              >
                <FaChevronRight/>
              </button>
            </div>
          </div>
        </>
      )}

      {/* === Game 2 === */}
      {gameId === 2 && (
        <>
          {/* Number of Clouds Selector */}
          <div className="option-container">
            <div className="option-header"><span>Number of Clouds</span></div>
            <div className="option-control">
              <input
                type="number"
                min="1"
                max="20"
                value={numClouds}
                onChange={(e) => setNumClouds(e.target.value)}
                className="number-input"
              />
            </div>
          </div>
        </>
      )}

      {/* === Game 3 === */}
      {gameId === 3 && (
        <>
          {/* Number of Obstacles Selector */}
          <div className="option-container">
            <div className="option-header"><span>Number of Obstacles</span></div>
            <div className="option-control">
              <input
                type="number"
                min="1"
                max="20"
                value={numObstacles}
                onChange={(e) => setNumObstacles(e.target.value)}
                className="number-input"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GameOptions;
