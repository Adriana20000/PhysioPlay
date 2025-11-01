import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { generateAdvice } from "../utils/game1Advice";
import { handleVideo } from "../utils/gameSessionUtils";
import { saveGameSession } from "../utils/saveGameResults";
import { createResultsTableGame1 } from "../utils/resultsTable";

import { useCountdown } from "../hooks/useCountdown";
import { useGameSetup } from "../hooks/useGameSetup";
import { usePoseCamera } from "../hooks/usePoseCamera";

import Star from "../objects/Star";
import StarImg from "../assets/star.png";

import GameLayout from "../layout/GameLayout";
import "../layout/GameLayout.css";



// Different types of stars 
const STAR_TYPES = [
  { size: 70, speed: 5 },
  { size: 80, speed: 5 },
  { size: 90, speed: 5 },
];



/*
 * Calculates the angle between the wrist–shoulder-hip joints.
 */
function calculateAngle(shoulder, wrist, hip) {
  const wrist_shoulder = { x: wrist.x - shoulder.x, y: wrist.y - shoulder.y };
  const hip_shoulder = { x: hip.x - shoulder.x, y: hip.y - shoulder.y };
  const dot = wrist_shoulder .x * hip_shoulder.x + wrist_shoulder.y * hip_shoulder.y;
  const wristLenght = Math.sqrt(wrist_shoulder.x ** 2 + wrist_shoulder.y ** 2);
  const hipLenght = Math.sqrt(hip_shoulder.x  ** 2 +  hip_shoulder.y ** 2);
  let angleRad = Math.acos(dot / ( wristLenght * hipLenght));
  let angleDeg = angleRad * (180 / Math.PI);
  return angleDeg;
}


/*
* Handles the star creation.
* Stars alternate sides and are collected when touched by hands.
*/
function handleStar(starRef, coords_hands, h, w, redLineY, setScore, setPhaseScores, startTimeRef, sessionDurationRef, lastStarTimeRef, starImgRef, STAR_TYPES, startYRef, finalStartY, lastStarSideRef, ctx, currentPhaseRef) {
  const now = Date.now();

  if (starRef.current) {
    const result = starRef.current.update(
      ctx,
      coords_hands.right_hand.x,
      coords_hands.right_hand.y,
      coords_hands.left_hand.x,
      coords_hands.left_hand.y,
      h,
      w,
      redLineY
    );

    if (result.rigenera) {
      if (result.raccolta) {
        setScore((s) => s + 1);
        const phase = getCurrentPhase(startTimeRef.current, sessionDurationRef.current, currentPhaseRef);
        setPhaseScores((prev) => {
          const updated = { ...prev, [phase]: prev[phase] + 1 };
          return updated;
        });    
      }
      starRef.current = null;
      lastStarTimeRef.current = now;
    }
  } 
  else if (now - lastStarTimeRef.current >= 2000) {
    const tipo = STAR_TYPES[Math.floor(Math.random() * STAR_TYPES.length)];
    const startYInPx = redLineY - 0.3 * h;
    const nextSide = lastStarSideRef.current === "left" ? "right" : "left";
    lastStarSideRef.current = nextSide;
    starRef.current = new Star(starImgRef.current, tipo.size, tipo.speed, w, startYInPx, nextSide);

    if (startYRef.current > finalStartY) {
      startYRef.current -= 0.01;
      if (startYRef.current < finalStartY) {
        startYRef.current = finalStartY;
      }
    }
  }
}


/*
* Stores hand movement data for the current game phase.
*/
function updateHandData( phase, coords_hand, shoulder, wrist, hip, handHeightsRef, armAnglesRef, h, side) {
  handHeightsRef.current[side][phase].push(coords_hand.y / h);

  if (shoulder && wrist && hip) {
    armAnglesRef.current[side][phase].push(
      calculateAngle(shoulder, wrist, hip)
    );
  }
}



/*
* Determines the current game phase (start, middle, or end)
*/
function getCurrentPhase(startTime, sessionDuration, currentPhaseRef) {
  const elapsedSec = (Date.now() - startTime) / 1000;
  const timeLeft = sessionDuration - elapsedSec;
  
  let phase;
  if (timeLeft > sessionDuration * 2 / 3) {
    phase = "start";
  } else if (timeLeft > sessionDuration / 3) {
    phase = "middle";
  } else {
    phase = "end";
  }

  if (phase !== currentPhaseRef.current) {
    currentPhaseRef.current = phase;
  }
  return phase ;
}



/*
* Extracts hand coordinates (in pixels)
*/
function getHandCoordinates(poseLandmarks, w, h) {
  const leftWrist = poseLandmarks[15];
  const rightWrist = poseLandmarks[16];
  return {
    left_hand: leftWrist ? { x: leftWrist.x * w, y: leftWrist.y * h } : null,
    right_hand: rightWrist ? { x: rightWrist.x * w, y: rightWrist.y * h } : null,
  };
}


/*
* Draws a red horizontal line on the screen that gradually moves up.
*/
function drawRedLine(ctx, width, height, redLineYRef, maxHeight) {
  if (redLineYRef.current > maxHeight) {
    redLineYRef.current -= 0.0020;
  }
  const redLineY = height * redLineYRef.current;
  ctx.strokeStyle = "red";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, redLineY);
  ctx.lineTo(width, redLineY);
  ctx.stroke();

  return redLineY;
}




function Game1() {
  const navigate = useNavigate();

  const currentPhaseRef = useRef(null);

  const savedLevel = sessionStorage.getItem("starGameLevel");
  const maxHeight = sessionStorage.getItem("starGameMaxHeight");
  const savedTimer = sessionStorage.getItem("starGameTimer");

  const childUsername = sessionStorage.getItem("childUsername");

  const starImgRef = useRef(null);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const sessionDurationRef = useRef(0);

  const [gameState, setGameState] = useState("preparing");
  const gameStateRef = useRef(gameState);

  const pauseStartTimeRef = useRef(null);
  const autoPauseStartRef = useRef(null);
  const [score, setScore] = useState(0);
 
  const { countdown, start } = useCountdown();
  const [resultsTable, setResultsTable] = useState(null); 

 
  const [phaseScores, setPhaseScores] = useState({
    start: 0,
    middle: 0,
    end: 0,
  });
  const phaseScoresRef = useRef(phaseScores);

  
  // Data collected for each phase
  const handHeightsRef = useRef({
    left: { start: [], middle: [], end: [] },
    right: { start: [], middle: [], end: [] },
  });
  const armAnglesRef = useRef({
    left: { start: [], middle: [], end: [] },
    right: { start: [], middle: [], end: [] },
  });


  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const starRef = useRef(null);
  
  const timerRef = useRef(null);
  const lastStarTime = useRef(Date.now() - 2000);
  const redLineYRef = useRef(0.6);
  const lastStarSideRef = useRef("left");

  const startYRef = useRef(0.4);
  const finalStartY = 0;
  const startTimeRef = useRef(null);
  const resultsRef = useRef(null);

  const adviceRef = useRef([]);


  useGameSetup({ gameState, gameStateRef });
  
  
  useEffect(() => {
    const starImg = new Image();
    starImg.src = StarImg;
    starImgRef.current = starImg;
  }, []);



  useEffect(() => {
    phaseScoresRef.current = phaseScores;
  }, [phaseScores]);


  // Initialize the timer at game start 
  useEffect(() => {
    sessionDurationRef.current = savedTimer;
    setTimeLeft(savedTimer);
  }, []);



  useEffect(() => {
    if ((gameState === "playing" || gameState === 'preparing') && !startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  }, [gameState]);
  
  useEffect(() => {
    if (gameState === "paused") videoRef.current?.pause();
    else if (gameState === "playing") videoRef.current?.play();
  }, [gameState]);


  // Save all game results 
  const onSaveResultsGame1  = () => {
    saveGameSession( childUsername, "Star Game", {
      score: score,
      phaseScores: phaseScores,
      handHeights: handHeightsRef.current,
      handAngles: armAnglesRef.current,
      duration: sessionDurationRef.current,
      level: savedLevel,
      results: resultsRef.current, 
      advice: adviceRef.current,
    });
  };



  // Handles the countdown timer 
  useEffect(() => {
    let frameId;

    const update = () => {
      if (gameState === "playing" && startTimeRef.current) {
        const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
        const newTimeLeft = Math.max(sessionDurationRef.current - elapsedSec, 0);
        setTimeLeft(Math.floor(newTimeLeft)); 
        if (newTimeLeft <= 1) handleGameOver();
      }
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frameId);
  }, [gameState]);



  /*
   * End game:
   *   - Generates performance metrics and advice
   *   - Creates a results table for display
   * 
  */
  function handleGameOver() {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setGameState("gameover");

    const results = { left: {}, right: {} };

    for (const side of ["left", "right"]) {
      for (const phase of ["start", "middle", "end"]) {
        const hand_heights = handHeightsRef.current[side][phase];
        const arm_angles = armAnglesRef.current[side][phase];
        const excursion = hand_heights.length
          ? (Math.max(...hand_heights) - Math.min(...hand_heights)).toFixed(3)
          : "N/A";
        const maxAngle = arm_angles.length
          ? Math.max(...arm_angles).toFixed(1)
          : "N/A";
        results[side][phase] = { excursion, maxAngle };
      }
    }

    resultsRef.current = results;

    const adviceList = generateAdvice({
      phaseScores : phaseScoresRef.current,
      results,
      level: savedLevel,
    });

    adviceRef.current = adviceList;

    setResultsTable(
      createResultsTableGame1({
        phaseScores: phaseScoresRef.current,
        results,
        adviceList,
      })
    );
  };



  const onResume = () => {
    if (pauseStartTimeRef.current) {
      const pauseDuration = Date.now() - pauseStartTimeRef.current;
      startTimeRef.current += pauseDuration;
      pauseStartTimeRef.current = null; 
    }
    setGameState("preparing");
  };



  const onResults = (results) => {
    const { ctx, w, h } = handleVideo(videoRef, canvasRef, results, gameStateRef, setGameState, start);

    if (gameStateRef.current === "playing") {
      const redLineY = drawRedLine(ctx, w, h, redLineYRef, maxHeight)
      if (!results.poseLandmarks) {
        return;
      }
      const coords_hands = getHandCoordinates(results.poseLandmarks, w, h);
      const leftShoulder = results.poseLandmarks[11];
      const rightShoulder = results.poseLandmarks[12];
      const leftWrist = results.poseLandmarks[15];
      const rightWrist = results.poseLandmarks[16];
      const leftHip = results.poseLandmarks[23];
      const rightHip = results.poseLandmarks[24];
      if (coords_hands.left_hand && coords_hands.right_hand){
        const phase = getCurrentPhase(startTimeRef.current, sessionDurationRef.current, currentPhaseRef);
        updateHandData( phase, coords_hands.left_hand, leftShoulder, leftWrist, leftHip, handHeightsRef, armAnglesRef, h, "left");
        updateHandData( phase, coords_hands.right_hand, rightShoulder, rightWrist, rightHip, handHeightsRef, armAnglesRef, h, "right");
        handleStar( starRef, coords_hands, h, w, redLineY, setScore, setPhaseScores, startTimeRef, sessionDurationRef, lastStarTime, starImgRef, STAR_TYPES, startYRef, finalStartY, lastStarSideRef, ctx, currentPhaseRef);
      }
    }
  
  }

  

  const pauseGame = () => {
    pauseStartTimeRef.current = Date.now(); 
    setGameState("paused");
  };

  useEffect(() => {
    if (gameState === "preparing" && startTimeRef.current && !autoPauseStartRef.current) {
      autoPauseStartRef.current = Date.now();
    }

    if ((gameState === "playing" || gameState === "paused") && autoPauseStartRef.current) {
      const pauseDuration = (Date.now() - autoPauseStartRef.current);
      startTimeRef.current += pauseDuration;
      autoPauseStartRef.current = null;
    }
  }, [gameState]);

  usePoseCamera({ videoRef, cameraRef, poseRef, gameStateRef, onResults});

 


  return (
    <GameLayout
      gameId={1}
      gameTitle="Star Game"
      statusItems={[
        {label: "Score", value: score},
        {label: "Time left", value: timeLeft + "s"},
      ]}
      gameState={gameState}
      countdown={countdown}
      onPause={pauseGame}
      onResume={onResume}
      onRestart={() => window.location.reload()}
      onQuit={() => {
        navigate("/home");
        window.location.reload();
      }}
      resultsTable={resultsTable} 
      onSaveResults={onSaveResultsGame1}
      helpText={
        <>
          ✦ Move your hands to touch the stars that appear on the screen.<br/><br/>
          ✦ Each star you collect increases your score.<br/><br/>
          ✦ If you're not in the center of the screen, the game will stop.<br/><br/>
          ✦ You have limited time, reach the highest score possible!
        </>
      }
    >
      <video ref={videoRef} className="game-video" playsInline muted autoPlay/>
      <canvas ref={canvasRef} className="game-canvas"/>
    </GameLayout>
  );
}

export default Game1;
