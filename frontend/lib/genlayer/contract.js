// ===== LOCAL VALIDATION (TETAP) =====
function validateClaim(input) {
  const { miningRate, timeElapsed, userPattern } = input;

  if (miningRate > 120) {
    return { status: "REJECT", reason: "Rate too high" };
  }

  if (timeElapsed < 5) {
    return { status: "REJECT", reason: "Too fast" };
  }

  const score = evaluateBehavior(userPattern);

  if (score < 0.3) {
    return { status: "REJECT", reason: "Bot-like behavior" };
  }

  if (score < 0.6) {
    return { status: "SUSPICIOUS", reason: "Unusual pattern" };
  }

  return { status: "ACCEPT", reason: "Valid" };
}

function evaluateBehavior(pattern) {
  if (!pattern) return 0.5;

  let score = 1;

  if (pattern.repetition > 0.9) score -= 0.5;
  if (pattern.variance < 0.1) score -= 0.3;
  if (pattern.sessionTime < 10) score -= 0.2;

  return Math.max(0, score);
}

// ===== IMPORT GENLAYER (FIXED) =====
const { validateGameplay } = require("./contractApi"); // ⬅️ penting!

// ===== HYBRID =====
async function validateClaimHybrid(input, player) {
  const localResult = validateClaim(input); // ✅ FIX (bukan recursive)

  const payload = {
    miningRate: input.miningRate,
    timeElapsed: input.timeElapsed,
    repetition: input.userPattern?.repetition * 100 || 0,
    variance: input.userPattern?.variance * 100 || 100,
    suspicion: 1
  };

  let aiResult = null;

  try {
    aiResult = await validateGameplay(payload, player);
  } catch (err) {
    console.error("GenLayer error:", err);
  }

  if (!aiResult || aiResult.decision === "ERROR") {
    return {
      ...localResult,
      source: "LOCAL_ONLY"
    };
  }

  if (aiResult.decision === "REJECT") {
    return {
      status: "REJECT",
      reason: "AI detected suspicious behavior",
      source: "GENLAYER"
    };
  }

  if (aiResult.decision === "SUSPICIOUS") {
    return {
      status:
        localResult.status === "ACCEPT"
          ? "SUSPICIOUS"
          : localResult.status,
      reason: "AI flagged unusual activity",
      source: "HYBRID"
    };
  }

  return {
    ...localResult,
    source: "LOCAL_PRIORITY"
  };
}

module.exports = {
  validateClaim,
  validateClaimHybrid
};