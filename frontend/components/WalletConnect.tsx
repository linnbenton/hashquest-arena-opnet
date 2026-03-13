"use client"

import { useState } from "react"

export default function WalletConnect(){

 const [address,setAddress] = useState("")

 async function connectWallet(){

   if((window as any).opnet){

     const wallet = await (window as any).opnet.connect()

     setAddress(wallet.address)

   } else {

     alert("OP_NET wallet not found")

   }

 }

 return (

  <div className="flex flex-col items-center gap-2">

   <button
    onClick={connectWallet}
    className="px-6 py-3 bg-green-600 text-white rounded-lg"
   >
    Connect Wallet
   </button>

   <p>{address}</p>

  </div>

 )

}