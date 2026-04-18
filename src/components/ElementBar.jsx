import { motion, AnimatePresence } from 'framer-motion';
import elements from '../data/elements.json';
import useGameStore from '../store/gameStore';

const STATE_CONFIG = {
  strong: { label: 'Strong', opacity: 1, scale: 1.15, ring: 'ring-2' },
  waning: { label: 'Waning', opacity: 0.5, scale: 1, ring: 'ring-1' },
  inert:  { label: 'Inert',  opacity: 0.2, scale: 0.9, ring: '' },
};

export default function ElementBar() {
  const elementState = useGameStore((s) => s.elements);
  const setElement = useGameStore((s) => s.setElement);

  const cycle = (el) => {
    const cur = elementState[el.id];
    const next = cur === 'inert' ? 'strong' : cur === 'strong' ? 'waning' : 'inert';
    setElement(el.id, next);
  };

  return (
    <div className="flex justify-around items-center px-3 py-2 glass rounded-xl">
      {elements.map((el) => {
        const state = elementState[el.id] || 'inert';
        const cfg = STATE_CONFIG[state];
        return (
          <motion.button
            key={el.id}
            onClick={() => cycle(el)}
            whileTap={{ scale: 0.85 }}
            style={{ opacity: cfg.opacity }}
            className="flex flex-col items-center gap-0.5 select-none touch-manipulation"
          >
            <motion.div
              animate={{ scale: cfg.scale }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl
                ${state === 'strong' ? `${el.glowClass}` : ''}
                ${cfg.ring} ring-offset-1 ring-offset-[#0a0c10]`}
              style={{ backgroundColor: `${el.color}22`, borderColor: el.color,
                       border: `1px solid ${el.color}` }}
            >
              <span className="leading-none">{el.icon}</span>
            </motion.div>
            <span className="text-[9px] font-medium tracking-wide"
                  style={{ color: state === 'strong' ? el.color : '#6b7280' }}>
              {el.name.slice(0, 3).toUpperCase()}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
