import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { handleVideo } from "../utils/gameSessionUtils";
import { generateGame3Advice } from "../utils/game3Advice"; 
import { saveGameSession } from "../utils/saveGameResults";
import { createResultsTable } from "../utils/resultsTable";

import { useCountdown} from "../hooks/useCountdown";
import { useGameSetup } from "../hooks/useGameSetup";
import { usePoseCamera } from "../hooks/usePoseCamera";

import Rock from "../assets/rock.png";
import Bird from "../assets/bird.png";
import Cloud from "../assets/cloud.png";

import "../layout/GameLayout.css";
import GameLayout from "../layout/GameLayout";



/*
 * Calculates the angle between the hip–knee–ankle joints.
 */
function  calculateAngle (hip, knee, ankle)  {
    const hip_knee = { x: hip.x - knee.x, y: hip.y - knee.y };
    const ankle_knee = { x: ankle.x - knee.x, y: ankle.y - knee.y };
    const dot =  hip_knee.x * ankle_knee.x +  hip_knee.y * ankle_knee.y;
    const hipLenght = Math.sqrt(hip_knee.x ** 2 +  hip_knee.y ** 2);
    const ankleLenght = Math.sqrt(ankle_knee.x ** 2 + ankle_knee.y ** 2);
    let angleRad = Math.acos(dot / (hipLenght * ankleLenght));
    let angleDeg = angleRad * (180 / Math.PI);
    return angleDeg;
  };



function Game3() {
  const navigate = useNavigate();
  
  const childUsername = sessionStorage.getItem("childUsername");
  const [numObstacles, setNumObstacles] = useState(() => {
    const savedNum = sessionStorage.getItem("game3NumObstacles");
    return savedNum ? Number(savedNum) : 5;
  });
  const [gameState, setGameState] = useState("preparing");
  const gameStateRef = useRef(gameState);
  const prevStateRef = useRef(null);

  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(0);

  const { countdown, start } = useCountdown();
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  
  
  const obstacleRadius = 100;
  const obstacleImages = [Rock, Bird, Cloud];
  const obstacleImagesRef = useRef([]);
  
  const obstacleRef = useRef(null);
  const generatedObstaclesRef = useRef(0);
  const obstacleResultsRef = useRef([]);
  const minKneeAngleRef = useRef(180);
  
  const [resultsTable, setResultsTable] = useState(null);
  
  const adviceRef = useRef([]);

  
  useGameSetup({ gameState, gameStateRef, setScore, initialScore: numObstacles});
  
  useEffect(() => {
    obstacleImagesRef.current = obstacleImages.map((src) => {
      const obstacleImg = new Image();
      obstacleImg.src = src;
      return obstacleImg;
    });
  }, []);
  

  // Returns a random obstacle image
  const getObstacle = () => {
    const randomImg = Math.floor(Math.random() * obstacleImagesRef.current.length);
    return obstacleImagesRef.current[randomImg];
  };


  // Save results
  const onSaveResultsGame3 = () => {
    saveGameSession(childUsername, "Avoid the Obstacles!", {
      numObstacles,
      results: obstacleResultsRef.current.map((r) => ({
        obstacle: r.obstacle,
        passed: r.passed,
        minKneeAngle: r.minKneeAngle,
      })),
      advice: adviceRef.current,
    });
  };
  

  /*
   * Creates a new obstacle with:
   * - random direction: left or right
   * - random vertical position; it is slightly different each time.
   * - random obstacle type (rock, bird, cloud)
  */
  const resetObstacle = (canvasWidth, canvasHeight) => {
    const direction = Math.random() > 0.5 ? "left" : "right";
    const speed = 15 * (direction === "right" ? 1 : -1);
    const startX = direction === "right" ? -obstacleRadius : canvasWidth + obstacleRadius;
    const circleY = canvasHeight * (0.2 + Math.random() * 0.1);
    return {
        x: startX,
      speed,
      circleY,
      obstacleImage: getObstacle(),
    };
  };


  /*
   * Checks if the obstacle is close enough to any body landmark.
   * If yes -> collision detected.
   */
  const checkCollision = (obstacle, landmarks, w, h, obstacleRadius) => {
    if (!landmarks) return false;

    for (let i = 0; i < landmarks.length; i++) {
      const landmark = landmarks[i];
      const dist_x = obstacle.x - landmark.x * w;
      const dist_y = obstacle.circleY - landmark.y * h;

      const distance = Math.sqrt(dist_x * dist_x + dist_y * dist_y);

      if (distance < obstacleRadius) {
        return true; 
      }
    }

    return false; 
  };


  const onResults = (results) => {
    const { ctx, w, h } = handleVideo(videoRef, canvasRef, results, gameStateRef, setGameState, start);

    if (gameStateRef.current === "playing") {
      if (!obstacleRef.current && generatedObstaclesRef.current < numObstacles) {
        obstacleRef.current = resetObstacle(w, h);
        generatedObstaclesRef.current += 1;
        setScore((prev) => prev - 1);
      }

      const obst = obstacleRef.current;

      if (!obst) return;
      obst.x += obst.speed;

      if (results.poseLandmarks) {
        const hip = results.poseLandmarks[23];
        const knee = results.poseLandmarks[25];
        const ankle = results.poseLandmarks[27];
        if (hip && knee && ankle) {
          const angle = calculateAngle(hip, knee, ankle);
          minKneeAngleRef.current = Math.min(minKneeAngleRef.current, angle);
        }
      }

      const collision = checkCollision(obst, results.poseLandmarks, w, h, obstacleRadius);
      
      if (collision) setFailed((prev) => prev + 1);

      // When the obstacle leaves the screen or collision occurs
      if (collision || obst.x - obstacleRadius > w || obst.x + obstacleRadius < 0) {
        obstacleResultsRef.current.push({
          obstacle: generatedObstaclesRef.current,
          passed: !collision ? "✅" : "❌",
          minKneeAngle: minKneeAngleRef.current.toFixed(1),
        });
        minKneeAngleRef.current = 180;
        obstacleRef.current = null;

         // End game -> all obstacles generated
        if (generatedObstaclesRef.current === numObstacles) {
            setGameState("gameover");
            
            const adviceList = generateGame3Advice({
              obstacleResults: obstacleResultsRef.current,
            });

            adviceRef.current = adviceList;

            
            setResultsTable(
              createResultsTable({
                results: obstacleResultsRef.current,
                columns: [
                  { key: "obstacle", label: "Obstacle" },
                  { key: "passed", label: "Passed" },
                  { key: "minKneeAngle", label: "Min Knee Angle (°)" },
                ],
                adviceList: adviceRef.current,
                rowKey: "obstacle",
              })
            );
          }
      }

      if (obst.obstacleImage && obst.obstacleImage.complete) {
        ctx.save();
        ctx.translate(obst.x,  obst.circleY);
        if (obst.speed < 0) {
          ctx.scale(-1, 1);
        } 
        ctx.drawImage(
          obst.obstacleImage,
          -obstacleRadius,
          -obstacleRadius,
          obstacleRadius * 2,
          obstacleRadius * 2
        );
        ctx.restore();
      }
    }
  };
 
  usePoseCamera({ videoRef, cameraRef, poseRef, gameStateRef, onResults});

  





  return (
    <GameLayout
      gameId={3}
      gameTitle="Avoid the Obstacles!"
      statusItems={[
        {label: "Obstacles", value: score},
        {label: "Failed", value: failed},
      ]}
      gameState={gameState}
      countdown={countdown}
      onPause={() => {
        prevStateRef.current = gameStateRef.current;
        setGameState("paused");
      }}
      onResume={() => setGameState(prevStateRef.current ?? "playing")}
      onRestart={() => window.location.reload()}
      onQuit={() => { 
        navigate("/home"); 
        window.location.reload();
      }}
      resultsTable={resultsTable}
      onSaveResults={onSaveResultsGame3} 
      helpText={
        <>
          ✦ Slightly crouch or move to avoid incoming obstacles.<br/><br/>
          ✦ Every time you pass one, you earn points!<br/><br/>
          ✦ If you're not in the center of the screen, the game will stop.<br/><br/>
        </>
      }
      >
      <video ref={videoRef} className="game-video" playsInline muted autoPlay/>
      <canvas ref={canvasRef} className="game-canvas"/>
    </GameLayout>
  );
}

export default Game3;
