const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { ethers } = require("ethers");

const connection = new IORedis(process.env.REDIS_URL);

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const relayer = new ethers.Wallet(process.env.RELAYER_PK, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  require("../abi/Reward.json"),
  relayer,
);

const worker = new Worker(
  "claim-queue",
  async (job) => {
    const { wallet, reward, nonce, signature, timestamp } = job.data;

    console.log("🚀 Processing job:", job.id);

    const tx = await contract.claimRewardGasless(
      wallet,
      reward,
      timestamp,
      nonce,
      signature,
      {
        gasLimit: 200000,
      },
    );

    const receipt = await tx.wait();

    console.log("✅ TX SUCCESS:", receipt.hash);

    return receipt.hash;
  },
  {
    connection,
    concurrency: 2,
  },
);

worker.on("failed", (job, err) => {
  console.error("❌ FAILED:", job.id, err.message);
});
