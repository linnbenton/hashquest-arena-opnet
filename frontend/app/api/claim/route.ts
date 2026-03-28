import crypto from "crypto";

const SECRET = process.env.SECRET_KEY || "fallback_secret";

const walletHits: Record<string, number> = {};

const lastClaim: Record<string, number> = {};
const COOLDOWN = 60 * 1000;

export async function POST(req: Request) {
  try {
    const { wallet } = await req.json();

    if (!wallet) {
      return Response.json({ error: "NO_WALLET" }, { status: 400 });
    }

    const now = Date.now();
    const last = lastClaim[wallet] || 0;

    if (now - last < COOLDOWN) {
      return Response.json({
        error: "COOLDOWN",
        wait: Math.ceil((COOLDOWN - (now - last)) / 1000),
      });
    }

    // 🎯 reward stabil (bukan random liar)
    const reward = Math.floor(Math.random() * 3) + 1;

    const message = `${wallet}:${reward}`;

    const sig = crypto
      .createHmac("sha256", SECRET)
      .update(message)
      .digest("hex");

    // 🔥 TEMP: BELUM KIRIM TOKEN (hindari crash)
    console.log("SEND PILL →", wallet, reward);

    lastClaim[wallet] = now;

    return Response.json({
      reward,
      sig,
      status: "OK",
    });

  } catch (err: any) {
    console.error("API ERROR:", err);
    return Response.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}