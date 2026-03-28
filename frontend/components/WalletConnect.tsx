"use client";

import { useState } from "react";

export default function WalletConnect({ onConnect }: any) {

  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  async function connectWallet() {
    try {

      const opnet = (window as any).opnet;

      if (!opnet) {
        setError("OP_NET wallet not found");
        return;
      }

      // 🔥 INIT WALLET
      if (opnet.initialize) {
        await opnet.initialize();
      }

      let accounts;

      if (opnet.requestAccounts) {
        accounts = await opnet.requestAccounts();
      } else if (opnet.getAccounts) {
        accounts = await opnet.getAccounts();
      }

      const addr = accounts?.[0] || opnet.address;

      if (!addr) {
        setError("Wallet address not found");
        return;
      }

      // ✅ SET LOCAL STATE
      setAddress(addr);
      setError("");

      // ✅ KIRIM KE PARENT (PENTING)
      onConnect?.(addr);

      console.log("Wallet connected:", addr);

    } catch (err) {
      console.error(err);
      setError("Wallet connect error");
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">

      {/* ERROR */}
      {error && (
        <div className="text-red-400 text-sm">
          {error}
        </div>
      )}

      {address ? (
        <div className="text-green-400 text-center">
          Wallet Connected
          <br />
          <span className="text-xs break-all">
            {address}
          </span>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-600 px-6 py-2 rounded text-white hover:scale-105 transition"
        >
          Connect OPNet Wallet
        </button>
      )}

    </div>
  );
}