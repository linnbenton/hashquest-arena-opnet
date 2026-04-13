"use client";

import { useEffect, useRef, useState } from "react";

export default function RafflePanel({
  players,
  setPlayers,
  wallet,
  pool,
  setPool,
  hasClaimed,
  setHasClaimed 
}: any) {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tokenImagesRef = useRef<HTMLImageElement[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [reward, setReward] = useState<string | null>(null);
  const tickRef = useRef<HTMLAudioElement | null>(null);
  const winRef = useRef<HTMLAudioElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [jackpotPool, setJackpotPool] = useState(50);

  const rewards = [
    { label: "0.5 GEN", icon: "/tokens/gen.svg", value: 0.5 },
    { label: "1 GEN", icon: "/tokens/gen.svg", value: 1 },
    { label: "2 GEN", icon: "/tokens/gen.svg", value: 2 },
    { label: "5 PILL", icon: "/tokens/pill.png", value: 5 },
    { label: "JACKPOT", icon: "/tokens/jackpot.svg", value: 20 },
  ];

  function pickReward() {
    const table = [
      { label: "0.5 GEN", value: 0.5, chance: 40 },
      { label: "1 GEN", value: 1, chance: 30 },
      { label: "2 GEN", value: 2, chance: 20 },
      { label: "5 PILL", value: 5, chance: 9 },
      { label: "JACKPOT", value: jackpotPool, chance: 1 },
    ];
    const rand = Math.random() * 100;
    let acc = 0;
    for (const r of table) {
      acc += r.chance;
      if (rand <= acc) return r;
    }
    return table[0];
  }

  const myTickets = Array.isArray(players) && players.length > 0 ? players[0].tickets : 0;

  useEffect(() => {
    const gen = new Image(); gen.src = "/tokens/gen.svg";
    const pill = new Image(); pill.src = "/tokens/pill.png";
    const jackpot = new Image(); jackpot.src = "/tokens/jackpot.svg";
    tokenImagesRef.current = [gen, pill, gen, pill, jackpot];
  }, []);

  async function spin() {
    if (!hasClaimed) { alert("Claim reward first!"); return; }
    if (!wallet) { alert("Connect wallet first"); return; }
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    setReward(null);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 170;

    if (myTickets <= 0) { alert("No tickets!"); setIsSpinning(false); return; }

    setPlayers((prev: any[]) =>
      prev.map((p) => p.wallet === wallet ? { ...p, tickets: Math.max(0, p.tickets - 1) } : p)
    );

    let angle = 0;
    let velocity = Math.random() * 0.4 + 0.35;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const totalTickets = players.reduce((s: number, p: any) => s + (p.tickets || 0), 0);
      const activePlayers = players.filter((p: any) => p.tickets > 0 || totalTickets === 0);

      // --- 1. WHEEL (IKUT BERPUTAR) ---
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.translate(-cx, -cy);

      let currentAngle = 0;
      players.forEach((p: any, i: number) => {
        // Jika total tiket > 0 pakai porsi, jika tidak bagi rata (untuk visual)
        const slice = totalTickets > 0 
          ? (p.tickets / totalTickets) * Math.PI * 2 
          : (1 / players.length) * Math.PI * 2;

        if (slice <= 0 && totalTickets > 0) return;

        const colors = ["#7c3aed", "#22c55e", "#3b82f6", "#f97316", "#eab308"];
        const color = colors[i % colors.length];

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, currentAngle, currentAngle + slice);
        ctx.closePath();

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, color);
        grad.addColorStop(1, "#000");
        
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Icon & Teks
        const mid = currentAngle + slice / 2;
        const tx = cx + Math.cos(mid) * (radius * 0.65);
        const ty = cy + Math.sin(mid) * (radius * 0.65);
        const img = tokenImagesRef.current[i % tokenImagesRef.current.length];
        
        if (img && img.complete) {
          ctx.drawImage(img, tx - 15, ty - 15, 30, 30);
        }
        
        ctx.fillStyle = "white";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(p.wallet?.slice(0, 4) || "P", tx, ty + 25);

        currentAngle += slice; // UPDATE UNTUK PLAYER BERIKUTNYA
      });
      ctx.restore();

      // --- 2. OVERLAY (STATIS) ---
      // Border Roda
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 6;
      ctx.stroke();

      // Pointer Atas
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius + 15);
      ctx.lineTo(cx - 15, cy - radius - 10);
      ctx.lineTo(cx + 15, cy - radius - 10);
      ctx.fill();

      angle += velocity;
      velocity *= 0.985;

      if (velocity > 0.002) {
        requestAnimationFrame(draw);
      } else {
        setIsSpinning(false);
        finish();
      }
    }

    function finish() {
      const total = players.reduce((s: number, p: any) => s + p.tickets, 0);
      let rand = Math.random() * total;
      let winnerWallet = players[0]?.wallet || "UNKNOWN";
      for (const p of players) {
        if (rand < p.tickets) { winnerWallet = p.wallet; break; }
        rand -= p.tickets;
      }

      const rewardData = pickReward();
      setWinner(winnerWallet);
      setReward(rewardData.label);
      if (rewardData.label !== "JACKPOT") setJackpotPool(p => p + 1);
      else setJackpotPool(50);
      setHasClaimed(false);
    }

    draw();
  }

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col gap-10 p-8 bg-black/40 rounded-3xl border-4 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.6)]">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎰</span>
          <h2 className="text-purple-400 font-black text-xl tracking-wider uppercase">RAFFLE LOTTERY</h2>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center min-h-[450px]">
        <canvas ref={canvasRef} width={350} height={350} className="rounded-full border-[10px] border-purple-900/60 shadow-[0_0_60px_rgba(168,85,247,0.9)]" />
        <div className="h-24 w-full flex items-center justify-center mt-4 px-2">
          {winner ? (
            <div className="w-full p-3 bg-zinc-900/80 border border-green-500/50 rounded-xl text-center">
              <span className="text-green-400 font-bold">🏆 Winner: {winner}</span><br />
              <span className="text-yellow-400 font-bold">🎁 Reward: {reward}</span>
            </div>
          ) : <p className="text-zinc-700 italic text-xs uppercase opacity-40">Waiting for draw results...</p>}
        </div>
      </div>

      <div className="mt-auto w-full h-32 flex flex-col justify-start pt-10">
        <button
          onClick={spin}
          disabled={!wallet || isSpinning || myTickets <= 0 || !hasClaimed}
          className={`w-full py-4 rounded-xl font-black text-white uppercase tracking-widest transition-all ${!wallet || isSpinning || myTickets <= 0 || !hasClaimed ? 'bg-zinc-800 text-zinc-500' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02]'}`}
        >
          {isSpinning ? "🎰 SPINNING..." : "🎟 DRAW WINNER"}
        </button>
      </div>
    </div>
  );
}