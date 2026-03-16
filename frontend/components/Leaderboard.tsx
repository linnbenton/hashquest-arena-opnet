"use client";

import { useEffect, useState } from "react";

export default function Leaderboard() {

const [players,setPlayers] = useState<any[]>([])

async function loadLeaderboard(){

try{

const res = await fetch("/api/leaderboard")

const data = await res.json()

setPlayers(data.players || [])

}catch(err){

console.log(err)

}

}

useEffect(()=>{

loadLeaderboard()

const interval = setInterval(()=>{

loadLeaderboard()

},3000)

return ()=>clearInterval(interval)

},[])


return(

<div className="mt-10 w-[320px] mx-auto flex flex-col items-center text-center bg-black/40 p-4 rounded border border-cyan-500">

<h2 className="text-cyan-400 text-lg mb-2">

Top Miners

</h2>

{players.length === 0 && (

<div className="text-gray-400 text-sm">
No miners yet
</div>

)}

{players.map((p,i)=>(

<div
key={i}
className="flex justify-between w-full text-sm border-b border-gray-700 py-1"
>

<span className="text-yellow-400">

#{i+1}

</span>

<span className="text-green-400">

{p.player.slice(0,8)}...

</span>

<span className="text-cyan-400">

{p.reward}

</span>

</div>

))}

</div>

)

}