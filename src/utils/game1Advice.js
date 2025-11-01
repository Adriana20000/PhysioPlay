
export function generateAdvice({ phaseScores = {}, results = {}, level = "medium" }) {
  const advice = [];

  // If there are no results, provide a generic message and stop.
  if (!results) {
    advice.push("There is not enough gameplay data to provide feedback.");
    return advice;
  }

  
  const safe = (obj, path, fallback = 0) => {
    try {
      return path.split(".").reduce((acc, key) => acc && acc[key], obj) ?? fallback;
    } catch {
      return fallback;
    }
  };


  // Extracts the number of stars collected in each phase
  const start = phaseScores.start || 0;
  const middle = phaseScores.middle || 0;
  const end = phaseScores.end || 0;


  const avgStars = (start + middle + end) / 3;
  const dropRatio = start > 0 ? end / start : 1;


  if (level !== "low" && dropRatio < 0.5) {
    advice.push(
      "You collected many more stars in the initial phase than in the final one. You might have gotten tired. I suggest trying a lower level to improve your endurance."
    );
  }

  

  if (level !== "high" && dropRatio > 0.9 && avgStars > 3) {
    advice.push(
      "You maintained great consistency between phases! You could try moving up a level for a greater challenge"
    );
  }

 
  const avgRight =
    (Number(safe(results, "right.start.maxAngle")) +
      Number(safe(results, "right.middle.maxAngle")) +
      Number(safe(results, "right.end.maxAngle"))) /
    3;

  const avgLeft =
    (Number(safe(results, "left.start.maxAngle")) +
      Number(safe(results, "left.middle.maxAngle")) +
      Number(safe(results, "left.end.maxAngle"))) /
    3;

  if (Math.abs(avgRight - avgLeft) > 15) {
    const weakerSide = avgRight < avgLeft ? "right" : "left";
    advice.push(
      `Your ${weakerSide} arm seems a bit weaker.`
    );
  }



  return advice;
}
