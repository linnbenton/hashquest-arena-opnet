"use client";

import { useEffect, useState } from "react";

export default function HashrateMeter({ mining }: { mining:boolean }) {

  const [hashrate,setHashrate] = useState(0)

  useEffect(()=>{

    if(!mining){
      setHashrate(0)
      return
    }

    const interval = setInterval(()=>{

      const randomPower = Math.floor(
        40 + Math.random()*60
      )

      setHashrate(randomPower)

    },1200)

    return ()=>clearInterval(interval)

  },[mining])


  return(

  <div className="w-[280px] mt-2 mx-auto flex flex-col items-center text-center">

  <div className="text-cyan-400 text-sm mb-1">

  GPU Hashrate

  </div>

  <div className="w-full bg-gray-800 h-4 rounded">

  <div
  style={{width:`${hashrate}%`}}
  className="
  h-4
  bg-gradient-to-r
  from-green-400
  via-yellow-400
  to-red-500
  rounded
  transition-all
  duration-700
  shadow-[0_0_10px_#00ff88]
  "
  />

  </div>

  <div className="text-xs text-gray-300 mt-1">

  {hashrate} MH/s

  </div>

  </div>

  )

}