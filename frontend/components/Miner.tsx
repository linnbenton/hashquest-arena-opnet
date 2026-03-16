"use client";

import { useState, useEffect } from "react";
import HashAnimation from "./HashAnimation";
import MiningParticles from "./MiningParticles";
import Leaderboard from "./Leaderboard"
import HashrateMeter from "./HashrateMeter"

export default function Miner() {

  const [wallet,setWallet] = useState("")
  const [fundBalance,setFundBalance] = useState(100000)
  const [mining,setMining] = useState(false)
  const [reward,setReward] = useState(0)

  const REWARD_PER_SECOND = 500 / 86400

  /* CONNECT WALLET */

  async function connectWallet(){

    try{

      const opnet = (window as any).opnet

      if(!opnet){
        alert("OPNet wallet not found")
        return
      }

      let accounts

      if(opnet.request){
        accounts = await opnet.request({ method:"connect" })
      }else if(opnet.requestAccounts){
        accounts = await opnet.requestAccounts()
      }

      const addr = accounts?.[0] || opnet.address

      if(!addr){
        alert("wallet address not found")
        return
      }

      setWallet(addr)

    }catch(err){
      console.error(err)
      alert("wallet connect error")
    }

  }


  /* MINING LOOP */

  useEffect(()=>{

    if(!mining) return

    const interval = setInterval(()=>{

      setReward(prev => prev + REWARD_PER_SECOND)

    },1000)

    return ()=>clearInterval(interval)

  },[mining])


  function startMining(){

    if(!wallet){
      alert("connect wallet first")
      return
    }

    setMining(true)

  }

  function stopMining(){
    setMining(false)
  }


  /* CLAIM REWARD */

  async function claimReward(){

    if(!wallet){
      alert("connect wallet first")
      return
    }

    if(reward < 1){
      alert("minimal claim 1 PILL")
      return
    }

    try{

      const res = await fetch("/api/sendReward",{

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          player:wallet,
          amount:Math.floor(reward)
        })

      })

      const data = await res.json()

      if(data.success){

        alert("Reward successfully!")

        setReward(0)

      }else{

        alert("Reward failed!")

      }

    }catch(err){

      console.error(err)
      alert("claim error")

    }

  }


  return(

  <div className="relative flex flex-col items-center gap-6 p-10 text-white">

  {/* PARTICLES BACKGROUND */}

  <MiningParticles/>

  {/* MAIN UI */}

  <div className="relative z-10 flex flex-col items-center gap-6">

  <h1 className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_10px_#00ffff]">
  HashQuest Miner
  </h1>


  {!wallet && (

  <button
  onClick={connectWallet}
  className="bg-blue-600 px-6 py-2 rounded hover:scale-105 transition"
  >
  Connect Wallet
  </button>

  )}


  {wallet && (

  <div className="text-green-400 text-center">

  Wallet Connected

  <br/>

  <span className="text-sm break-all">
  {wallet}
  </span>

  </div>

  )}

  <div className="text-cyan-400">

  Fund Balance (Treasury): {fundBalance.toFixed(2)} PILL

  </div>

  {/* REWARD DISPLAY */}

  <div className="flex items-center gap-2 text-yellow-400 text-lg">

<span>
Mining Reward: {reward.toFixed(4)}
</span>

<img
src="/pill.png"
width="20"
height="20"
className="mx-1"
/>

<span>PILL</span>

</div>


  {/* HASH ANIMATION */}

  <HashAnimation active={mining}/>

  <div className="flex flex-col items-center gap-6 mt-6">
  
  <HashrateMeter mining={mining}/>
  
  </div>
  
  {/* BUTTONS */}

  <div className="flex gap-4">

  <button
  onClick={startMining}
  className="bg-green-600 px-6 py-2 rounded shadow-[0_0_12px_#00ff88] hover:scale-105 transition"
  >
  Start Mining
  </button>

  <button
  onClick={stopMining}
  className="bg-red-600 px-6 py-2 rounded hover:scale-105 transition"
  >
  Stop Mining
  </button>

  </div>

  <button
  onClick={claimReward}
  className="bg-purple-600 px-8 py-3 rounded hover:scale-105 transition"
  >
  Claim Reward
  </button>

  </div>

  <Leaderboard/>
  
  </div>

  )

}