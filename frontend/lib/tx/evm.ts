import { claimEVMReward } from "@/evm/claim";

export async function sendEvmTx() {
  try {
    const evmTx = await claimEVMReward();

    console.log("🦊 EVM RAW:", evmTx);

    const txid =
      evmTx?.hash ||
      evmTx?.transactionHash ||
      (typeof evmTx === "string" ? evmTx : null);

    return txid || null;
  } catch (e) {
    console.error("❌ EVM TX FAIL:", e);
    return null;
  }
}