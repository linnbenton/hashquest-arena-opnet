"use client";

import { useEffect, useRef, useState } from "react";

export default function RafflePanel({ raffleData }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [players, setPlayers] = useState<any[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [reward, setReward] = useState<string | null>(null);

  const tickRef = useRef<HTMLAudioElement | null>(null);
  const winRef = useRef<HTMLAudioElement | null>(null);

  // 🎁 REWARD CONFIG
  const rewards = [
    { label: "0.5 GEN", icon: "/tokens/gen.svg", value: 0.5 },
    { label: "1 GEN", icon: "/tokens/gen.svg", value: 1 },
    { label: "2 GEN", icon: "/tokens/gen.svg", value: 2 },
    { label: "5 GEN", icon: "/tokens/gen.svg", value: 5 },
    { label: "JACKPOT", icon: "/tokens/jackpot.svg", value: 20 },
  ];

  useEffect(() => {
    tickRef.current = new Audio("/click.mp3");
    winRef.current = new Audio("/win.mp3");
  }, []);

  // =========================
  // 🔄 PLAYERS
  // =========================
  useEffect(() => {
    if (!raffleData || raffleData.length === 0) {
      setPlayers([
        { wallet: "player1", tickets: 3 },
        { wallet: "player2", tickets: 5 },
      ]);
      return;
    }

    const map: Record<string, number> = {};

    raffleData.forEach((r: any) => {
      if (!r.wallet) return;
      map[r.wallet] = r.tickets;
    });

    setPlayers(
      Object.entries(map).map(([wallet, tickets]) => ({
        wallet,
        tickets,
      }))
    );
  }, [raffleData]);

  // =========================
  // 🎲 PICK WINNER
  // =========================
  function pickWinner(seed?: string) {
    if (!seed || typeof seed !== "string") return null;
    if (!players.length) return null;

    const total = players.reduce((s, p) => s + p.tickets, 0);
    if (total === 0) return null;

    let rand =
      (parseInt(seed.slice(0, 8), 16) / 0xffffffff) * total;

    for (const p of players) {
      if (rand < p.tickets) return p.wallet;
      rand -= p.tickets;
    }

    return players[0]?.wallet || null;
  }

  // =========================
  // 🎁 PICK REWARD
  // =========================
  function pickReward(seed?: string) {
    if (!seed || typeof seed !== "string") {
      return { label: "NO REWARD", value: 0 };
    }

    const index =
      parseInt(seed.slice(8, 10), 16) % rewards.length;

    return rewards[index];
  }

  // =========================
  // 🎰 SPIN
  // =========================
  async function spin() {
    if (spinning) return;

    setSpinning(true);
    setWinner(null);
    setReward(null);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 170;

    const total = players.reduce((s, p) => s + p.tickets, 0);

    let angle = 0;
    let velocity = Math.random() * 0.4 + 0.35;

    // 🎇 PARTICLE EXPLOSION
    function explosion(
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number
    ) {
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.arc(
          cx + Math.random() * 120 - 60,
          cy + Math.random() * 120 - 60,
          3,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `hsl(${Math.random() * 360},100%,50%)`;
        ctx.fill();
      }
    }

    const images: HTMLImageElement[] = rewards.map((r) => {
      const img = new Image();
      img.src = r.icon;
      return img;
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let start = angle;

      players.forEach((p, i) => {
        const slice = (p.tickets / total) * Math.PI * 2;

        const grad = ctx.createLinearGradient(0, 0, 400, 400);
        grad.addColorStop(0, `hsl(${i * 60}, 90%, 60%)`);
        grad.addColorStop(1, `hsl(${i * 60}, 90%, 30%)`);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, start + slice);
        ctx.fillStyle = grad;
        ctx.fill();

        // 🪙 ICON
        const mid = start + slice / 2;
        const tx = cx + Math.cos(mid) * 110;
        const ty = cy + Math.sin(mid) * 110;

        const img = images[i % images.length];
        ctx.drawImage(img, tx - 12, ty - 12, 24, 24);

        start += slice;
      });

      // 🔺 POINTER
      ctx.shadowColor = "yellow";
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - radius - 10);
      ctx.lineTo(cx + 10, cy - radius - 10);
      ctx.lineTo(cx, cy - radius + 10);
      ctx.fillStyle = "white";
      ctx.fill();

      ctx.shadowBlur = 0;

      angle += velocity;
      velocity *= 0.97;

      if (velocity > 0.05 && tickRef.current) {
        tickRef.current.currentTime = 0;
        tickRef.current.play().catch(() => {});
      }

      if (velocity > 0.002) {
        requestAnimationFrame(draw);
      } else {
        finish();
      }
    }

    async function finish() {
      const reveal = await fetch("/api/raffle/reveal");
      const r = await reveal.json();

      // ✅ SAFE CHECK
      if (!r?.seed) {
        console.error("❌ SEED UNDEFINED:", r);
        setSpinning(false);
        return;
      }

      const w = pickWinner(r.seed);
      const rewardData = pickReward(r.seed);

      setWinner(w);
      setReward(rewardData.label);

      // 🔊 WIN SOUND
      winRef.current?.play().catch(() => {});

      // 💥 JACKPOT EFFECT
      if (rewardData.label === "JACKPOT") {
        document.body.classList.add("jackpot-brutal");

        document.body.animate(
          [
            { transform: "translate(0px)" },
            { transform: "translate(-10px)" },
            { transform: "translate(10px)" },
            { transform: "translate(-10px)" },
            { transform: "translate(0px)" },
          ],
          { duration: 400 }
        );

        explosion(ctx, cx, cy);

        new Audio("/jackpot.mp3").play().catch(() => {});

        setTimeout(() => {
          document.body.classList.remove("jackpot-brutal");
        }, 2000);
      }

      // 🔗 CLAIM
      await fetch("/api/raffle/claim", {
        method: "POST",
        body: JSON.stringify({
          wallet: w,
          amount: rewardData.value,
        }),
      });

      setSpinning(false);
    }

    draw();
  }

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col gap-10 p-8 bg-black/40 rounded-3xl border-4 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.6)]">
      {/* Header Section */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎰</span>
            <h2 className="text-purple-400 font-black text-xl tracking-wider uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
              RAFFLE LOTTERY
            </h2>
          </div>
          </div>
      
      {/* Canvas Roda (Logika kamu tetap berjalan di sini) */}
      <canvas
        ref={canvasRef}
        width={350} 
        height={350}
        className="rounded-full border-8 border-purple-900/50 shadow-[0_0_30px_rgba(168,85,247,0.8)] bg-gradient-to-b from-purple-500/10 to-transparent"
      />

      {/* Tombol Spin Premium */}
      <button
        onClick={spin}
        disabled={spinning}
        className={`
          w-full py-4 rounded-xl font-black text-white uppercase tracking-widest
          transition-all duration-300 shadow-lg
          ${spinning 
            ? 'bg-gray-600 cursor-not-allowed opacity-50' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.8)] active:scale-95 border-b-4 border-purple-800'
          }
        `}
      >
        {spinning ? "Berputar..." : "🎰 Draw Winner"}
      </button>

      {/* Box Pengumuman Pemenang */}
      {winner && (
        <div className="w-full mt-2 p-4 bg-zinc-900/80 border border-green-500/50 rounded-xl text-center shadow-inner animate-pulse">
          <span className="text-green-400 font-bold text-lg drop-shadow-md">🏆 Winner: {winner}</span>
          <br />
          <span className="text-yellow-400 font-bold text-md drop-shadow-md">🎁 Reward: {reward}</span>
        </div>
      )}
    </div>
  );
}