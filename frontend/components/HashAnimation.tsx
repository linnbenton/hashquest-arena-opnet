"use client";

import { useEffect, useState } from "react";

export default function HashAnimation({ active }: { active: boolean }) {

  const [hash, setHash] = useState("000000000000");
  const [displayHash, setDisplayHash] = useState("000000000000");
  const [power, setPower] = useState(0);

  // 🔥 GENERATE HASH
  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      const randomHash = Math.floor(Math.random() * 1e12)
        .toString(16)
        .padStart(12, "0");

      setHash(randomHash);
    }, 400);

    return () => clearInterval(interval);
  }, [active]);

  // 🔥 BUFFER HASH
  useEffect(() => {
    const t = setTimeout(() => {
      setDisplayHash(hash);
    }, 50);

    return () => clearTimeout(t);
  }, [hash]);

  // 🔥 LISTEN POWER DARI HASHRATE
  useEffect(() => {
    const handler = (e: any) => {
      setPower(e.detail);
    };

    window.addEventListener("gpu-power", handler);
    return () => window.removeEventListener("gpu-power", handler);
  }, []);

  return (
    <div className="flex flex-col items-center mt-4">

      <div className="text-cyan-400 text-sm">
        Mining Hash
      </div>

      <div
        className="
          gpu-layer
          text-stable
          font-mono
          text-green-400
          text-lg
          w-[150px]
          flex
          justify-center
          gap-[1px]
        "
        style={{
          textShadow: `0 0 ${8 + power * 0.25}px #00ffcc`
        }}
      >
        {displayHash.split("").map((c, i) => (
          <span key={i} className="inline-block w-[10px] text-center">
            {c}
          </span>
        ))}
      </div>

    </div>
  );
}