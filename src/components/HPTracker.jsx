import { motion } from 'framer-motion';
import useGameStore from '../store/gameStore';

export default function HPTracker({ entity }) {
  const updateHp = useGameStore((s) => s.updateHp);
  const healEntity = useGameStore((s) => s.healEntity);
  const pct = entity.maxHp > 0 ? (entity.hp / entity.maxHp) * 100 : 0;

  const hpColor =
    pct > 60 ? '#40916c' : pct > 30 ? '#f59e0b' : '#c0392b';

  const step = (delta) => {
    if (delta > 0) healEntity(entity.id, delta);
    else updateHp(entity.id, delta);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400 font-medium">HP</span>
        <span className="font-bold text-base" style={{ color: hpColor }}>
          {entity.hp}
          <span className="text-gray-500 font-normal text-xs"> / {entity.maxHp}</span>
        </span>
      </div>

      {/* Bar */}
      <div className="h-3 rounded-full bg-[#1e2535] overflow-hidden">
        <motion.div
          className="h-full rounded-full hp-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: hpColor }}
          layout
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 mt-1">
        {[-5, -3, -1].map((d) => (
          <button
            key={d}
            onClick={() => step(d)}
            className="flex-1 py-1.5 rounded-lg text-xs font-bold text-red-400
                       bg-red-900/20 border border-red-900/40 active:scale-95
                       transition-transform touch-manipulation"
          >
            {d}
          </button>
        ))}
        <div className="w-px h-5 bg-[#2e3850]" />
        {[1, 3, 5].map((d) => (
          <button
            key={d}
            onClick={() => step(d)}
            className="flex-1 py-1.5 rounded-lg text-xs font-bold text-green-400
                       bg-green-900/20 border border-green-900/40 active:scale-95
                       transition-transform touch-manipulation"
          >
            +{d}
          </button>
        ))}
      </div>
    </div>
  );
}
