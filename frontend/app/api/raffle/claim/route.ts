import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function POST(req: Request) {
  const { wallet, amount } = await req.json();

  try {
    const provider = new ethers.JsonRpcProvider(process.env.REMOVED);

    const signer = new ethers.Wallet(
      process.env.REMOVED!,
      provider
    );

    const contract = new ethers.Contract(
      process.env.REWARD_CONTRACT!,
      ["function reward(address to, uint256 amount) public"],
      signer
    );

    const tx = await contract.reward(
      wallet,
      ethers.parseUnits(amount.toString(), 18)
    );

    await tx.wait();

    return NextResponse.json({ success: true, tx: tx.hash });
  } catch (e) {
    return NextResponse.json({ error: "claim failed" }, { status: 500 });
  }
}