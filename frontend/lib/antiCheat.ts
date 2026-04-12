const { validateClaim } = require("./genlayer/contract");

export async function runAntiCheat(input: any) {
  try {
    const result = validateClaim(input);

    return {
      ok: true,
      decision: result.status || "UNKNOWN",

      // 🔥 normalize output
      confidence: result.confidence ?? 0.5,

      reasons: Array.isArray(result.reasons)
        ? result.reasons
        : result.reason
        ? [result.reason]
        : []
    };

  } catch (err) {
    console.warn("⚠️ AntiCheat crash:", err);

    return {
      ok: false,
      decision: "ERROR",
      confidence: 0,
      reasons: ["Anti-cheat failed"]
    };
  }
}