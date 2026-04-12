export async function genLayerValidate(input: any) {
  const { miningRate, timeElapsed, userPattern } = input;

  // rule + reasoning (GenLayer style)
  if (miningRate > 150) {
    return {
      decision: "REJECT",
      reason: "Abnormal mining rate",
      confidence: 0.95
    };
  }

  if (timeElapsed < 2) {
    return {
      decision: "REJECT",
      reason: "Action too fast for human interaction",
      confidence: 0.9
    };
  }

  let score = 1;

  if (userPattern.repetition > 0.9) score -= 0.5;
  if (userPattern.variance < 0.1) score -= 0.3;
  if (userPattern.sessionTime < 10) score -= 0.2;

  if (score < 0.4) {
    return {
      decision: "REJECT",
      reason: "Bot-like behavioral pattern",
      confidence: 0.85
    };
  }

  if (score < 0.7) {
    return {
      decision: "SUSPICIOUS",
      reason: "Unusual interaction pattern",
      confidence: 0.6
    };
  }

  return {
    decision: "ACCEPT",
    reason: "Valid human-like interaction",
    confidence: 0.9
  };
}