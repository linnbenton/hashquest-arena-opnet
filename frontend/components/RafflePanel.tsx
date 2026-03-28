"use client";

import { useState, useRef } from "react";
import { pickWinnerFair, verifyWinner } from "../lib/raffle";

type Player = {
  address: string;
  tickets: number;
};

export default function RafflePanel({ players = [] }: any) {

  const [winner, setWinner] = useState<Player | null>(null);

  const [rolling, setRolling] = useState(false);
  const [seed, setSeed] = useState("");
  const [seedHash, setSeedHash] = useState("");
  const [verified, setVerified] = useState<boolean | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [jackpot, setJackpot] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /* 🔊 SOUND */
  const clickSound =
    typeof Audio !== "undefined" ? new Audio("/click.mp3") : null;

  const winSound =
    typeof Audio !== "undefined" ? new Audio("/win.mp3") : null;

  /* 🎰 DRAW */
  const drawWinner = async () => {
    if (rolling) return;
    if (!players.length) return;

    clickSound?.play();

    setRolling(true);
    setVerified(null);

    document.body.classList.add("jackpot-flash");
    setTimeout(() => {
      document.body.classList.remove("jackpot-flash");
    }, 300);

    try {
      let realSeed = Date.now().toString();

      try {
        const res = await fetch("/api/blockhash");
        const data = await res.json();
        if (data?.blockHash) {
          realSeed = data.blockHash;
        }
      } catch {
        console.warn("⚠️ fallback to local seed");
      }

      const buffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(realSeed)
      );

      const hashHex = Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      setSeedHash(hashHex);
      setRevealing(true);

      setTimeout(async () => {

        const result = pickWinnerFair(players, realSeed);

        /* 🔥 ON-CHAIN SYNC */
        const opnet = (window as any).opnet;

        if (opnet?.web3?.provider && result) {
          try {
            await opnet.web3.provider.signAndBroadcastInteraction({
              type: "call",
              to: "opt1sqqchh073tjuyhf45m25tqxk5np49vn94juv36ly8",
              data: `draw:${result.address}`
            });
          } catch (e) {
            console.warn("⚠️ on-chain draw failed (safe ignore)", e);
          }
        }

        setSeed(realSeed);
        setWinner(result);
        setRolling(false);
        setRevealing(false);

        if (result) {
          winSound?.play();

          const ok = verifyWinner(players, realSeed, result.address);
          setVerified(ok);

          fireConfetti();

          /* 💥 JACKPOT */
          setJackpot(true);
          setTimeout(() => setJackpot(false), 1200);

          /* OPTIONAL payout */
          if (opnet?.sendTransaction) {
            try {
              await opnet.sendTransaction({
                to: result.address,
                amount: 10
              });
            } catch (e) {
              console.error("Payout failed", e);
            }
          }
        }

      }, 1800);

    } catch (err) {
      console.error(err);
      setRolling(false);
    }
  };

  /* 🎉 CONFETTI */
  function fireConfetti() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);

    const colors = ["#a855f7", "#22c55e", "#3b82f6"];

    const pieces = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * W,
      y: -10,
      size: Math.random() * 5 + 3,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    let frame = 0;

    function loop() {
      frame++;
      ctx.clearRect(0, 0, W, H);

      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      if (frame < 100) requestAnimationFrame(loop);
    }

    loop();
  }

  const totalTickets = players.reduce(
    (a: number, b: Player) => a + b.tickets,
    0
  );

  return (
    <div
      className={`
        relative 
        p-4 
        rounded-xl 
        text-center 
        overflow-hidden

        bg-black/40
        border border-purple-500

        transition-all duration-300

        /* 🔥 MATCH MINER EXACTLY */
        shadow-[0_0_25px_#a855f7]
        hover:shadow-[0_0_60px_#a855f7]
        hover:scale-[1.02]

        ${rolling ? "scale-[1.04] shadow-[0_0_90px_#a855f7]" : ""}
      `}
    >

      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      <div className="relative z-10">

        <h2 className="text-xl text-purple-400 mb-2 font-bold">
          🎟 Raffle Lottery
        </h2>

        <p className="text-sm text-gray-300">
          Players: {players.length}
        </p>

        <p className="text-sm text-cyan-300">
          Total Tickets: {totalTickets}
        </p>

        <button
          onClick={drawWinner}
          disabled={rolling || players.length === 0}
          className="bg-green-500 px-4 py-2 rounded mt-3 disabled:opacity-50"
        >
          {rolling ? "Drawing..." : "Draw Winner"}
        </button>

        {/* 🎰 SPIN */}
        {rolling && (
          <div className="text-yellow-400 text-2xl mt-2 animate-spin">
            🎰
          </div>
        )}

        {/* 🔍 REVEAL */}
        {revealing && (
          <p className="text-purple-400">
            🔍 Revealing...
          </p>
        )}

        {/* 🏆 WINNER */}
        {winner && (
          <div className="mt-3 relative">

            <div className="text-green-400 break-all font-bold text-lg animate-pulse">
              🏆 {winner.address}
            </div>

            <div className="absolute inset-0 bg-green-400 blur-xl opacity-30 animate-ping rounded-full"></div>

          </div>
        )}

        {seedHash && (
          <p className="text-xs mt-2 text-gray-400 break-all">
            Commit: {seedHash}
          </p>
        )}

        {seed && (
          <p className="text-xs text-gray-500 break-all">
            Seed: {seed}
          </p>
        )}

        {verified !== null && (
          <p className="mt-2">
            {verified ? "✅ Fair" : "❌ Invalid"}
          </p>
        )}

      </div>

      {/* 💥 JACKPOT FULLSCREEN */}
      {jackpot && (
        <div className="fixed inset-0 z-50 pointer-events-none">

          <div className="absolute inset-0 bg-purple-500 opacity-20 animate-ping"></div>

          <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-purple-400 animate-bounce">
            💥 JACKPOT 💥
          </div>

        </div>
      )}

    </div>
  );
}