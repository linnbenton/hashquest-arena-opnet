"use client";

import { useEffect, useRef, useState } from "react";

export default function HashrateMeter({ mining }: { mining: boolean }) {

  const [target, setTarget] = useState(0);
  const [display, setDisplay] = useState(0);
  const [spike, setSpike] = useState(false);

  const rafRef = useRef<number | null>(null);

  // 🔥 TARGET GENERATOR (STABLE)
  useEffect(() => {

    if (!mining) {
      setTarget(0);
      return;
    }

    const interval = setInterval(() => {
      setTarget(prev => {
        const next = prev + (Math.random() * 6 - 3);
        return Math.max(40, Math.min(100, next));
      });
    }, 1200);

    return () => clearInterval(interval);

  }, [mining]);

  // 🔥 SMOOTH ENGINE (LERP — DEAD STABLE)
  useEffect(() => {

    const smooth = () => {
      setDisplay(prev => {
        const diff = target - prev;
        const step = diff * 0.08;
        return Math.abs(diff) < 0.1 ? target : prev + step;
      });

      rafRef.current = requestAnimationFrame(smooth);
    };

    rafRef.current = requestAnimationFrame(smooth);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

  }, [target]);

  // 🔥 POWER SPIKE EFFECT
  useEffect(() => {
    if (display > 85) {
      setSpike(true);
      const t = setTimeout(() => setSpike(false), 120);
      return () => clearTimeout(t);
    }
  }, [display]);

  // 🔥 EMIT POWER KE GLOBAL (UNTUK HASH)
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("gpu-power", { detail: display })
    );
  }, [display]);

  const value = Math.round(display);

  return (

    <div className="w-[280px] min-h-[70px] mt-2 mx-auto flex flex-col items-center text-center">

      <div className="text-cyan-400 text-sm mb-1">
        GPU Hashrate
      </div>

      <div className="w-full bg-gray-800 h-4 rounded overflow-hidden">

        <div
          className="
            gpu-layer
            h-full
            bg-[linear-gradient(90deg,#00ff88,#ffee00,#ff3300)]
            bg-[length:200%_100%]
            animate-[heatMove_3s_linear_infinite]
            shadow-[0_0_10px_#00ff88]
  "
          style={{
            transform: `scaleX(${display / 100})`,
            transformOrigin: "left",
            willChange: "transform",
            boxShadow: `0 0 ${8 + display * 0.25}px rgba(0,255,150,0.6)`
          }}
        />

      </div>

      <div className="relative mt-1 text-xs text-gray-300 w-[70px] text-center tabular-nums">

        <span className="invisible">
          000 MH/s
        </span>

        <span
          className="absolute inset-0 text-stable"
          style={{
            willChange: "contents",
            transform: "translateZ(0)"
          }}
        >
          {value} MH/s
        </span>

      </div>

    </div>
  );
}