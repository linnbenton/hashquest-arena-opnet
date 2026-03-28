"use client";

import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function MiningParticles() {

  const particlesInit = async (engine: any) => {
    await loadSlim(engine);
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      <Particles
        init={particlesInit}
        options={{
          particles: {
            number: { value: 30 },
            size: { value: 2 },
            move: { enable: true, speed: 1 },
            opacity: { value: 0.3 }
          }
        }}
      />
    </div>
  );
}