const { botScore } = require("../ai/botDetector");
const { getReputation } = require("../reputation/sybil");
const { calculateReward } = require("../economy/balancer");
const { isJackpot } = require("../vrf/jackpot");

async function computeFinalReward({
  wallet,
  ip,
  userAgent,
  baseReward,
  nonce,
  blockHash,
}) {
  const bot = await botScore({ wallet, ip, userAgent });
  const rep = await getReputation(wallet);

  let reward = await calculateReward({
    baseReward,
    repScore: rep.score,
    botScore: bot,
    poolPressure: 50000,
  });

  const jackpot = isJackpot(wallet, nonce, blockHash);

  if (jackpot) {
    reward *= 10;
  }

  return {
    reward,
    botScore: bot,
    repScore: rep.score,
    jackpot,
  };
}

module.exports = {
  computeFinalReward,
};
