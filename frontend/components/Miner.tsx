'use client';

import { useState, useEffect, useRef } from 'react';
import { resolveTx } from '@/lib/tx/resolveTx';
import { claimEVMReward } from '../evm/claim';
import HashAnimation from './HashAnimation';
import MiningParticles from './MiningParticles';
import HashrateMeter from './HashrateMeter';

const OPNET_CONTRACT =
  process.env.NEXT_PUBLIC_OPNET_CONTRACT ||
  'opt1sqzxnyyygv27euyf5wvjhfd32frhn3f2mku2l0q83';

const REWARD_PER_SECOND = 0.1;

/* 🎉 CONFETTI */
const Confetti = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
    {[...Array(25)].map((_, i) => {
      const colors = ['#f97316', '#22c55e', '#3b82f6', '#eab308'];
      return (
        <div
          key={i}
          className="absolute w-2 h-2 animate-fall"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: Math.random() * 100 + '%',
            top: '-10px',
            animationDuration: 2 + Math.random() * 2 + 's',
          }}
        />
      );
    })}
  </div>
);

export default function Miner({
  wallet,
  setWalletParent,
  onTickets,
  onClaim,
}: any) {
  const [walletType, setWalletType] = useState<'opnet' | 'metamask' | ''>('');
  const [walletError, setWalletError] = useState('');

  const [hasClaimed, setHasClaimed] = useState(false);
  const [gpuPower, setGpuPower] = useState(0);

  const [mining, setMining] = useState(false);
  const [reward, setReward] = useState(0);

  const [claimedTickets, setClaimedTickets] = useState(0);

  const [loading, setLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [lastHash, setLastHash] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [cooldown, setCooldown] = useState(false);

  const [showTxPopup, setShowTxPopup] = useState(false);

  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  const spinWheel = () => {
    if (isSpinning) return;

    // 🔥 FIX: WAJIB WALLET
    if (!wallet || !walletType) {
      setWalletError('Connect wallet first');
      return;
    }

    setWalletError('');
    setIsSpinning(true);

    const extraDegree = Math.floor(Math.random() * 360);
    const totalRotation = wheelRotation + 1800 + extraDegree;
    setWheelRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
    }, 5000);
  };

  async function connectMetaMask() {
    console.log('🦊 CLICK DETECTED');

    try {
      const ethereum = (window as any).ethereum;

      if (!ethereum) {
        alert('MetaMask not found');
        return;
      }

      // 🔒 prevent double request (penting banget)
      if ((ethereum as any)._connecting) {
        console.log('⏳ Already connecting...');
        return;
      }
      (ethereum as any)._connecting = true;

      // 🔐 request account
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      (ethereum as any)._connecting = false;

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      const address = accounts[0];

      console.log('✅ CONNECTED:', address);

      // optional: cek network (debug)
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log('🌐 CHAIN:', chainId);

      setWalletType('metamask');
      setWalletParent?.(address);
      setWalletError('');
    } catch (err: any) {
      console.error('❌ MetaMask error:', err);

      // reset flag biar gak ke-lock
      if ((window as any).ethereum) {
        (window as any).ethereum._connecting = false;
      }

      if (err?.code === 4001) {
        setWalletError('User rejected connection');
      } else {
        setWalletError('MetaMask connection failed');
      }
    }
  }
  async function connectWallet() {
    try {
      const opnet = (window as any).opnet;

      if (!opnet) {
        const demo = 'PLAYER_' + Math.floor(Math.random() * 10000);

        setWalletParent?.(demo);
        setWalletError('Demo mode');

        return;
      }

      await opnet.initialize?.();

      const accounts =
        (await opnet.requestAccounts?.()) || (await opnet.getAccounts?.());

      const addr = accounts?.[0];
      if (!addr) return setWalletError('Wallet not connected');

      // setWallet(addr); <--- HAPUS ATAU KOMENTARI BARIS INI
      setWalletParent?.(addr); // <--- INI YANG PENTING
      setWalletError('');
    } catch {
      setWalletError('Wallet error');
    }
  }

  useEffect(() => {
    if (!mining) return;
    const interval = setInterval(() => {
      setReward((prev) => prev + REWARD_PER_SECOND);
    }, 1000);
    return () => clearInterval(interval);
  }, [mining]);

  useEffect(() => {
    if (wallet) {
      setWalletError('');
    }
  }, [wallet]);

  useEffect(() => {
    onTickets?.(claimedTickets + Math.floor(reward));
  }, [reward, claimedTickets]);

  const startMining = () => {
    if (!wallet) {
      setWalletError('Connect wallet first');
      return;
    }

    setWalletError('');
    setMining(true);
  };

  function stopMining() {
    setMining(false);
  }

  if (typeof window !== 'undefined') {
    console.log('🔥 CLICK CLAIM TRIGGERED');
  }

  async function claimReward() {
    setIsClaiming(true);
    setTxStatus('loading');
    setTxStatus('⏳ Sending...');
    console.log('🧠 CONTRACT:', OPNET_CONTRACT);

    try {
      if (!wallet || !walletType) {
        return setWalletError('Connect wallet first');
      }

      if (loading || cooldown) return;

      setLoading(true);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);

      // 🔹 API CLAIM (FIX 429)
      let serverReward = 0;

      try {
        const res = await fetch(
          '/api/claim', // <--- GANTI INI (Hapus variabel env-nya)
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ wallet }),
          }
        );

        const data = await res.json(); // ✅ cukup sekali

        console.log('CLAIM RESPONSE:', data);

        if (data?.tx) {
          setTxHash(data.tx);
        }

        let serverReward = 0;

        if (res.ok) {
          serverReward = data.reward || 0;
        } else {
          console.log('⚠️ Claim rate limited');
        }
      } catch {
        console.log('⚠️ Claim API error');
      }

      // 🔹 OPNet TX
      const opnet = (window as any).opnet;
      const provider = opnet?.web3?.provider;

      // 🚨 HANDLE BERDASARKAN WALLET
      if (walletType !== 'opnet') {
        console.log('🦊 Non-OPNet wallet, skip OPNet TX');
      } else {
        if (!provider?.signAndBroadcastInteraction) {
          setWalletError('OPNET not installed / not ready');
          setLoading(false);
          return;
        }
      }

      let result: any = null;

      // =========================
      // 🔥 HYBRID TX RESOLUTION
      // =========================

      const txid = await resolveTx({
        walletType,
        provider,
        contract: OPNET_CONTRACT,
      });

      console.log('🚀 SEND TO GENLAYER:', {
        wallet,
        reward: Math.floor(reward),
        txid,
      });

      if (!txid) {
        console.error('❌ TXID NULL TOTAL FAIL');

        setTxHash(txid); // ✅ TANPA || "FAILED_TX"
        setShowTxPopup(true);
        setReward(0);
        setWalletError('Transaction failed ❌');

        setLoading(false);
        return;
      }

      setTxHash(txid); // ✅ selalu valid sekarang
      setShowTxPopup(true); // ✅ popup muncul di akhir (bukan di tengah)

      // 🧠 AI
      let rewardFinal = Math.floor(reward);

      try {
        const aiRes = await fetch('/api/genlayer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet,
            reward: Math.floor(reward),
            txid, // ✅ sekarang selalu valid
            timestamp: Date.now(),
          }),
        });

        const data = await aiRes.json();

        console.log('🧠 GENLAYER RESPONSE:', data);

        if (data.status === 'blocked') {
          setWalletError('⛔ Too fast!');
          setLoading(false); // ✅ Pastikan tombol bisa diklik lagi
          return;
        }

        rewardFinal = data?.rewardFinal ?? reward;
        console.log('✅ CLAIM SUCCESS → CALL onClaim');

        onClaim?.(rewardFinal); // atau amount yang lo pakai
      } catch {
        console.log('⚠️ AI fail');
      }

      const gained = Math.max(0, Math.floor(rewardFinal));
      setClaimedTickets((prev) => prev + gained);

      // ✅ Eksekusi provider kalau OPNet wallet & gained > 0
      if (gained > 0 && walletType === 'opnet' && provider) {
        await provider.signAndBroadcastInteraction({
          type: 'call',
          to: OPNET_CONTRACT,
          data: new Uint8Array(),
        });
      }

      // ✅ Tampilkan popup sesuai desainmu
      setTxHash(txid || 'FAILED_TX');
      setShowTxPopup(true);
      setReward(0);
    } catch (err: unknown) {
      let message = 'Unknown error';
      if (err instanceof Error) {
        message = err.message;
      }
      setWalletError(message);
    } finally {
      setLoading(false);
    }
  }

  // 👇 MULAI DARI SINI SAMPAI BAWAH SAYA JAMIN 100% SAMA PERSIS DENGAN DESAIN ASLIMU 👇
  // ... (Gunakan logika state dan function yang sudah kamu punya di atas)

  return (
    <>
      {/* --- POPUP TRANSAKSI (Ditaruh di luar container utama agar overlay full screen) --- */}
      {showTxPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1220]/90 backdrop-blur-sm">
          <Confetti />
          <div className="bg-gradient-to-b from-[#0a1a3a] to-[#020617] border border-orange-400 rounded-2xl p-6 w-[360px] text-center relative shadow-[0_0_25px_rgba(0,200,255,0.6)] animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowTxPopup(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <div className="flex justify-center mb-2">
              <img
                src="/opnet-logo.png"
                className="h-6 w-auto drop-shadow-[0_0_6px_rgba(255,122,0,0.6)]"
              />
            </div>
            <h2 className="text-white text-lg font-semibold mb-2">
              Transaction Successful!
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Your transaction has been successfully broadcast to the network
            </p>
            <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="25" fill="#0ea5e9" />
              <path
                d="M14 27l7 7 16-16"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-gray-400 text-xs">Transaction ID:</p>
            <p className="text-white text-xs mb-4 break-all font-mono">
              {txHash}
            </p>
            <div className="flex flex-col items-center gap-2 mb-4">
              {/* ROW ATAS */}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() =>
                    window.open(
                      `https://mempool.opnet.org/testnet4/tx/${txHash}`,
                      '_blank'
                    )
                  }
                  className="px-3 py-2 rounded text-xs text-white bg-orange-500 hover:bg-orange-600 transition"
                >
                  View Mempool
                </button>

                <button
                  onClick={() =>
                    window.open(
                      `https://opscan.org/tx/${txHash}?network=op_testnet`,
                      '_blank'
                    )
                  }
                  className="px-3 py-2 rounded text-xs text-white bg-orange-500 hover:bg-orange-600 transition"
                >
                  View OP_SCAN
                </button>
              </div>

              {/* 🔥 GENLAYER BUTTON (DI BAWAH, CENTER) */}
              {txHash && (
                <button
                  onClick={() =>
                    window.open(
                      `https://zksync-os-testnet-genlayer.explorer.zksync.dev/tx/${txHash}`,
                      '_blank'
                    )
                  }
                  className="px-3 py-2 rounded text-xs text-white bg-purple-600 hover:bg-purple-700 transition"
                >
                  🔍 View on GenLayer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* --- CONTAINER UTAMA MINING CONSOLE (CYAN) --- */}
      <div className="relative w-full h-full min-h-[600px] flex flex-col gap-8 p-8 bg-black/40 rounded-3xl border-4 border-cyan-500 shadow-[0_0_25px_rgba(34,211,238,0.6)]">
        {/* Background Particles */}
        <MiningParticles />

        {/* Header Section */}
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛏️</span>
            <h2 className="text-cyan-400 font-black text-xl tracking-wider uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
              Mining Ticket
            </h2>
          </div>
          {wallet && (
            <div className="flex justify-center items-center py-1 px-6 bg-white/5 rounded-2xl border border-white/10 shadow-inner w-full">
              <div className="flex flex-col items-center gap-[3px] w-full">
                <span className="text-[9px] text-cyan-500/50 font-mono uppercase tracking-tight">
                  Active Session
                </span>

                <span className="text-green-400 text-[13px] font-mono">
                  {typeof wallet === 'string'
                    ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
                    : '-'}
                </span>

                <button
                  onClick={() => {
                    setWalletParent?.('');
                    setWalletType('');
                    setMining(false);
                  }}
                  className="text-[9px] text-red-400 hover:text-red-300 font-bold"
                >
                  DISCONNECT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wallet Selector (Hanya muncul jika wallet kosong) */}
        {!wallet && (
          <div className="flex justify-center items-center gap-4 py-3 px-6 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => {
                setWalletType('opnet');
                connectWallet();
              }}
              className="hover:scale-110 transition-transform"
            >
              <img src="/opnet.png" className="h-7 w-auto" alt="OPWallet" />
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
            <button
              onClick={connectMetaMask}
              className="hover:scale-110 transition-transform duration-200 transition-transform"
            >
              <img src="/metamask.png" className="h-9 w-auto" alt="MetaMask" />
            </button>
          </div>
        )}

        {/* 🔒 LOCKED INFO + ANIMATION PANEL */}
        <div className="h-[240px] flex flex-col justify-between items-center w-full text-center">
          {/* 💰 REWARD */}
          <div className="h-[45px] flex items-center justify-center">
            <div className="relative text-3xl font-black tabular-nums tracking-tighter">
              <span className="invisible">0000.0000</span>
              <span className="absolute inset-0 text-yellow-400 drop-shadow-[0_2px_10px_rgba(250,204,21,0.4)]">
                {reward.toFixed(4)}
              </span>
            </div>
          </div>

          {/* 🎟️ TICKETS */}
          <div className="h-[35px] flex items-center justify-center">
            <div className="flex items-center gap-2 text-cyan-200 font-bold text-xs uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              <span>🎟 Tickets:</span>

              <div className="relative text-white tabular-nums">
                <span className="invisible">0000</span>
                <span className="absolute inset-0">
                  {claimedTickets + Math.floor(reward)}
                </span>
              </div>
            </div>
          </div>

          {/* 🔢 HASH */}
          <div className="h-[70px] flex items-center justify-center w-full">
            <HashAnimation active={mining} />
          </div>

          {/* ⚡ GPU */}
          <div className="h-[80px] flex items-center justify-center w-full">
            <HashrateMeter mining={mining} />
          </div>
        </div>

        {/* 🔘 ACTION BUTTONS (TETAP) */}
        <div className="flex gap-4 w-full">
          <button
            onClick={startMining}
            className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-xl font-black text-white uppercase tracking-wider transition-all shadow-[0_4px_0_#15803d] active:translate-y-1 active:shadow-none"
          >
            Start
          </button>

          <button
            onClick={stopMining}
            className="flex-1 bg-red-600 hover:bg-red-500 py-3 rounded-xl font-black text-white uppercase tracking-wider transition-all shadow-[0_4px_0_#b91c1c] active:translate-y-1 active:shadow-none"
          >
            Stop
          </button>
        </div>

        {/* --- CONTAINER TOMBOL (Gunakan mt-auto) --- */}
        {/* CONTAINER UTAMA TOMBOL (Mengunci Posisi di Dasar Kotak) */}
        <div className="w-full mt-auto pt-10 flex flex-col gap-3">
          <button
            onClick={claimReward}
            disabled={loading || cooldown || reward < 1}
            className={`
      w-full py-4 rounded-xl font-black text-white uppercase tracking-widest
      transition-all duration-300 shadow-lg
      ${
        loading || cooldown || reward < 1
          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-b-4 border-zinc-900'
          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-95 border-b-4 border-purple-900'
      }
    `}
          >
            {loading ? '📡 BROADCASTING...' : '🎟️ CLAIM TICKET'}
          </button>

          {/* Jaga ruang error agar tinggi kotak tidak berubah (Space Booking) */}
          <div className="h-5 flex justify-center items-center">
            {walletError && (
              <p className="text-[10px] text-red-500 font-bold animate-pulse uppercase">
                {walletError}
              </p>
            )}
          </div>
        </div>
      </div>{' '}
      {/* Penutup Kotak Utama */}
    </>
  );
}
