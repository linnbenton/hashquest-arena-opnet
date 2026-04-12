import { NextResponse } from "next/server";
import crypto from "crypto";

// INIT GLOBAL
if (!(globalThis as any).__raffleSeed) {
  (globalThis as any).__raffleSeed = null;
}

export async function GET() {
  try {
    const seed = crypto.randomBytes(32).toString("hex");

    const hash = crypto.createHash("sha256").update(seed).digest("hex");

    globalThis.__raffleSeed = seed;

    return NextResponse.json({
      commit: hash,
    });
  } catch {
    return NextResponse.json({ error: "commit failed" }, { status: 500 });
  }
}

// globals.d.ts
export {};

declare global {
  var __raffleSeed: string | null;
}