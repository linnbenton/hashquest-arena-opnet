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
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full flex flex-col items-center">

        <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
          ⚡ HASHQUEST ARENA 🚀
        </h1>

        {/* 💰 POOL */}
        <div className="mb-4 text-yellow-400 text-sm relative">
          <div className="animate-pulse">
            💰 Prize Pool: {pool}
          </div>

          {pool > 0 && (
            <div className="absolute inset-0 blur-md opacity-40 bg-yellow-400 animate-ping rounded-full"></div>
          )}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl px-4 items-stretch">

          <div className="flex items-stretch">
            <div className="w-full bg-black/40 border border-cyan-500 rounded-xl">
              <Miner
                setWallet={setWallet}
                onTickets={(t: number) => {
                  setTickets(t)
                  updatePlayer(wallet, t)
                }}
                onClaim={(amount: number) => {
                  setPool(prev => prev + amount)
                }}
              />
            </div>
          </div>

          <div className="flex items-stretch">
            <div className="w-full bg-black/40 border border-purple-500 rounded-xl">
              <RafflePanel
                players={players}
                pool={pool}
                setPool={setPool}
              />
            </div>
          </div>

        </div>

        {/* 🔥 LEADERBOARD (INI YANG KURANG) */}
        <Leaderboard />

      </div>

    </main>
  )
}