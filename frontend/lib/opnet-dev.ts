export function getDevClient() {
  const privateKey = process.env.DEV_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("Missing DEV_PRIVATE_KEY");
  }

  return {
    async signInteraction({ contract, method, params }: any) {
      // 🔥 CALL OP_NET VIA FETCH (SERVER SIDE)

      const res = await fetch("https://testnet.opnet.org/tx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          privateKey,
          contract,
          method,
          params
        })
      });

      const data = await res.json();

      if (!data || !data.txid) {
        throw new Error("TX failed");
      }

      return data;
    }
  };
}