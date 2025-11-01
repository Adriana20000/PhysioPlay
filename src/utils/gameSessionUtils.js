import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";


/*
 * Main function that:
 * - Prepares the canvas.
 * - Draws the detected body pose.
 * - Checks whether the player is visible and updates the game state.
*/
export function handleVideo(videoRef, canvasRef, results, gameStateRef, setGameState, startCount) {
  const { ctx, w, h } = prepareCanvas(videoRef, canvasRef) || {};
  if (!ctx) return;

  drawPose(ctx, results.poseLandmarks);

  checkGameState({
    landmarks: results.poseLandmarks,
    gameStateRef,
    setGameState,
    startCount
  });

  return { ctx, w, h };
}


export function prepareCanvas(videoRef, canvasRef) {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!canvas || !video) return null;

  const ctx = canvas.getContext("2d");
  const w = video.videoWidth;
  const h = video.videoHeight;

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}



export function drawPose(ctx, landmarks) {
  if (!ctx || !landmarks) return;
    drawConnectors(ctx, landmarks, POSE_CONNECTIONS, { lineWidth: 3 });
    drawLandmarks(ctx, landmarks, { lineWidth: 2 });
}



export function isBodyVisible(landmarks) {
  if (!landmarks || landmarks.length === 0) return false;

  return landmarks.every((lm) => {
    return lm && lm.visibility > 0.5 && lm.x > 0 && lm.x < 1 && lm.y > 0 && lm.y < 1;
  });

}


export function checkGameState({ landmarks, gameStateRef, setGameState, startCount}) {
  const visible = isBodyVisible(landmarks);

  if (gameStateRef.current === "preparing" && visible) {
    setTimeout(() => {
      if (gameStateRef.current === "preparing") startCount(setGameState);
    }, 800);
  }

  if (gameStateRef.current === "playing" && !visible) {
    setGameState("preparing");
  }
  return; 
}


