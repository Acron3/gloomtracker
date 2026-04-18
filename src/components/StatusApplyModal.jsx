import { motion } from 'framer-motion';
import statusData from '../data/statuses.json';
import useGameStore from '../store/gameStore';

export default function StatusApplyModal({ entity, onClose }) {
  const applyStatus = useGameStore((s) => s.applyStatus);

  const apply = (st) => {
    applyStatus(entity.id, { id: st.id, name: st.name, icon: st.icon,
                              type: st.type, description: st.description,
                              removeOn: st.removeOn });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass border-t border-[#2e3850] rounded-t-2xl p-5"
      >
        <div className="w-10 h-1 rounded-full bg-[#2e3850] mx-auto mb-4" />
        <h3 className="text-base font-bold text-gray-200 mb-4 font-display">
          Apply Condition to {entity.name}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {statusData.map((st) => {
            const already = entity.statuses.find((s) => s.id === st.id);
            return (
              <button
                key={st.id}
                onClick={() => !already && apply(st)}
                disabled={!!already}
                className={`flex items-center gap-3 p-3 rounded-xl border text-sm
                  text-left transition-all touch-manipulation active:scale-95
                  ${already
                    ? 'opacity-40 cursor-not-allowed border-[#1e2535] bg-[#0f1219]'
                    : st.type === 'harmful'
                    ? 'bg-red-950/30 border-red-900/50 text-red-200 hover:border-red-700'
                    : 'bg-green-950/30 border-green-900/50 text-green-200 hover:border-green-700'
                  }`}
              >
                <span className="text-xl">{st.icon}</span>
                <div>
                  <div className="font-semibold">{st.name}</div>
                  <div className="text-[10px] opacity-60 leading-tight">{st.description}</div>
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl bg-[#1e2535] text-gray-400
                     text-sm font-medium active:scale-95 transition-transform"
        >Cancel</button>
      </motion.div>
    </motion.div>
  );
}
