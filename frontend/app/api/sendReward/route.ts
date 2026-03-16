import { NextResponse } from "next/server"

export async function POST(req:Request){

try{

const {player,amount} = await req.json()

if(!player){
return NextResponse.json({success:false})
}

if(amount > 1000){
return NextResponse.json({success:false})
}

console.log("Reward request")
console.log(player,amount)

return NextResponse.json({

success:true,
message:"reward processed"

})

}catch(err){

console.error(err)

return NextResponse.json({

success:false,
error:"server error"

})

}

}