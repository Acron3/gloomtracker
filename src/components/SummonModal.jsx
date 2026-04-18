import { useState } from 'react';
import { motion } from 'framer-motion';
import { PawPrint, Skull, Bird, Ghost, Dog, Leaf, Flame } from 'lucide-react';
import useGameStore from '../store/gameStore';

const ICON_OPTIONS = [
  { id: 'paw',   label: 'Paw',   Component: PawPrint },
  { id: 'skull', label: 'Skull', Component: Skull },
  { id: 'bird',  label: 'Bird',  Component: Bird },
  { id: 'ghost', label: 'Ghost', Component: Ghost },
  { id: 'dog',   label: 'Dog',   Component: Dog },
  { id: 'leaf',  label: 'Leaf',  Component: Leaf },
  { id: 'flame', label: 'Flame', Component: Flame },
];

export default function SummonModal({ summoner, onClose }) {
  const addSummon = useGameStore((s) => s.addSummon);
  const [name, setName] = useState('');
  const [hp, setHp] = useState('');
  const [iconId, setIconId] = useState('paw');

  const handleSummon = () => {
    if (!name.trim() || !hp) return;
    
    addSummon(summoner.id, {
      name: name.trim(),
      hp: Number(hp),
      maxHp: Number(hp),
      icon: iconId  // use id for summon icon
    });
    
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
        className="w-full max-w-lg glass border-t border-[#2e3850] rounded-t-2xl p-5 flex flex-col"
      >
        <div className="w-10 h-1 rounded-full bg-[#2e3850] mx-auto mb-4" />
        <h3 className="text-base font-bold text-gray-200 mb-1 font-display">
          Summon Ally
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Summoned by {summoner.name}
        </p>

        <div className="flex flex-col gap-3 mb-5">
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block px-1">
              Summon Name
            </label>
            <input
              type="text"
              placeholder="e.g. Mystic Ally, Rat Swarm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#1e2535] border border-[#2e3850] text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-[#c9a84c] transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block px-1">
                Max HP
              </label>
              <input
                type="number"
                min="1"
                placeholder="HP"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1e2535] border border-[#2e3850] text-sm text-center text-white font-mono outline-none focus:border-[#c9a84c] transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block px-1">
                Icon
              </label>
              <div className="h-[46px] px-2 rounded-xl bg-[#1e2535] border border-[#2e3850] flex items-center gap-1 overflow-x-auto custom-scrollbar">
                {ICON_OPTIONS.map(({ id, label, Component }) => (
                  <button
                    key={id}
                    onClick={() => setIconId(id)}
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                      ${iconId === id ? 'bg-[#c9a84c]/20 border border-[#c9a84c] text-gold' : 'text-gray-500 opacity-70 hover:opacity-100'}`}
                    title={label}
                  >
                    <Component className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSummon}
          disabled={!name.trim() || !hp}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all
                     touch-manipulation active:scale-95
                     disabled:opacity-40 disabled:cursor-not-allowed
                     bg-[#c9a84c] text-black glow-gold"
        >
          Cast Summon
        </button>
      </motion.div>
    </motion.div>
  );
}
