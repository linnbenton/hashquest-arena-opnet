import { supabase } from "../../../lib/supabase";
import { MerkleTree } from "merkletreejs";
import { ethers } from "ethers";
import keccak256 from "keccak256";

/* 🔥 HASH (FINAL - ABI ENCODE) */
function hashLeaf(address: string, reward: number) {
  return Buffer.from(
    ethers.solidityPackedKeccak256(
      ["string", "uint256"],
      [address.toLowerCase(), reward]
    ).slice(2),
    "hex"
  );
}

/* 🌳 BUILD TREE */
function buildTree(data: any[]) {
  const normalized = data.map((x) => ({
    address: x.address.toLowerCase(),
    reward: Number(x.reward),
  }));

  const leaves = normalized.map((x) =>
    hashLeaf(x.address, x.reward)
  );

  console.log("🔥 SUPABASE DATA:", normalized);

  const tree = new MerkleTree(leaves, keccak256, {
  sortPairs: true,
});

  console.log("🌳 ROOT:", tree.getHexRoot());
  console.log("🌳 TOTAL LEAVES:", leaves.length);

  return { tree, normalized };
}

/* 🌳 GET ROOT */
export async function GET() {
  const { data } = await supabase
    .from("leaderboard")
    .select("*");

  if (!data || data.length === 0) {
    return Response.json({ error: "No data" });
  }

  const { tree } = buildTree(data);

  return Response.json({
    root: tree.getHexRoot(),
  });
}

/* 🔑 GET PROOF */
export async function POST(req: Request) {
  const body = await req.json();
  const address = body.address.toLowerCase();

  const { data } = await supabase
    .from("leaderboard")
    .select("*");

  if (!data || data.length === 0) {
    return Response.json({ error: "No data" });
  }

  const { tree, normalized } = buildTree(data);

  const user = normalized.find(
    (x) => x.address === address
  );

  console.log("🔍 SEARCH:", address);
  console.log("✅ FOUND:", user);

  if (!user) {
    return Response.json({ error: "Not eligible" });
  }

  const leaf = hashLeaf(user.address, user.reward);

  const proof = tree.getHexProof(leaf);

  console.log("🔐 HASH INPUT:", user.address, user.reward);
  console.log("🌿 LEAF HEX:", leaf.toString("hex"));
  console.log("🧾 PROOF:", proof);

  // ✅ proof kosong tetap valid
  return Response.json({
  proof,
  reward: user.reward,
 });

}