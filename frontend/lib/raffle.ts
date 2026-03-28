// lib/raffle.ts

export type Player = {
  address: string
  tickets: number
}

/* 🎰 PICK WINNER (DETERMINISTIC) */
export function pickWinnerFair(players: Player[], seed: string): Player | null {

  if (!players.length) return null

  const pool: string[] = []

  players.forEach(p => {
    for (let i = 0; i < p.tickets; i++) {
      pool.push(p.address)
    }
  })

  if (pool.length === 0) return null

  // 🔐 hash seed
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }

  const index = hash % pool.length
  const winnerAddress = pool[index]

  return players.find(p => p.address === winnerAddress) || null
}

/* 🔍 VERIFY */
export function verifyWinner(
  players: Player[],
  seed: string,
  expectedAddress: string
) {
  const result = pickWinnerFair(players, seed)
  return result?.address === expectedAddress
}

/* 🛡 ANTI CHEAT */
export function clampTickets(t: number, max = 1000) {
  if (!Number.isFinite(t) || t < 0) return 0
  return Math.min(Math.floor(t), max)
}