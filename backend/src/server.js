const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
require("dotenv").config();

const redis = require("./infra/redis");
const claimQueue = require("./infra/queue");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * ======================
 * BASIC ROUTES
 * ======================
 */
app.get("/", (req, res) => {
  res.json({ status: "backend alive" });
});

app.get("/api/spin", (req, res) => {
  res.json({ ok: true, message: "spin working" });
});

/**
 * ======================
 * SIGNER INIT (SECURE)
 * ======================
 */
if (!process.env.SIGNER_PK) {
  throw new Error("SIGNER_PK not set in environment variables");
}

const signer = new ethers.Wallet(process.env.SIGNER_PK);
console.log("SIGNER READY:", signer.address);

/**
 * ======================
 * HEALTH CHECK
 * ======================
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
    redis: redis?.isOpen ? "connected" : "disconnected",
  });
});

/**
 * ======================
 * CLAIM ENDPOINT
 * ======================
 */
app.post("/api/claim", async (req, res) => {
  try {
    const { wallet, reward, nonce, signature } = req.body;

    if (!wallet || !reward || !nonce || !signature) {
      return res.status(400).json({ error: "INVALID_INPUT" });
    }

    /**
     * IP RATE LIMIT
     */
    const ipRaw =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    const rateKey = `ip:${ipRaw}`;
    const count = await redis.incr(rateKey);

    if (count === 1) await redis.expire(rateKey, 10); // 10 detik window
    if (count > 20) {
      return res.status(429).json({ error: "RATE_LIMITED" });
    }

    /**
     * NONCE PROTECTION
     */
    const nonceKey = `nonce:${nonce}`;
    const exists = await redis.get(nonceKey);

    if (exists) {
      return res.status(400).json({ error: "REPLAY_DETECTED" });
    }

    await redis.set(nonceKey, "1", { EX: 600 });

    /**
     * SIGNATURE REUSE
     */
    const sigKey = `sig:${signature}`;
    const usedSig = await redis.get(sigKey);

    if (usedSig) {
      return res.status(400).json({ error: "SIGNATURE_REUSED" });
    }

    await redis.set(sigKey, "1", { EX: 1800 });

    /**
     * WALLET COOLDOWN
     */
    const walletKey = `wallet:${wallet}:cooldown`;
    const last = await redis.get(walletKey);
    const now = Date.now();

    if (last && now - Number(last) < 5000) {
      return res.status(429).json({ error: "COOLDOWN" });
    }

    await redis.set(walletKey, String(now), { EX: 60 });

    /**
     * QUEUE JOB
     */
    const job = await claimQueue.add("claim", {
      wallet,
      reward,
      nonce,
      signature,
      timestamp: now,
    });

    return res.json({
      status: "QUEUED",
      jobId: job.id,
    });
  } catch (err) {
    console.error("CLAIM_ERROR:", err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

/**
 * ======================
 * START SERVER
 * ======================
 */
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});
