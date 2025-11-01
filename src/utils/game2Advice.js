export function addCloudResults({ cloudResultsRef, cloudNumber, stabilityPercent }) {
  cloudResultsRef.current.push({
    Cloud: cloudNumber,
    "Stability (%)": stabilityPercent,
  });
}


export function generateGame2Advice({ results = [], symmetryData = []}) {
  const advice = [];
  
  if (!results.length) {
    advice.push("There is not enough gameplay data to provide feedback.");
    return advice;
  }

  /*
  * Calculates the average symmetry error: a lower value indicates more balanced arm movement.
  */
  const avgSymmetryError = symmetryData.length > 0 ? symmetryData.reduce((sum, v) => sum + v, 0) / symmetryData.length : null;

  if (avgSymmetryError != null) {
    console.log(avgSymmetryError)
    if (avgSymmetryError <= 0.08){
      advice.push("Excellent arm symmetry!");
    }
    else if ( avgSymmetryError > 0.08 && avgSymmetryError < 0.15) {
      advice.push(
        "You maintained good symmetry, but you can improve a bit more for a more precise trajectory."
      );
    } 
    else if ( avgSymmetryError >= 0.15) {
      advice.push(
        "Keep your arms more symmetrical to control the balloon better."
      );
    } 
  }

  /*
  * Evaluates how stable the player’s arms were during contact with clouds.
  */
  const stabilityValues = results.map((c) => Number(c["Stability (%)"]) || 0);
  const avgStability =
    stabilityValues.length > 0
      ? stabilityValues.reduce((a, b) => a + b, 0) / stabilityValues.length
      : null;

  if (avgStability != null) {
    if (avgStability <= 60) {
      advice.push(
        "Try to be more stable with your arms. Hold your position when you touch the cloud."
      );
    } else if (avgStability <= 80) {
      advice.push(
        "Good control, but you could improve your stability a little during contact with the clouds."
      );
    } else {
      advice.push("Excellent stability! You held your position well.");
    }
  }

  return advice;
}
