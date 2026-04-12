"use client"

import { useState } from "react"
import Miner from "../components/Miner"
import RafflePanel from "../components/RafflePanel"
import Leaderboard from "../components/Leaderboard"

export default function Home() {

  const [tickets, setTickets] = useState(0)
  const [wallet, setWallet] = useState("")

  const [players, setPlayers] = useState<any[]>([])
  const [pool, setPool] = useState(0)

  function updatePlayer(wallet: string, tickets: number) {
    if (!wallet) return

    setPlayers(prev => {
      const existing = prev.find(p => p.address === wallet)

      if (existing) {
        return prev.map(p =>
          p.address === wallet ? { ...p, tickets } : p
        )
      }

      return [...prev, { address: wallet, tickets }]
    })
  }

return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden p-6">
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full flex flex-col items-center max-w-6xl">

        <h1 className="text-4xl font-black text-cyan-400 mb-8 text-center drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          ⚡ HASHQUEST ARENA 🚀
        </h1>

        {/* 💰 POOL */}
        <div className="mb-6 text-yellow-400 font-bold text-lg relative">
          <div className="animate-pulse bg-yellow-400/10 px-4 py-1 rounded-full border border-yellow-400/30">
            💰 Prize Pool: {pool}
          </div>
        </div>

        {/* GRID - Kita perlebar max-width-nya agar kotak tidak menyusut */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[1400px] px-6 items-stretch mb-10">

  {/* Kolom Kiri */}
  <div className="flex w-full">
    <Miner
      setWallet={setWallet}
      onTickets={(t: number) => {
        setTickets(t);
        updatePlayer(wallet, t);
      }}
      onClaim={(amount: number) => {
        setPool(prev => prev + amount);
      }}
    />
  </div>

  {/* Kolom Kanan */}
  <div className="flex w-full">
    <RafflePanel
      players={players}
      pool={pool}
      setPool={setPool}
    />
  </div>

</div>

        {/* 🔥 LEADERBOARD */}
        <div className="w-full">
          <Leaderboard />
        </div>

      </div>
    </main>
  )
}