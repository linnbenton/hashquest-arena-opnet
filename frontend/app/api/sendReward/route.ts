import { NextResponse } from "next/server"
import * as bitcoin from "bitcoinjs-lib"
import * as ecc from "tiny-secp256k1"
import ECPairFactory from "ecpair"
import axios from "axios"

bitcoin.initEccLib(ecc)

const ECPair = ECPairFactory(ecc)
const network = bitcoin.networks.testnet

export async function POST(req: Request) {

  try {

    const body = await req.json()
    const to = body?.to
    const amount = Number(body?.amount)

    if (!to || !amount) {
      return NextResponse.json({ success: false, error: "Invalid input" })
    }

    const PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY!
    const TREASURY = process.env.TREASURY_ADDRESS!

    /* 🔥 FIX DI SINI */
    const keyPair = ECPair.fromPrivateKey(
      Buffer.from(PRIVATE_KEY, "hex"),
      { network }
    )

    // 🔥 ambil UTXO
    const utxoRes = await axios.get(
      `https://mempool.opnet.org/testnet4/address/${TREASURY}/utxo`
    )

    const utxos = utxoRes.data

    if (!utxos.length) {
      return NextResponse.json({ success: false, error: "No UTXO" })
    }

    const psbt = new bitcoin.Psbt({ network })

    let inputSum = 0

    const utxo = utxos[0]
    inputSum += utxo.value

    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: bitcoin.address.toOutputScript(TREASURY, network),
        value: utxo.value
      }
    })

    const fee = 500
    const sendAmount = Math.floor(amount * 1000)

    if (inputSum < sendAmount + fee) {
      return NextResponse.json({ success: false, error: "Insufficient balance" })
    }

    psbt.addOutput({
      address: to,
      value: BigInt(sendAmount)
    })

    psbt.addOutput({
      address: TREASURY,
      value: BigInt(inputSum - sendAmount - fee)
    })

    psbt.signAllInputs(keyPair)
    psbt.finalizeAllInputs()

    const txHex = psbt.extractTransaction().toHex()

    const push = await axios.post(
      "https://mempool.opnet.org/testnet4/api/tx",
      txHex,
      {
        headers: { "Content-Type": "text/plain" }
      }
    )

    const txid = push.data

    console.log("✅ TXID:", txid)

    return NextResponse.json({
      success: true,
      txid
    })

  } catch (e: any) {

    console.error("💥 TX ERROR:", e)

    return NextResponse.json({
      success: false,
      error: "TX failed"
    })
  }
}