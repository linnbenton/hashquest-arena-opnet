import { sendOpnetTx } from "@/lib/opnet";
import { sendEvmTx } from "@/lib/tx/evm";

export async function resolveTx({
  walletType,
  provider,
  contract,
}: {
  walletType: "opnet" | "metamask";
  provider: any;
  contract: string;
}) {
  let txid: string | null = null;

  // 🔵 PRIORITY: OPNet
  if (walletType === "opnet") {
    txid = await sendOpnetTx(provider, contract);
  }

  // 🦊 FALLBACK: EVM
  if (!txid) {
    txid = await sendEvmTx();
  }

  console.log("🔥 FINAL TXID:", txid);

  return txid;
}