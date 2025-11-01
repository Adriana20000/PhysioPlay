/*
 * Home.js
 * 
 * Displays available games and allows game selection/configuration.
 * 
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAvatarDrawing } from "../hooks/useAvatarDrawing";

import TopBar from "../components/TopBar";
import AvatarBox from "../components/AvatarBox";
import GameOptions from "../components/GameOptions";

import doodleBottomRight from "../assets/doodle-bottom-right.png";
import doodleUp from "../assets/doodle-up.png";
import doodleBottomLeft from "../assets/doodle-bottom-left.png";

import preview1 from "../assets/preview1.jpg";
import preview2 from "../assets/preview2.jpg";
import preview3 from "../assets/preview3.jpg";

import "./Home.css";


function Home() {
  const navigate = useNavigate();
  
  const username = sessionStorage.getItem("childUsername");
  const avatar = sessionStorage.getItem("childAvatar");
  const childDrawing = useAvatarDrawing(username, avatar);

  const heightMap = { low: 0.35, medium: 0.25, high: 0.15 };

  const [selectedGame, setSelectedGame] = useState(null);
  const [hoveredGame, setHoveredGame] = useState(null);

  // Game settings
  const [level, setLevel] = useState("medium");
  const [timer, setTimer] = useState(30);
  const [numClouds, setNumClouds] = useState(5); 
  const [numObstacles, setNumObstacles] = useState(5);

  const [errorClouds, setErrorClouds] = useState("");
  const [errorObstacles, setErrorObstacles] = useState("");

  /*
   * Validates the "number of clouds" input for Game 2 by accepting only values between 1 and 20.
   */
  const validateClouds = (value) => {
    const num = parseInt(value, 10);

    if (isNaN(num) || value === "") {
      setErrorClouds("Enter a valid number (1-20)");
    } else if (num < 1) {
      setErrorClouds("The minimum value is 1");
    } else if (num > 20) {
      setErrorClouds("The maximum value is 20");
    } else {
      setErrorClouds("");
    }

    setNumClouds(value);
  };

  /*
   * Validates the "number of obstacles" input for Game 3 by accepting only values between 1 and 20.
   */
  const validateObstacles = (value) => {
    const num = parseInt(value, 10);

    if (isNaN(num) || value === "") {
      setErrorObstacles("Enter a valid number (1-20)");
    } else if (num < 1) {
      setErrorObstacles("The minimum value is 1");
    } else if (num > 20) {
      setErrorObstacles("The maximum value is 20");
    } else {
      setErrorObstacles("");
    }

    setNumObstacles(value);
  };


  const games = [
    {
      id: 1,
      title: "Star Game",
      avatarMessage: "Let's see how many stars you can grab!",  
      benefit: "Improve shoulder mobility, postural control, and hand-eye coordination.",     
      rules: "Catch as many stars as possible before time runs out!",
      tags: ["mobility", "arm elevation"],
      preview: preview1,
      route: "/game/game1",
    },
    {
      id: 2,
      title: "Balloon Game",
      avatarMessage: "Ready to fly through the clouds?",
      benefit: "Strengthen shoulder and upper-back muscles while improving movement control.",
      rules: "Collect the floating clouds before time is up!",
      tags: ["stability", "shoulders"],
      preview: preview2,
      route: "/game/game2",
    },
    {
      id: 3,
      title: "Avoid the Obstacles!",
      avatarMessage: "Stay sharp and dodge everything that comes your way!",
      benefit: "Enhance trunk flexibility, core stability, and balance.",
      rules: "Move or crouch to dodge obstacles and earn points!",
      tags: ["flexibility", "core muscles"],
      preview: preview3,
      route: "/game/game3",
    },
  ];



  /**
   * Handles a game card selection.
   * 
   * If:
   * - the user clicks twice on the same game card -> it gets deselected.
   * - otherwise "selectedGame" is updated with the new game.
   *
  */
  const handleCardClick = (game) => {
    if (selectedGame && selectedGame.id === game.id) {
      setSelectedGame(null);
      setNumClouds(5);
      setNumObstacles(5);
      setErrorClouds("");
      setErrorObstacles("");
    } else {
      setSelectedGame(game);
      setNumClouds(5);
      setNumObstacles(5);
      setErrorClouds("");
      setErrorObstacles("");
    }
  };



  /*
   * Confirms the game selection and after saving, navigates to the selected game page.
   *
   * The settings saved for each game:
   * 
   * - Star Game : level, maximum height, and timer.
   * - Balloon Game : the number of clouds.
   * - Avoid the Obstacles : the number of obstacles.
   *
  */
  const confirmGame = () => {
    if (!selectedGame) return;
    if (selectedGame.id === 1) {
      const maxHeight = heightMap[level];
      sessionStorage.setItem("starGameLevel", level);
      sessionStorage.setItem("starGameMaxHeight", maxHeight);
      sessionStorage.setItem("starGameTimer", timer);
    }
    if (selectedGame.id === 2) {
      sessionStorage.setItem("game2NumClouds", numClouds);
    }
    if (selectedGame.id === 3) {
      sessionStorage.setItem("game3NumObstacles", numObstacles);
    }
    
    navigate(selectedGame.route);

  };


  return (
    <>
      <TopBar childUsername={username} />
      <div className={"home-layout " + (selectedGame ? "game-selected" : "")}>

        {/* === Left Column === */}
        <div className="home-left-column">

          {/* Avatar Box */}
          <AvatarBox selectedGame={selectedGame} hoveredGame={hoveredGame} childUsername={username} childDrawing={childDrawing} avatar= {avatar}/>

          {/* Game Options Panel */}
          <div className="game-panel"> 
            <div className={"game-info-panel " + (selectedGame ? "visible" : "hidden")}>
              {!selectedGame ? (null) : (
                <>
                  <h2 className="game-panel-title">{selectedGame.title}</h2>
                  <p className="game-panel-desc">{selectedGame.benefit}</p>
                  <GameOptions
                    gameId={selectedGame.id}
                    level={level}
                    setLevel={setLevel}
                    timer={timer}
                    setTimer={setTimer}
                    numClouds={numClouds}
                    setNumClouds={(val) => validateClouds(val)}
                    numObstacles={numObstacles}
                    setNumObstacles={(val) => validateObstacles(val)}
                  />
                  {selectedGame?.id === 2 && errorClouds && (
                    <p className="error-text">{errorClouds}</p>
                  )}
                  {selectedGame?.id === 3 && errorObstacles && (
                    <p className="error-text">{errorObstacles}</p>
                  )}

                </>
              )}
            </div>
          </div>
        </div>

        {/* === Main Area: Game Cards === */}
        <div className={"game-cards-area " + (selectedGame ? 'game-cards-area--selected' : '')}>
          <div className="game-cards-row">
            {games.map((game) => {
              const isSelected = selectedGame?.id === game.id;
              return (
                <div
                  className={"game-card " + (isSelected ? "selected" : "not-selected")} 
                  key={game.id}
                  onClick={() => handleCardClick(game)}
                  onMouseEnter={() => setHoveredGame(game)}
                  onMouseLeave={() => setHoveredGame(null)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {if (e.key === "Enter") handleCardClick(game);}}
                  aria-pressed={isSelected}
                >
                  {/* Background image */}
                  <div
                    className="card-bg"
                    style={{ backgroundImage: "url(" + game.preview + ")"}}
                    aria-hidden="true"
                  />

                  {/* Card Header */}
                  <div className="card-header">
                    <div className="card-title">{game.title}</div>
                  </div>

                  {/* Card bottom section */}
                  <div className="card-bottom-section">

                    {/* Game rules */}
                    <div className="card-game-rules">
                      {isSelected ? game.rules : (
                          <div className="tags-container">
                            {game.tags.map((tag, idx) => (<span key={idx} className="tag">#{tag}</span>))}
                          </div>
                        )}
                    </div>

                    {/* Confirm button */}
                    {isSelected && (                      
                        <button
                          className="confirm-button"
                          disabled={
                            (game.id === 2 && errorClouds) ||
                            (game.id === 3 && errorObstacles)
                          }
                          onClick={(e) => {
                            e.stopPropagation(); 
                            confirmGame();
                          }}
                        >
                          Confirm
                        </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Background doodles */}
        <img src={doodleUp} alt="doodle up" className="doodle-up" />
        <img src={doodleBottomLeft} alt="doodle bottom left" className="doodle-bottom-left" />
        <img src={doodleBottomRight} alt="doodle bottom right" className="doodle-bottom-right" />
      </div>
    </>
  );
}

export default Home;
