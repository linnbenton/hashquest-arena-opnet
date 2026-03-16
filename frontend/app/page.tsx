"use client"

import Miner from "../components/Miner"

export default function Home(){

return(

<main className="flex flex-col items-center gap-10 p-10 text-white bg-black/60 min-h-screen">

<h1 className="text-4xl font-bold text-cyan-400 drop-shadow-[0_0_10px_cyan]">
HashQuest Arena
</h1>

<Miner/>

</main>

)

}