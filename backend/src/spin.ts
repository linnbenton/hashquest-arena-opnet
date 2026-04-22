import { Request, Response } from "express";
import crypto from "crypto";
import { ethers } from "ethers";

const PRIVATE_KEY = process.env.SIGNER_PK || "0xabc"; // dummy dulu
const signer = new ethers.Wallet(PRIVATE_KEY);

export async function spinHandler(req: Request, res: Response) {
  try {
    const { wallet } = req.body;

    if (!wallet) {
      return res.status(400).json({ error: "NO WALLET" });
    }

    const rewards = ["GEN", "PILL", "JACKPOT", "TRY AGAIN"];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    const nonce = crypto.randomUUID();

    const hash = ethers.solidityPackedKeccak256(
      ["address", "string", "string"],
      [wallet, reward, nonce],
    );

    const signature = await signer.signMessage(ethers.getBytes(hash));

    return res.json({
      reward,
      nonce,
      signature,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "SERVER ERROR" });
  }
}
