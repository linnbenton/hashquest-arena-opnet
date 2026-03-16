import { NextResponse } from "next/server"

let players = [

{player:"opt1abc123456",reward:200},
{player:"opt1def789123",reward:150},
{player:"opt1xyz555333",reward:90}

]

export async function GET(){

return NextResponse.json({

players

})

}