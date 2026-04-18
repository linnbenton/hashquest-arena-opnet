// lib/opnet.ts
import { JSONRpcProvider } from "opnet";

const minimalNetwork = {
  name: "regtest",
  chainId: 1234,
  rpcUrl: "https://regtest.opnet.org",
  wif: 0,
  bip32: { public: 0, private: 0 },
  messagePrefix: "\x18Opnet Signed Message:\n",
  bech32: "opnet",
};

let provider: JSONRpcProvider;

export function getProvider() {
  if (!provider) {
    provider = new JSONRpcProvider({
      url: minimalNetwork.rpcUrl,
      network: minimalNetwork as any,
    });
  }
  return provider;
}

export async function sendOpnetTx(provider: any, contract: string) {
  if (!provider?.signAndBroadcastInteraction) return null;

  try {
    const result = await provider.signAndBroadcastInteraction({
      type: "call",
      to: contract,
      data: new TextEncoder().encode("claim"),
    });

    console.log("🔥 OPNet RAW:", result);

    const txid =
      result?.txid ||
      result?.hash ||
      result?.transactionHash ||
      result?.result?.hash ||
      result?.result?.txid ||
      (typeof result === "string" ? result : null);

    return txid || null;
  } catch (e) {
    console.error("❌ OPNet TX FAIL:", e);
    return null;
  }
}