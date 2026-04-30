'use client';

import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  reward: string | null;
  onCollect: () => void;
};

export default function RewardPopup({ reward, onCollect }: Props) {
  return (
    <AnimatePresence mode="wait">
      {reward && (
        /* Overlay: Pastikan z-index sangat tinggi agar tidak tertutup elemen lain */
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <motion.div
            /* Kunci agar animasi selalu dari pusat kotak */
            style={{ originX: 0.5, originY: 0.5 }}
            /* Gunakan transisi yang sama untuk masuk dan keluar */
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1], // Cubic-bezier untuk transisi yang lebih 'snappy'
            }}
            /* w-fit dan mx-auto memastikan kotak tidak melebar ke samping secara paksa */
            className={`relative p-10 rounded-3xl border-2 text-center bg-zinc-950 shadow-2xl w-[90%] max-w-sm
            ${reward === 'JACKPOT' ? 'border-yellow-400' : 'border-cyan-500'}`}
          >
            <p className="text-[10px] font-mono tracking-[0.4em] text-zinc-500 mb-2 uppercase">
              Extraction Complete
            </p>

            <div
              className={`font-black text-6xl mb-8 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]
              ${reward === 'JACKPOT' ? 'text-yellow-300' : 'text-cyan-400'}`}
            >
              {reward === 'JACKPOT' ? 'JACKPOT' : `+${reward}`}
            </div>

            <button
              onClick={onCollect}
              className="w-full py-4 rounded-xl font-black text-xs tracking-[0.2em] bg-cyan-500 text-black hover:bg-cyan-400 transition-all active:scale-95 uppercase flex items-center justify-center gap-2"
            >
              🎫 COLLECT 🎟️
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
