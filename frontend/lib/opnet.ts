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