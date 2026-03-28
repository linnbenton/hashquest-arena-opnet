export async function GET() {

  try {
    // 🔥 TODO: ganti dengan OP_NET RPC
    const blockHash = "0x" + Math.random().toString(16).slice(2)

    return Response.json({ blockHash })

  } catch {
    return Response.json({ blockHash: "fallback_hash" })
  }
}