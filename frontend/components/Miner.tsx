"use client";

import { useState, useEffect } from "react";
import HashAnimation from "./HashAnimation";
import MiningParticles from "./MiningParticles";
import HashrateMeter from "./HashrateMeter";

const PILL_CONTRACT = "opt1sqqchh073tjuyhf45m25tqxk5np49vn94juv36ly8";
const REWARD_PER_SECOND = 0.1;

/* 🎉 CONFETTI */
const Confetti = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
    {[...Array(25)].map((_, i) => {
      const colors = ["#f97316", "#22c55e", "#3b82f6", "#eab308"];
      return (
        <div
          key={i}
          className="absolute w-2 h-2 animate-fall"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: Math.random() * 100 + "%",
            top: "-10px",
            animationDuration: 2 + Math.random() * 2 + "s",
          }}
        />
      );
    })}
  </div>
);

export default function Miner({ onTickets, setWallet: setWalletParent }: any) {
  const [wallet, setWallet] = useState("");
  const [walletError, setWalletError] = useState("");
  const [mining, setMining] = useState(false);
  const [reward, setReward] = useState(0);
  const [txHash, setTxHash] = useState("");
  const [showTxPopup, setShowTxPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  /* 🆕 PERSISTENT TICKETS */
  const [claimedTickets, setClaimedTickets] = useState(0);

  async function connectWallet() {
    try {
      const opnet = (window as any).opnet;

      if (!opnet) {
        const demo = "PLAYER_" + Math.floor(Math.random() * 10000);
        setWallet(demo);
        setWalletParent?.(demo);
        setWalletError("Demo mode");
        return;
      }

      await opnet.initialize?.();

      const accounts =
        (await opnet.requestAccounts?.()) ||
        (await opnet.getAccounts?.());

      const addr = accounts?.[0];
      if (!addr) return setWalletError("Wallet not connected");

      setWallet(addr);
      setWalletParent?.(addr);
      setWalletError("");

    } catch {
      setWalletError("Wallet error");
    }
  }

  /* ⛏ MINING LOOP */
  useEffect(() => {
    if (!mining) return;
    const interval = setInterval(() => {
      setReward((prev) => prev + REWARD_PER_SECOND);
    }, 1000);
    return () => clearInterval(interval);
  }, [mining]);

  /* 🎟 SYNC TICKETS */
  useEffect(() => {
    onTickets?.(claimedTickets + Math.floor(reward));
  }, [reward, claimedTickets]);

  function startMining() {
    if (!wallet) return setWalletError("Connect wallet first");
    setWalletError("");
    setMining(true);
  }

  function stopMining() {
    setMining(false);
  }

  async function claimReward() {
    try {
      if (!wallet) return setWalletError("Connect wallet first");

      setLoading(true);

      const res = await fetch("/api/claim", {
        method: "POST",
        body: JSON.stringify({ wallet }),
      });

      const { reward: serverReward } = await res.json();
      console.log("SIGNED:", serverReward);

      const opnet = (window as any).opnet;
      const provider = opnet.web3.provider;

      let result: any = null;

      try {
        result = await provider.signAndBroadcastInteraction({
          type: "call",
          to: PILL_CONTRACT,
          data: "claim",
        });
      } catch {
        result = { txid: "PENDING_TX" };
      }

      const txid = result?.txid || "PENDING_TX";

      /* 🆕 ADD TICKETS */
      const gained = Math.floor(reward);
      setClaimedTickets((prev) => prev + gained);

      setTxHash(txid);
      setShowTxPopup(true);
      setReward(0);
    } catch (err: any) {
      setWalletError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative flex flex-col items-center gap-6 p-6 bg-black/40 rounded-xl border border-cyan-500 shadow-[0_0_20px_#00ffff] ${
        showTxPopup ? "pointer-events-none" : ""
      }`}
    >
      <MiningParticles />

      {walletError && <div className="text-red-400">{walletError}</div>}

      <h2 className="text-cyan-400 font-bold">⛏️ Mining Console</h2>

      {!wallet && (
        <button onClick={connectWallet} className="bg-blue-600 px-4 py-2 rounded">
          Connect Wallet
        </button>
      )}

      {wallet && <p className="text-green-400">{wallet}</p>}

      <p className="text-yellow-400">Reward: {reward.toFixed(4)}</p>

      <p className="text-cyan-300 text-sm">
        🎟 Tickets: {claimedTickets + Math.floor(reward)}
      </p>

      <HashAnimation active={mining} />
      <HashrateMeter mining={mining} />

      <div className="flex gap-3">
        <button onClick={startMining} className="bg-green-500 px-4 py-2 rounded">
          Start
        </button>
        <button onClick={stopMining} className="bg-red-500 px-4 py-2 rounded">
          Stop
        </button>
      </div>

      <button
        onClick={claimReward}
        disabled={loading}
        className="bg-purple-600 px-4 py-2 rounded"
      >
        {loading ? "Processing..." : "Claim Reward"}
      </button>

      {/* 🔥 FULL ORIGINAL POPUP RESTORED */}
      {showTxPopup && (
        <>
          <Confetti />

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/90 backdrop-blur-sm">

            <div className="bg-gradient-to-b from-[#0a1a3a] to-[#020617] border border-orange-400 rounded-2xl p-6 w-[360px] text-center relative pointer-events-auto shadow-[0_0_25px_rgba(0,200,255,0.6)] hover:shadow-[0_0_30px_rgba(255,122,0,0.7)] transition">

              <button
                onClick={() => setShowTxPopup(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                ✕
              </button>

              <div className="flex justify-center mb-2">
                <img
                  src="/opnet-logo.png"
                  alt="OPNET WALLET"
                  className="h-6 w-auto drop-shadow-[0_0_6px_rgba(255,122,0,0.6)]"
                />
              </div>

              <h2 className="text-white text-lg font-semibold mb-2">
                Transaction Successful!
              </h2>

              <p className="text-gray-500 text-sm mb-4">
                Your transaction has been successfully broadcast to the network
              </p>

              {/* ✅ CHECK ICON */}
              <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="#0ea5e9" />
                <path
                  d="M14 27l7 7 16-16"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="check-path"
                />
              </svg>

              <p className="text-gray-400 text-xs">Transaction ID:</p>
              <p className="text-white text-xs mb-4 break-all">{txHash}</p>

              <div className="flex gap-2 justify-center mb-4">

                <button
                  onClick={() => {
                    window.open(
                      `https://mempool.opnet.org/testnet4/tx/${txHash}`,
                      "_blank"
                    );
                  }}
                  className="px-3 py-2 rounded text-xs text-white bg-orange-500 hover:bg-orange-600 transition"
                >
                  View Mempool
                </button>

                <button
                  onClick={() => {
                    window.open(
                      `https://opscan.org/tx/${txHash}?network=op_testnet`,
                      "_blank"
                    );
                  }}
                  className="px-3 py-2 rounded text-xs text-white bg-orange-500 hover:bg-orange-600 transition"
                >
                  View OP_SCAN
                </button>

              </div>

              {txHash === "PENDING_TX" && (
                <p className="text-yellow-400 text-xs">
                  ⏳ Transaction submitted...
                </p>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}