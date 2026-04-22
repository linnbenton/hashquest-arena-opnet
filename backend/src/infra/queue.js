const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL);

const claimQueue = new Queue("claim-queue", {
  connection,
});

module.exports = claimQueue;
