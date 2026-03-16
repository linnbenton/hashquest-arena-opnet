import { NextResponse } from "next/server"

export async function POST(req: Request){

  try{

    const { player, amount } = await req.json()

    const privateKey = process.env.TREASURY_PRIVATE_KEY

    if(!privateKey){

      return NextResponse.json({
        success:false,
        error:"TREASURY_PRIVATE_KEY not set"
      })
    }

    console.log("Reward request")
    console.log("Player:",player)
    console.log("Amount:",amount)

    /* sementara return sukses untuk test */

    return NextResponse.json({
      success:true,
      message:"Reward API working"
    })

  }catch(err:any){

    console.error(err)

    return NextResponse.json({
      success:false,
      error:err.message
    })

  }

}