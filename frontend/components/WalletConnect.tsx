"use client";

import { useState } from "react";

export default function WalletConnect({onConnect}:any){

const [address,setAddress] = useState("")

async function connectWallet(){

try{

const opnet = (window as any).opnet

if(!opnet){

alert("Install OPNet Wallet")
return

}

const accounts = await opnet.request({
method:"connect"
})

const addr = accounts[0]

setAddress(addr)

if(onConnect){
onConnect(addr)
}

}catch(err){

console.error(err)

alert("wallet connect error")

}

}

return(

<div className="flex flex-col items-center gap-2">

{address ? (

<div className="text-green-400">
Wallet Connected
<br/>
{address}
</div>

) : (

<button
onClick={connectWallet}
className="bg-blue-600 px-6 py-2 rounded text-white"
>

Connect OPNet Wallet

</button>

)}

</div>

)

}