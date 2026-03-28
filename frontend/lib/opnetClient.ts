// src/lib/opnetClient.ts

export async function sendOpnetTx(to: string, amount: number) {

  // ⚠️ nanti ganti dengan SDK asli
  console.log("Sending TX to:", to, "amount:", amount)

  return {
    success: true,
    txHash: "opnet_" + Math.random().toString(16).slice(2)
  }
}
