export const dynamic = "force-dynamic"

import { MerkleTree } from "merkletreejs";
import { ethers } from "ethers";
import keccak256 from "keccak256";

/* 🔥 HASH LEAF (HARUS SAMA DENGAN BACKEND) */
function hashLeaf(address: string, reward: number) {
  return Buffer.from(
    ethers.solidityPackedKeccak256(
      ["string", "uint256"],
      [address.toLowerCase(), reward]
    ).slice(2),
    "hex"
  );
}

/* 🌳 GENERATE TREE */
export function generateTree(data: any[]) {
  const normalized = data.map((x) => ({
    address: x.address.toLowerCase(),
    reward: Number(x.reward),
  }));

  const leaves = normalized.map((x) =>
    hashLeaf(x.address, x.reward)
  );

  const tree = new MerkleTree(leaves, keccak256, {
  sortPairs: true,
});

  console.log("🌳 TOTAL LEAVES:", leaves.length);
  console.log("🌳 ROOT:", tree.getHexRoot());

  return {
    tree,
    root: tree.getHexRoot(),
    leaves,
  };
}

/* 🔑 GET PROOF */
export function getProof(
  tree: MerkleTree,
  address: string,
  reward: number
) {
  const leaf = hashLeaf(address, reward);

  const proof = tree.getHexProof(leaf);

  console.log("🌿 LEAF:", leaf.toString("hex"));
  console.log("🧾 PROOF:", proof);

  return proof;
}