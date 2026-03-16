"use client";

import { useEffect, useState } from "react";

export default function HashAnimation({ active }: { active:boolean }) {

  const [hash,setHash] = useState("000000")

  useEffect(()=>{

    if(!active) return

    const interval = setInterval(()=>{

      const randomHash = Math.random()
        .toString(16)
        .substring(2,14)

      setHash(randomHash)

    },200)

    return ()=>clearInterval(interval)

  },[active])

  if(!active) return null

  return(

    <div className="flex flex-col items-center mt-4">

      <div className="text-cyan-400 text-sm">
        Mining Hash
      </div>

      <div className="font-mono text-green-400 text-lg animate-pulse drop-shadow-[0_0_10px_#00ffcc]">
        {hash}
      </div>

    </div>

  )

}