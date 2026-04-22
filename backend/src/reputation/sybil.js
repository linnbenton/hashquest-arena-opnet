const redis = require("../infra/redis");

/**
 * hybrid reputation:
 * - offchain activity
 * - wallet age
 * - tx velocity
 */
async function getReputation(wallet) {
  const key = `rep:${wallet}`;

  let rep = await redis.get(key);

  if (!rep) {
    rep = {
      score: 50,
      createdAt: Date.now(),
    };
  } else {
    rep = JSON.parse(rep);
  }

  return rep;
}

async function updateReputation(wallet, delta) {
  const rep = await getReputation(wallet);

  rep.score += delta;
  rep.score = Math.max(0, Math.min(100, rep.score));

  await redis.set(`rep:${wallet}`, JSON.stringify(rep), {
    EX: 60 * 60 * 24 * 7,
  });

  return rep;
}

module.exports = {
  getReputation,
  updateReputation,
};
