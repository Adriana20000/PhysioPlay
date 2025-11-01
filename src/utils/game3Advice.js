
export function generateGame3Advice({ obstacleResults = [] }) {
  const advice = [];

  if (!obstacleResults.length) {
    advice.push("There is not enough gameplay data to provide feedback.");
    return advice;
  }

 
  /*
  * Calculate how many obstacles were successfully avoided.
  */
  const total = obstacleResults.length;
  const passedCount = obstacleResults.filter((r) => r.passed === "✅").length;

  const successRate = (passedCount / total) * 100;


  if (successRate < 50) {
    advice.push("Bend your knee more to avoid obstacles more effectively");
  } else if (50 < successRate < 80) {
    advice.push(
      "Good job! You managed to avoid several obstacles, but you can improve a bit more by bending your knee better"
    );
  } else {
    advice.push("Great job! You avoided most of the obstacles");
  }

  

  return advice;
}
