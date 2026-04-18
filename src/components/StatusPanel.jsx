import { motion } from 'framer-motion';
import useGameStore from '../store/gameStore';
import statusData from '../data/statuses.json';

export default function StatusPanel({ entity, onAdd }) {
  const removeStatus = useGameStore((s) => s.removeStatus);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400 font-medium">Conditions</span>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg
                     bg-gold/15 border border-gold/40 text-gold
                     active:scale-95 transition-transform touch-manipulation"
        >
          <span className="text-base leading-none">＋</span> Add Condition
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {entity.statuses.length === 0 && (
          <span className="text-xs text-gray-600 italic">No conditions</span>
        )}
        {entity.statuses.map((st) => {
          const def = statusData.find((s) => s.id === st.id) || st;
          const isHarmful = def.type === 'harmful';
          return (
            <motion.button
              key={st.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => removeStatus(entity.id, st.id)}
              whileTap={{ scale: 0.85 }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                touch-manipulation border transition-colors
                ${isHarmful
                  ? 'bg-red-950/40 border-red-800/50 text-red-300 badge-harmful'
                  : 'bg-green-950/40 border-green-800/50 text-green-300'}`}
              title={def.description}
            >
              <span>{def.icon}</span>
              <span>{def.name}</span>
              <span className="opacity-50 text-[10px]">✕</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
