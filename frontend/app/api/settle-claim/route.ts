import { NextResponse } from "next/server";
import * as OPNet from "@btc-vision/transaction";

const CONTRACT_ADDRESS =
  "opt1sqp5gx9k0nrqph3sy3aeyzt673dz7ygtqxcfdqfle";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const address = body?.address;
    const reward = Number(body?.reward || 0);

    console.log("📥 REQUEST:", body);

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Invalid address" },
        { status: 400 }
      );
    }

    const PRIVATE_KEY = process.env.DEV_PRIVATE_KEY;

    if (!PRIVATE_KEY || typeof PRIVATE_KEY !== "string") {
      return NextResponse.json(
        { error: "Missing PRIVATE KEY" },
        { status: 500 }
      );
    }

    const safeReward = Math.min(reward, 10);

    console.log("💰 REWARD:", safeReward);

    const Wallet = (OPNet as any).Wallet;
    const TransactionBuilder = (OPNet as any).TransactionBuilder;
    const Address = (OPNet as any).Address;

    /* 🔥 FIX: PAKAI WIF STRING LANGSUNG */
    const wallet = new Wallet(PRIVATE_KEY);

    const fromAddress = wallet.getAddress();

    console.log("🔑 WALLET:", fromAddress);

    let toAddress;

    try {
      toAddress = Address.fromString(address);
    } catch {
      return NextResponse.json(
        { error: "Invalid address parsing" },
        { status: 400 }
      );
    }

    /* 🔥 BUILDER */
    const builder = new TransactionBuilder();

    const tx = await builder.buildContractExecution({
      from: fromAddress,
      contract: CONTRACT_ADDRESS,
      method: "execute",
      args: {
        action: "transfer",
        to: toAddress,
        amount: safeReward,
      },
    });

    console.log("🧱 TX BUILT");

    const signedTx = await wallet.signTransaction(tx);

    console.log("✍️ TX SIGNED");

    const result = await builder.broadcast(signedTx);

    console.log("🚀 TX RESULT:", result);

    if (!result || !result.txid) {
      return NextResponse.json(
        { error: "TX failed", raw: result },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      txid: result.txid,
    });

  } catch (err: any) {
    console.error("❌ BACKEND ERROR:", err);

    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}