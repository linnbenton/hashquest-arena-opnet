"use client";

import { useState } from "react";

/* 🪙 TOKEN PILL */
const PILL_CONTRACT =
  "opt1sqp5gx9k0nrqph3sy3aeyzt673dz7ygtqxcfdqfle";

export default function DeployContract() {
  const [loading, setLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [error, setError] = useState("");

  /* 🚀 DEPLOY CONTRACT (WASM) */
  async function deploy() {
    try {
      setLoading(true);
      setError("");

      const opnet = (window as any).opnet;

      if (!opnet) {
        throw new Error("OPNET wallet not found");
      }

      console.log("🚀 LOAD WASM...");

      /* 🔥 LOAD WASM */
      const res = await fetch("/wasm/release.wasm");
      if (!res.ok) {
        throw new Error("Failed to load WASM file");
      }

      const buffer = await res.arrayBuffer();
      const bytecode = new Uint8Array(buffer);

      console.log("🚀 DEPLOY...");

      /* 🔥 DEPLOY VIA signInteraction */
      const tx = await opnet.signInteraction({
        interaction: {
          type: "deploy",
          bytecode: bytecode,
          params: [],
          message: "0x",
        },
      });

      console.log("DEPLOY TX:", tx);

      const addr =
        tx?.contractAddress ||
        tx?.address;

      if (!addr) {
        throw new Error("No contract address returned");
      }

      setContractAddress(addr);

      console.log("✅ CONTRACT:", addr);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Deploy failed");
    } finally {
      setLoading(false);
    }
  }

  /* 💰 FUND CONTRACT */
  async function fundContract() {
    try {
      const opnet = (window as any).opnet;

      if (!contractAddress) {
        throw new Error("Deploy contract first");
      }

      const amount = "100000000000000000000"; // 100 PILL

      console.log("💰 FUNDING:", contractAddress);

      const tx = await opnet.signInteraction({
        interaction: {
          contract: PILL_CONTRACT,
          method: "transfer",
          params: [contractAddress, amount],
          message: "0x",
        },
      });

      console.log("💸 FUND TX:", tx);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Funding failed");
    }
  }

  return (
    <div className="p-4 border border-cyan-500 rounded-xl bg-black/40 text-white">

      <h2 className="text-lg font-bold text-cyan-400 mb-3">
        🚀 Deploy Contract (OPNET)
      </h2>

      {/* DEPLOY BUTTON */}
      <button
        onClick={deploy}
        disabled={loading}
        className="bg-green-600 px-4 py-2 rounded"
      >
        {loading ? "Deploying..." : "Deploy Contract"}
      </button>

      {/* ADDRESS */}
      {contractAddress && (
        <div className="mt-3 text-green-400 break-all">
          ✅ {contractAddress}
        </div>
      )}

      {/* FUND BUTTON */}
      {contractAddress && (
        <button
          onClick={fundContract}
          className="mt-3 bg-yellow-600 px-4 py-2 rounded"
        >
          💰 Fund Contract
        </button>
      )}

      {/* ERROR */}
      {error && (
        <div className="mt-3 text-red-400">
          ❌ {error}
        </div>
      )}

    </div>
  );
}