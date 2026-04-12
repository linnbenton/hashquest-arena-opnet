"use client";

export default function WalletSelector({ onSelect }: any) {
  return (
    <div className="flex flex-col gap-3">

      <button
        onClick={() => onSelect("opnet")}
        className="bg-orange-500 px-4 py-2 rounded text-white font-bold"
      >
        🟠 Connect OP_NET
      </button>

      <button
        onClick={() => onSelect("metamask")}
        className="bg-purple-500 px-4 py-2 rounded text-white font-bold"
      >
        🦊 Connect MetaMask (GenLayer)
      </button>

    </div>
  );
}