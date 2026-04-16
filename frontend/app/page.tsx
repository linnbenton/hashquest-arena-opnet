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

  const [hasClaimed, setHasClaimed] = useState(false)

  const isClient = typeof window !== "undefined";

if (isClient) {
  console.log("STATUS WALLET DI PUSAT:");
}

  function updatePlayer(playerWallet: string, playerTickets: number) {
    if (!playerWallet) return
    setPlayers(prev => {
      const existing = prev.find(p => p.address === playerWallet)
      if (existing) {
        return prev.map(p =>
          p.address === playerWallet ? { ...p, tickets: playerTickets } : p
        )
      }
      return [...prev, { address: playerWallet, tickets: playerTickets }]
    })
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden p-6">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full flex flex-col items-center max-w-6xl">
        <h1 className="text-4xl font-black text-cyan-400 mb-8 text-center drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          <span className="lightning-wrap">
  ⚡
  <span className="lightning-flash" />
</span> HASHQUEST ARENA <span className="rocket-wrap">
  <span className="rocket-icon">🚀</span>
  <span className="rocket-fire"></span>
</span>
        </h1>

        <div className="mb-6 text-yellow-400 font-bold text-lg relative">
          <div className="animate-pulse bg-yellow-400/10 px-4 py-1 rounded-full border border-yellow-400/30">
            💰 Prize Pool: {pool}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[1400px] px-6 items-stretch mb-10">
          <div className="flex w-full">
            <Miner 
              wallet={wallet} 
              setWalletParent={setWallet}
              onTickets={(t: number) => {
                setTickets(t);
                updatePlayer(wallet, t);
              }}
              onClaim={(amount: number) => {
                setPool(prev => prev + amount);
                setHasClaimed(true);
              }}
            />
          </div>

          <div className="flex w-full">
            <RafflePanel
              players={players}
              setPlayers={setPlayers}
              pool={pool}
              setPool={setPool}
              wallet={wallet}
              myTickets={tickets} // ✅ TAMBAH INI
              hasClaimed={hasClaimed}
              setHasClaimed={setHasClaimed}
           />
          </div>
        </div>

        <div className="w-full">
          <Leaderboard />
        </div>
      </div>
    </main>
  )
}