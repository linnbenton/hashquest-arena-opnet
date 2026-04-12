import { NextResponse } from "next/server";

export async function GET() {
  try {
    const seed = globalThis.__raffleSeed;

    if (!seed) {
      return NextResponse.json(
        { error: "Seed not ready" },
        { status: 400 }
      );
    }

    return NextResponse.json({ seed });
  } catch {
    return NextResponse.json({ error: "reveal failed" }, { status: 500 });
  }
}