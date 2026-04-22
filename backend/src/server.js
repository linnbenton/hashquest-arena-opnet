const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { ethers } = require("ethers");

require("dotenv").config();

const redis = require("./infra/redis");
const claimQueue = require("./infra/queue");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

// 🔐 SIGNER (ONLY FOR OFFCHAIN SIGN)
const signer = new ethers.Wallet(process.env.SIGNER_PK);
console.log("SIGNER:", signer.address);

/**
 * 🔥 CLAIM ENTRY POINT (QUEUE-BASED, STATLESS)
 */
app.post("/api/claim", async (req, res) => {
  try {
    const { wallet, reward, nonce, signature } = req.body;

    if (!wallet || !reward || !nonce || !signature) {
      return res.status(400).json({ error: "INVALID_INPUT" });
    }

    // -----------------------------
    // 🔒 1. RATE LIMIT (IP)
    // -----------------------------
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const rateKey = `ip:${ip}`;
    const count = await redis.incr(rateKey);

    if (count === 1) await redis.expire(rateKey, 1);
    if (count > 10) {
      return res.status(429).json({ error: "RATE_LIMITED" });
    }

    // -----------------------------
    // 🔒 2. REPLAY PROTECTION (NONCE)
    // -----------------------------
    const nonceKey = `nonce:${nonce}`;
    const exists = await redis.get(nonceKey);

    if (exists) {
      return res.status(400).json({ error: "REPLAY_DETECTED" });
    }

    await redis.set(nonceKey, "1", {
      EX: 60 * 10,
    });

    // -----------------------------
    // 🔒 3. SIGNATURE REUSE PROTECTION
    // -----------------------------
    const sigKey = `sig:${signature}`;
    const usedSig = await redis.get(sigKey);

    if (usedSig) {
      return res.status(400).json({ error: "SIGNATURE_REUSED" });
    }

    await redis.set(sigKey, "1", {
      EX: 60 * 30,
    });

    // -----------------------------
    // 🔒 4. WALLET COOLDOWN
    // -----------------------------
    const walletKey = `wallet:${wallet}:cooldown`;
    const last = await redis.get(walletKey);
    const now = Date.now();

    if (last && now - Number(last) < 5000) {
      return res.status(429).json({ error: "COOLDOWN" });
    }

    await redis.set(walletKey, now.toString(), {
      EX: 60,
    });

    // -----------------------------
    // ⚡ QUEUE JOB (NO BLOCK TX)
    // -----------------------------
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
    console.error(err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on", PORT);
});
