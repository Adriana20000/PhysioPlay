import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { handleVideo } from "../utils/gameSessionUtils";
import { saveGameSession } from "../utils/saveGameResults";
import { createResultsTable } from "../utils/resultsTable";
import { generateGame2Advice, addCloudResults} from "../utils/game2Advice";

import { useCountdown} from "../hooks/useCountdown";
import { useGameSetup } from "../hooks/useGameSetup";
import { usePoseCamera } from "../hooks/usePoseCamera";

import Cloud from "../objects/Cloud";
import CloudImg from "../assets/cloud.png";
import Balloon from "../assets/balloon.png";

import GameLayout from "../layout/GameLayout";
import "../layout/GameLayout.css";




/*
 * Calculates a "stability" percentage based on the number of attempts
 * the player takes to touch a cloud:
 *
 * Note:
 * More attempts -> less stability.
 *
*/
function calculateStabilityFromAttempts(attempts) {
  const maxAttempts = 5; 
  const stability = Math.max(0, 100 - (attempts - 1) * (100 / maxAttempts));
  return Math.round(stability);
}



function Game2() {
  const navigate = useNavigate();
  const numClouds = sessionStorage.getItem("game2NumClouds");
  const childUsername = sessionStorage.getItem("childUsername");

  const cloudImgRef = useRef(null);
  const cloudRef = useRef(null);
  const cloudResultsRef = useRef([]); 
  const cloudCollectedRef = useRef(false);
  const collectedCloudsRef = useRef(0);
  
  const balloonImgRef = useRef(null);
  const balloonYRef = useRef(300);
  const balloonSpeed = 0.2;

  const [gameState, setGameState] = useState("preparing");
  const gameStateRef = useRef(gameState);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  
  const { countdown, start } = useCountdown();
  const [score, setScore] = useState(0);
  
  const symmetryDataRef = useRef([]); 
  const isTouchingRef = useRef(false);
  const contactAttemptsRef = useRef(0);

  const [resultsTable, setResultsTable] = useState(null); 

  const adviceRef = useRef([]);
  

  useGameSetup({ gameState, gameStateRef, setScore, initialScore: numClouds});


  // Loads the balloon and cloud images once when the component mounts.
  useEffect(() => {
    const balloonImg = new Image();
    balloonImg.src = Balloon;
    balloonImgRef.current = balloonImg;
    
    const cloudImg = new Image();
    cloudImg.src = CloudImg;
    cloudImgRef.current = cloudImg;
  }, []);


  
  useEffect(() => {
    cloudRef.current = new Cloud({});
  }, []);


  const onSaveResultsGame2 = () => {
    saveGameSession(childUsername, "Balloon Game", {
      results: cloudResultsRef.current,
      advice: adviceRef.current,
    });
  };
  

  
  const onResults = (results) => {
    const { ctx, w, h } = handleVideo(videoRef, canvasRef, results, gameStateRef, setGameState, start);

    if (gameStateRef.current === "playing") {
      if (results.poseLandmarks) {
        const leftWrist = results.poseLandmarks[15];
        const rightWrist = results.poseLandmarks[16];
        const leftShoulder = results.poseLandmarks[11];
        const rightShoulder = results.poseLandmarks[12];

        if (leftWrist && rightWrist && leftShoulder && rightShoulder) {
          // Calculate arm symmetry: difference in Y between wrists and shoulders
          const leftDeltaY = leftShoulder.y - leftWrist.y;
          const rightDeltaY = rightShoulder.y - rightWrist.y;
          const symmetryError = Math.abs(leftDeltaY - rightDeltaY);
          symmetryDataRef.current.push(symmetryError);

          // Calculate how far wrists are above shoulders
          const avgWristY = (leftWrist.y + rightWrist.y) / 2;
          const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
          const delta = avgShoulderY - avgWristY;

          // Consider user’s distance from camera to calculate arm movement
          const shoulderDist = Math.abs(rightShoulder.x - leftShoulder.x);
          const scaleFactor = Math.min(1 / (shoulderDist * 2.5), 3);
          const adjustedDelta = delta * scaleFactor;

          const targetY = h / 2 + (0.3 - adjustedDelta) * h * 0.8;
          balloonYRef.current += (targetY - balloonYRef.current) * balloonSpeed;
        }
      }

      // Define balloon position:  y dipends on user's movement
      const balloonX = w * 0.7;
      const balloonY = balloonYRef.current;


      if (balloonImgRef.current) {
        const img = balloonImgRef.current;
        const balloonWidth = 270;
        const balloonHeight = 270;
        const center_x = balloonX - balloonWidth / 2;
        const center_y = balloonY - balloonHeight / 2;
        ctx.drawImage(img, center_x, center_y, balloonWidth, balloonHeight);
      }

      cloudRef.current.draw(ctx, balloonX, cloudImgRef.current);

      // Collision detection between balloon and cloud 
      if (cloudRef.current.isTouching(balloonY) && !cloudCollectedRef.current) {
        if (!isTouchingRef.current) {
          isTouchingRef.current = true;
          contactAttemptsRef.current += 1;
        }
        cloudRef.current.fadeOut();

        // Cloud faded out completely -> consider it collected
        if (!cloudRef.current.visible){
          cloudCollectedRef.current = true;
          collectedCloudsRef.current += 1;
          setScore((prev) => prev - 1);

          const attempts = contactAttemptsRef.current;
          const stabilityPercent = calculateStabilityFromAttempts(attempts);

          addCloudResults({
            cloudResultsRef,
            cloudNumber: collectedCloudsRef.current,
            stabilityPercent,
          });

        
          isTouchingRef.current = false;
          contactAttemptsRef.current = 0;

          if (collectedCloudsRef.current < numClouds) {
            cloudRef.current.resetPosition(h, balloonY);
            setTimeout(() => { cloudCollectedRef.current = false; }, 500);
          } 

          else {
            // End game: all clouds collected 
            setGameState("gameover");
            
            // Generate personalized advice based on stability & symmetry data
            const adviceList = generateGame2Advice({
              results: cloudResultsRef.current,
              symmetryData: symmetryDataRef.current,
            });

            adviceRef.current = adviceList;

            setResultsTable(
              createResultsTable({
                results: cloudResultsRef.current,
                columns: [
                  { key: "Cloud", label: "Cloud" },
                  { key: "Stability (%)", label: "Stability (%)" },
                ],
                adviceList: adviceRef.current,
                additionalData: { symmetryData: symmetryDataRef.current },
                rowKey: "Cloud",
              })
            );
          }
        }
      }
       else {
        isTouchingRef.current = false;
        cloudRef.current.opacity = 1;
      }
    }
  };


  usePoseCamera({ videoRef, cameraRef, poseRef, gameStateRef, onResults});










  return (
    <GameLayout
      gameId={2}
      gameTitle="Balloon Game"
      statusItems={[{label: "Clouds", value: score}]}
      gameState={gameState}
      countdown={countdown}
      onPause={() => setGameState("paused")}
      onResume={() => setGameState("playing")}
      onRestart={() => window.location.reload()}
      onQuit={() => {
        navigate("/home");
        window.location.reload();
      }}
      resultsTable={resultsTable} 
      onSaveResults={onSaveResultsGame2} 
      helpText={
        <>
          ✦ Move your hands to touch the clouds that appear on the screen.<br/><br/>
          ✦ Each cloud you collect increases your score.<br/><br/>
          ✦ If you're not in the center of the screen, the game will stop.<br/><br/>
        </>
      }
    >
      <video ref={videoRef} className="game-video" playsInline muted autoPlay/>
      <canvas ref={canvasRef} className="game-canvas"/>
    </GameLayout>
  );
}

export default Game2;
