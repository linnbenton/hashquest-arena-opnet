"use client";

import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function MiningParticles() {

  const particlesInit = async (engine:any) => {
    await loadSlim(engine);
  };

  return (
    <Particles
      id="particles"
      init={particlesInit}
      options={{
        background:{color:"transparent"},
        particles:{
          number:{value:40},
          color:{value:"#00ffff"},
          size:{value:2},
          opacity:{value:0.4},
          move:{
            enable:true,
            speed:1
          }
        }
      }}
      style={{
        position:"absolute",
        top:0,
        left:0,
        width:"100%",
        height:"100%",
        zIndex:0
      }}
    />
  );

}