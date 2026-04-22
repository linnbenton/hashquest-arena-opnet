'use client';

type Props = {
  reward: string | null;
  onCollect: () => void;
  disabled?: boolean;
};

export default function RewardPopup({
  reward,
  onCollect,
  disabled = false, // 🔥 DEFAULT
}: Props) {
  if (!reward) return null; // 🔥 NO RENDER = NO COST

  const isJackpot = reward === 'JACKPOT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`px-8 py-6 rounded-2xl border text-center
        ${isJackpot ? 'border-yellow-400' : 'border-purple-500'}
        bg-zinc-900 shadow-xl`}
      >
        <h2 className="text-lg font-black text-white mb-2">🎉 YOU WON</h2>

        <div
          className={`font-black text-2xl mb-4
          ${isJackpot ? 'text-yellow-300 animate-pulse' : 'text-purple-400'}`}
        >
          {reward}
        </div>

        <button
          onClick={onCollect}
          disabled={!reward || disabled}
          className={`px-6 py-3 rounded-lg font-bold transition-all
    ${
      !reward || disabled
        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105'
    }
  `}
        >
          {!reward ? 'NO REWARD' : disabled ? 'PROCESSING...' : 'COLLECT'}
        </button>
      </div>
    </div>
  );
}
