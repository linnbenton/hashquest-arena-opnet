"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type SliceContent =
  | { type: "text"; text: string }
  | { type: "img"; index: number };

export default function RafflePanel({
  players,
  wallet,
  hasClaimed,
  setHasClaimed,
}: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tokenImagesRef = useRef<HTMLImageElement[]>([]);
  const [targetLabel, setTargetLabel] = useState<string | null>(null);

  const [imagesReady, setImagesReady] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [reward, setReward] = useState<string | null>(null);

  const [slowPhase, setSlowPhase] = useState(false);
  const [pointerHit, setPointerHit] = useState(false);

  const spinSound = useRef<HTMLAudioElement | null>(null);
  const clickSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const jackpotSound = useRef<HTMLAudioElement | null>(null);

  const myTickets = players?.[0]?.tickets || 0;
  const lastTickRef = useRef(0);

  // 🔥 LOAD IMAGE
  useEffect(() => {
    const sources = [
      "/tokens/gen.svg",
      "/tokens/pill.png",
      "/tokens/jackpot.svg",
    ];

    let loaded = 0;

    const imgs: HTMLImageElement[] = sources.map((src) => {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        loaded++;
        if (loaded === sources.length) {
          tokenImagesRef.current = imgs;
          setImagesReady(true);
        }
      };

      return img;
    });
  }, []);

      useEffect(() => {
  spinSound.current = new Audio("/spin.mp3");
  spinSound.current.loop = true;
  spinSound.current.volume = 0.4;

  clickSound.current = new Audio("/click.mp3");
  clickSound.current.volume = 0.6;

  winSound.current = new Audio("/win.mp3");
  winSound.current.volume = 0.8;

  jackpotSound.current = new Audio("/jackpot.mp3");
  jackpotSound.current.volume = 1;
}, []);

  // 🎨 DRAW WHEEL (tetap)
  const drawWheel = (rotation = 0) => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesReady) return;

    const ctx = canvas.getContext("2d")!;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = 170;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);

    const sliceCount = 6;
    const sliceAngle = (Math.PI * 2) / sliceCount;

    const colors = [
      "#7c3aed",
      "#ef4444",
      "#22c55e",
      "#3b82f6",
      "#f97316",
      "#eab308",
    ];

    const content: SliceContent[] = [
      { type: "img", index: 0 },
      { type: "text", text: "NO LUCKY" },
      { type: "img", index: 1 },
      { type: "text", text: "10X DRAW" },
      { type: "img", index: 2 },
      { type: "text", text: "TRY AGAIN" },
    ];

    for (let i = 0; i < sliceCount; i++) {
      const start = i * sliceAngle;
      const end = start + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, colors[i]);
      grad.addColorStop(1, "#111");

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = "#facc15"; // kuning
      ctx.lineWidth = 2;
      ctx.stroke();

      const mid = start + sliceAngle / 2;

const tx = cx + Math.cos(mid) * radius * 0.55;
const ty = cy + Math.sin(mid) * radius * 0.55;

const c = content[i];

ctx.save();
ctx.translate(tx, ty);

// ❌ NO ROTATE (BIAR TEXT TETAP TEGAK)
ctx.rotate(-rotation);

if (c.type === "text") {
  const displayText = c.text.replace("BONUS ", "");

  let fontSize = 16;
  if (displayText.length > 10) fontSize = 13;
  if (displayText.length > 14) fontSize = 11;

  ctx.fillStyle = "white";
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const words = displayText.split(" ");
  let line = "";
  let lines: string[] = [];

  for (let w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > 80) {
      lines.push(line);
      line = w + " ";
    } else {
      line = test;
    }
  }
  lines.push(line);

  const lineHeight = 14;
  const offsetY = -(lines.length - 1) * lineHeight / 2;

  lines.forEach((l, i) => {
    ctx.fillText(l.trim(), 0, offsetY + i * lineHeight);
  });
}

if (c.type === "img") {
  const img = tokenImagesRef.current[c.index];
  if (img && img.complete) {
    ctx.drawImage(img, -20, -20, 40, 40);
  }
}

// ✅ RESTORE LOCAL (WAJIB UNTUK TEXT/IMG)
ctx.restore();

} // <- PENUTUP LOOP SLICE

// ✅ RESTORE GLOBAL (INI YANG BIKIN POINTER GAK MUTER)
ctx.restore();

// 🔺 POINTER (FIXED, GAK IKUT ROTASI)
ctx.fillStyle = "#facc15";
ctx.beginPath();
ctx.moveTo(cx, cy - radius + 25);
ctx.lineTo(cx - 15, cy - radius);
ctx.lineTo(cx + 15, cy - radius);
ctx.closePath();
ctx.fill();

// 🔵 BORDER (TANPA POINTER LAGI)
ctx.beginPath();
ctx.arc(cx, cy, radius, 0, Math.PI * 2);
ctx.strokeStyle = "#a855f7";
ctx.lineWidth = 10;

if (!isSpinning) {
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 0;
} else {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
}

ctx.stroke();

};

useEffect(() => {
  drawWheel(0);
}, [imagesReady]);

const rewards: string[] = [
  "GEN",
  "NO LUCKY",
  "PILL",
  "BONUS 10X DRAW",
  "JACKPOT",
  "TRY AGAIN",
];

const getRewardByIndex = (index: number) => {
  return rewards[index] || "UNKNOWN";
};

// 🎰 SPIN (DARI KODE LAMA LO)
const spin = () => {
  if (!wallet || isSpinning || myTickets <= 0 || !hasClaimed) return;

  const rewardMap = [
  "GEN",
  "NO LUCKY",
  "PILL",
  "BONUS 10X DRAW",
  "JACKPOT",
  "TRY AGAIN",
];

const randomTarget =
  rewardMap[Math.floor(Math.random() * rewardMap.length)];

setTargetLabel(randomTarget);

  clickSound.current?.play();

  if (spinSound.current) {
    spinSound.current.currentTime = 0;
    spinSound.current.play();
  }

  setIsSpinning(true);
  setWinner(null);
  setReward(null);

  let angle = 0;

  // 🔥 kecepatan awal (kenceng)
  let velocity = 0.6 + Math.random() * 0.4; // lebih kenceng awal

  const friction = 0.992; // lebih lambat berhenti

  const animate = () => {
  angle += velocity;

  // 🔔 TICK PER SLICE
  const sliceAngle = (Math.PI * 2) / 6;
  const currentTick = Math.floor(angle / sliceAngle);

  if (currentTick !== lastTickRef.current) {
  lastTickRef.current = currentTick;

  if (clickSound.current) {
    const v = Math.min(1, velocity);

    // 🎧 volume dinamis
    clickSound.current.volume = 0.3 + v * 0.5;

    // ⚡ pitch dinamis (INI YANG LO MAU)
    clickSound.current.playbackRate = 0.8 + v * 0.4;

    clickSound.current.currentTime = 0;
    clickSound.current.play();
  }
}

  // pelan pelan melambat
  velocity *= friction;

    // slow phase (buat lampu)
    if (velocity < 0.08) {
      setSlowPhase(true);
    }

    if (velocity < 0.08) {
      velocity *= 0.98;
    }

    // 🎧 SYNC SOUND DENGAN KECEPATAN
    if (spinSound.current) {
      spinSound.current.playbackRate = 0.6 + velocity * 0.6;
    }

    // 🎧 TENSION: volume turun saat mendekati stop
    if (spinSound.current) {
      const minVol = 0.15;   // jangan sampai hilang total
      const maxVol = 0.4;    // volume awal yang sudah kita set
      const normalized = Math.min(1, velocity); // 0..1
      spinSound.current.volume = minVol + (maxVol - minVol) * normalized;
    }

    drawWheel(angle);

    if (velocity > 0.002) {
      requestAnimationFrame(animate);
    } else {

  // 🛑 stop spin sound
  if (spinSound.current) {
    spinSound.current.pause();
    spinSound.current.currentTime = 0;
  }

  // 🎬 FREEZE FRAME (delay sedikit)
  setTimeout(() => {

  setIsSpinning(false);
  setSlowPhase(false);

  const sliceCount = 6;
  const finalAngle = angle % (Math.PI * 2);
  const resultIndex = getResultFromAngle(finalAngle);

  const rewardMap = [
    "GEN",
    "NO LUCKY",
    "PILL",
    "BONUS 10X DRAW",
    "JACKPOT",
    "TRY AGAIN",
  ];

  const rewardText = rewardMap[resultIndex] ?? "UNKNOWN";

  setWinner("You");
  setReward(rewardText);

  // 🎯 pointer bounce trigger
setPointerHit(true);
setTimeout(() => setPointerHit(false), 200);

  // 🔊 SOUND (WAJIB DI SINI)
  if (rewardText === "JACKPOT") {
    jackpotSound.current?.play();

    document.body.classList.add("shake");
    setTimeout(() => {
      document.body.classList.remove("shake");
    }, 1200);

  } else if (
    rewardText !== "NO LUCKY" &&
    rewardText !== "TRY AGAIN"
  ) {
    winSound.current?.play();
  }

  setHasClaimed(false);

}, 120);

  return;
}
  };

  animate();
};

const getResultFromAngle = (angle: number) => {
  const sliceCount = 6;
  const sliceAngle = (Math.PI * 2) / sliceCount;

  const adjusted =
    (Math.PI * 2 - angle + (3 * Math.PI) / 2) %
    (Math.PI * 2);

  const index =
    Math.floor((adjusted + sliceAngle / 2) / sliceAngle) %
    sliceCount;

  return index;
};

  return (
    <div
      className={`relative w-full h-full min-h-[600px] flex flex-col gap-10 p-8 bg-black/40 rounded-3xl border-4 border-purple-500 transition-all duration-300
      ${isSpinning ? "" : "shadow-[0_0_25px_rgba(168,85,247,0.6)]"}
      ${winner ? "result-glow" : ""}
`    }
    >
      
      {/* HEADER */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎰</span>
          <h2 className="text-purple-400 font-black text-xl tracking-wider uppercase">
            RAFFLE LOTTERY
          </h2>
        </div>

        {/* 🧠 PENJELAS GAME */}
        <p className="text-xs text-zinc-400 text-center">
          Match the wheel with the target to win 🎯
        </p>
      </div>

      {/* WHEEL */}
<div className="flex-1 flex flex-col items-center justify-center min-h-[450px]">

  <div className="relative w-[350px] h-[350px] flex items-center justify-center">

    {/* 🔥 BULB RING (LAMPU KELILING) */}
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 24 }).map((_, i) => {
  const angle = (i / 24) * Math.PI * 2;
  const r = 175;

  const x = Math.cos(angle) * r;
  const y = Math.sin(angle) * r;

  // ✅ STYLE DENGAN TYPE (INI YANG FIX MERAH)
  const style: CSSProperties = {
    position: "absolute",
    left: `calc(50% + ${x}px - 6px)`,
    top: `calc(50% + ${y}px - 6px)`,
    background: `hsl(${(i * 360) / 24}, 100%, 60%)`,
    animationDelay: `${i * 0.08}s`,
  };

  return (
    <div
      key={i}
      className={`bulb ${isSpinning ? "bulb-on" : "bulb-off"}`}
      style={style}
    />
  );
})}
    </div>

    {/* 🎯 CANVAS LO (JANGAN DIUBAH LOGICNYA) */}
    <canvas
      ref={canvasRef}
      width={350}
      height={350}
      className={`rounded-full border-[12px] border-purple-900/60 ${
        pointerHit ? "pointer-bounce" : ""
      }`}
    />

  </div>

  <div className="text-center mt-2">
  <span className="text-xs text-zinc-400">TARGET</span>
  <div className="text-lg font-black text-yellow-300">
    {targetLabel ?? "-"}
  </div>
</div>

</div>

        <div className="h-24 w-full flex items-center justify-center mt-4 px-2">
          {winner ? (
            <div className="w-full p-3 bg-zinc-900/80 border border-green-500/50 rounded-xl text-center">
              <span className="text-green-400 font-bold">
                🏆 Winner: {winner}
              </span>
              <br />

              <span
                className={`font-bold ${
                  reward === "JACKPOT"
                    ? "text-yellow-300 animate-pulse text-xl"
                    : "text-yellow-400"
                }`}
              >
                🎁 Reward: {reward}
              </span>

              <br />

              {/* 🎯 HIT / MISS */}
              {reward && targetLabel && (
                <span
                  className={`font-bold ${
                    reward === targetLabel
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {reward === targetLabel ? "🎯 HIT!" : "❌ MISS"}
                </span>
              )}
            </div>
          ) : (
            <p className="text-zinc-700 italic text-xs uppercase opacity-40">
              Waiting for draw results...
            </p>
          )}
        </div>

      {/* 🔥 BUTTON (LOGIC LAMA LO) */}
      <div className="mt-auto w-full h-32 flex flex-col justify-start pt-9">
        <button
          onClick={spin}
          disabled={!wallet || isSpinning || myTickets <= 0 || !hasClaimed}
          className={`w-full py-4 rounded-xl font-black text-white uppercase tracking-widest transition-all ${
            !wallet || isSpinning || myTickets <= 0 || !hasClaimed
              ? "bg-zinc-800 text-zinc-500"
              : "bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-[1.02]"
          }`}
        >
          {isSpinning ? "🎰 SPINNING..." : "🎟 DRAW WINNER"}
        </button>

        {/* ⚠️ REASON TEXT */}
        {(!wallet || myTickets <= 0 || !hasClaimed) && !isSpinning && (
          <p className="text-xs text-zinc-500 text-center mt-2">
            {!wallet && "🔌 Connect wallet"}
            {wallet && myTickets <= 0 && "🎟 No tickets"}
            {wallet && myTickets > 0 && !hasClaimed && "⚠️ Claim first"}
          </p>
        )}
      </div>

      {reward === "JACKPOT" && (
  <div className="confetti-container">
    {Array.from({ length: 40 }).map((_, i) => (
      <span
        key={i}
        className="confetti"
        style={{ left: `${Math.random() * 100}%` }}
      />
    ))}
  </div>
)}

    </div>
  );
}