import { useEffect } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

export function usePoseCamera({ videoRef, cameraRef, poseRef, gameStateRef, onResults }) {
  
  const stopCamera = () => {
    try { cameraRef.current?.stop(); cameraRef.current = null; } catch {}
    try { poseRef.current?.close(); poseRef.current = null; } catch {}
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (poseRef.current) return;

    poseRef.current = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    poseRef.current.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    poseRef.current.onResults(onResults);

    let isMounted = true;
    
    // Initialize and start the camera if available
    if (typeof Camera !== "undefined" && videoRef.current) {
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (!isMounted) return;
          if (poseRef.current && gameStateRef.current !== "paused") {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
      });
      cameraRef.current.start();
    }

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);
}
