"use client";

import { useEffect, useState } from "react";

/* ✅ TYPE */
type Player = {
  address: string;
  reward: number;
};

export default function Leaderboard() {

  const [players, setPlayers] = useState<Player[]>([]);

  async function loadLeaderboard() {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setPlayers(data || []);
    } catch (err) {
      console.log("leaderboard error:", err);
    }
  }

  useEffect(() => {
    loadLeaderboard();

    const interval = setInterval(() => {
      loadLeaderboard();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="
      mt-10 
      w-[340px] 
      mx-auto 
      flex flex-col 
      items-center 
      text-center 
      bg-black/40 
      p-4 
      rounded-xl 
      border border-yellow-500
      shadow-[0_0_20px_rgba(255,215,0,0.5)]
    ">

      <h2 className="
        text-yellow-400 
        text-lg 
        mb-3 
        font-bold
        drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]
      ">
        🏆 Top Miners
      </h2>

      {players.length === 0 && (
        <div className="text-gray-400 text-sm">
          No miners yet
        </div>
      )}

      {players.map((p, i) => {

        const isWhale = p.reward > 5; // 🔥 threshold whale
        const isTop3 = i < 3;

        return (
          <div
            key={i}
            className={`
              flex justify-between w-full text-sm py-1 px-2 rounded
              border-b border-gray-700
              transition-all duration-300
              ${isTop3 ? "bg-yellow-500/10 scale-[1.02]" : ""}
              ${isWhale ? "text-purple-400 font-bold" : ""}
            `}
          >
            {/* RANK */}
            <span className="text-yellow-400 flex items-center gap-1">
              {i === 0 && "🥇"}
              {i === 1 && "🥈"}
              {i === 2 && "🥉"}
              #{i + 1}
            </span>

            {/* ADDRESS */}
            <span className="text-green-400 break-all">
              {p.address.slice(0, 8)}...
            </span>

            {/* REWARD + WHALE */}
            <span className="text-cyan-400 flex items-center gap-1">
              {Number(p.reward).toFixed(2)}
              {isWhale && "🐋"}
            </span>
          </div>
        );
      })}

    </div>
  );
}