const crypto = require("crypto");

/**
 * deterministic VRF-like randomness
 * (production upgrade: Chainlink VRF recommended)
 */
function generateVRF(seed) {
  return crypto.createHash("sha256").update(seed).digest("hex");
}

function isJackpot(wallet, nonce, blockHash) {
  const seed = wallet + nonce + blockHash;

  const vrf = generateVRF(seed);

  const numeric = parseInt(vrf.slice(0, 8), 16);

  // 1% jackpot probability
  return numeric % 100 === 0;
}

module.exports = {
  isJackpot,
};
