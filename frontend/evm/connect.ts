import { ethers } from "ethers";

const GENLAYER_CONFIG = {
  chainId: "0x107D", // 4221 hex
  chainName: "GenLayer zkSync Testnet",
  rpcUrls: ["https://zksync-os-testnet-genlayer.zksync.dev"],
  nativeCurrency: {
    name: "GEN",
    symbol: "GEN",
    decimals: 18
  },
  blockExplorerUrls: [
    "https://zksync-os-testnet-genlayer.explorer.zksync.dev"
  ]
};

export async function connectMetaMaskGenLayer() {
  if (!(window as any).ethereum) {
    throw new Error("MetaMask not found");
  }

  const ethereum = (window as any).ethereum;

  // 🔥 ADD NETWORK (jika belum ada)
  try {
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [GENLAYER_CONFIG]
    });
  } catch (err) {
    console.log("Network sudah ada / skip add");
  }

  // 🔥 SWITCH NETWORK
  await ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: GENLAYER_CONFIG.chainId }]
  });

  // 🔥 CONNECT ACCOUNT
  await ethereum.request({
    method: "eth_requestAccounts"
  });

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  console.log("🦊 CONNECTED:", address);

  return { provider, signer, address };
}