import { NextResponse } from "next/server";

// 🧠 SIMPLE MEMORY (ANTI-SPAM / ANTI-CHEAT RINGAN)
const lastClaims: Record<string, number> = {};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { wallet, reward, txid, timestamp } = body;

    console.log("🧠 GenLayer REAL CALL:", {
      wallet,
      reward,
      txid,
      timestamp,
    });

    // ✅ VALIDASI DASAR
    if (!wallet || typeof reward !== "number") {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    // 🔒 ANTI-CHEAT (COOLDOWN 3 DETIK)
    const now = Date.now();
    const last = lastClaims[wallet] || 0;

    if (now - last < 3000) {
      console.log("🚫 Anti-spam triggered");

      return NextResponse.json({
        status: "blocked",
        multiplier: 0,
        rewardFinal: 0,
        reason: "Too fast claim",
      });
    }

    lastClaims[wallet] = now;

    // 🧠 AI ENGINE
    let multiplier = 1;

    const randomFactor = Math.random();
    const luckyRoll = Math.random();

    // 🎯 BASED ON SKILL (REWARD SIZE)
    if (reward >= 5 && randomFactor > 0.5) multiplier = 2;
    if (reward >= 10 && randomFactor > 0.7) multiplier = 3;
    if (reward >= 15 && randomFactor > 0.8) multiplier = 5;

    // 🎰 LUCK SYSTEM (RARE EVENT)
    if (luckyRoll > 0.95) {
      multiplier = 10;
      console.log("💰 JACKPOT HIT!");
    }

    // 🧠 PENALTY (LOW SKILL)
    if (reward < 2 && randomFactor < 0.3) {
      multiplier = 0;
    }

    const rewardFinal = reward * multiplier;

    console.log("🧠 AI RESULT:", {
      reward,
      multiplier,
      rewardFinal,
      randomFactor,
      luckyRoll,
    });

    return NextResponse.json({
      status: "executed",
      multiplier,
      rewardFinal,
      randomFactor,
      luckyRoll,
    });

  } catch (err: any) {
    console.error("❌ GenLayer API error:", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}