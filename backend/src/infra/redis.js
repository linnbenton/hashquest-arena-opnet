const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.connect();

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

module.exports = redis;
