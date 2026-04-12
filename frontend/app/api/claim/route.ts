import { NextResponse } from "next/server";

let lastClaimMap: Record<string, number> = {};
let fingerprintMap: Record<string, boolean> = {};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const wallet = body.wallet;

    if (!wallet) {
      return NextResponse.json({ error: "No wallet" }, { status: 400 });
    }

    // =========================
    // 🧠 RATE LIMIT (ANTI SPAM)
    // =========================
    const now = Date.now();
    const last = lastClaimMap[wallet] || 0;

    if (now - last < 5000) {
      return NextResponse.json({ status: "blocked" });
    }

    lastClaimMap[wallet] = now;

    // =========================
    // 🧠 ANTI MULTI WALLET (BASIC)
    // =========================
    const ip =
      (req.headers.get("x-forwarded-for") || "unknown").split(",")[0];

    const ua = req.headers.get("user-agent") || "unknown";

    const fingerprint = ip + "|" + ua;

    if (fingerprintMap[fingerprint]) {
      return NextResponse.json({ status: "blocked" });
    }

    fingerprintMap[fingerprint] = true;

    // =========================
    // 🎁 REWARD
    // =========================
    const reward = Math.floor(Math.random() * 5) + 1;

    return NextResponse.json({
      reward,
    });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}