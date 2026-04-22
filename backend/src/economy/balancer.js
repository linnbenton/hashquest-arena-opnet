const redis = require("../infra/redis");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function calculateReward({
  baseReward,
  repScore,
  botScore,
  poolPressure,
}) {
  // 🔥 anti inflation curve
  const reputationFactor = repScore / 100; // 0 - 1
  const botPenalty = 1 - botScore / 100; // 0 - 1
  const poolDecay = 1 - clamp(poolPressure / 100000, 0, 0.8);

  const finalMultiplier = reputationFactor * botPenalty * poolDecay;

  const reward = baseReward * finalMultiplier;

  return Math.max(0, Math.floor(reward));
}

async function updatePool(amount) {
  const key = "global:rewardPool";

  const pool = Number((await redis.get(key)) || 100000);

  const newPool = pool - amount;

  await redis.set(key, String(newPool));

  return newPool;
}

module.exports = {
  calculateReward,
  updatePool,
};
