"use client"

import { useState, useEffect } from "react"

export default function Miner(){

 const [mining,setMining] = useState(false)
 const [reward,setReward] = useState(0)

 useEffect(()=>{

   let interval:any

   if(mining){
     interval = setInterval(()=>{
       setReward(r => r + 1)
     },1000)
   }

   return () => clearInterval(interval)

 },[mining])

 function startMining(){
   setMining(true)
 }

 return (

  <div className="flex flex-col items-center gap-4">

   <h1 className="text-4xl font-bold">
    HashQuest Arena
   </h1>

   <p className="text-xl">
    Reward: {reward}
   </p>

   <button
    onClick={startMining}
    className="px-6 py-3 bg-blue-600 text-white rounded-lg"
   >
    Start Mining
   </button>

  </div>

 )

}