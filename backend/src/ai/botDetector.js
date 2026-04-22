const redis = require("../infra/redis");

async function botScore({ wallet, ip, userAgent }) {
  let score = 0;

  const walletKey = `wallet:freq:${wallet}`;
  const ipKey = `ip:freq:${ip}`;

  const walletHits = await redis.incr(walletKey);
  await redis.expire(walletKey, 60);

  const ipHits = await redis.incr(ipKey);
  await redis.expire(ipKey, 10);

  if (walletHits > 20) score += 40;
  if (ipHits > 50) score += 50;
  if (!userAgent || userAgent.length < 10) score += 20;

  return Math.min(score, 100);
}

module.exports = { botScore };
