import { motion } from 'framer-motion';
import { User, Skull, Check } from 'lucide-react';
import MonsterIcon from './MonsterIcon';
import statusData from '../data/statuses.json';
import useGameStore from '../store/gameStore';

export default function EntityCard({ entity, isActive, isPast, onClick }) {
  const pct = entity.maxHp > 0 ? (entity.hp / entity.maxHp) * 100 : 0;
  const hpColor = pct > 60 ? '#40916c' : pct > 30 ? '#f59e0b' : '#c0392b';

  return (
    <motion.div
      layout
      onClick={() => !entity.isDead && onClick && onClick(entity)}
      className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer
        select-none touch-manipulation transition-all duration-200
        ${entity.isDead ? 'opacity-30' : ''}
        ${isActive
          ? 'glass border border-[#c9a84c]/60 turn-active'
          : isPast
          ? 'bg-[#0f1219]/60 border border-[#1e2535]/40'
          : 'glass-light border border-[#2e3850]/50 hover:border-[#2e3850]'
        }`}
    >
      {/* Active indicator stripe */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-[#c9a84c]" />
      )}

      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
          ${entity.isElite ? 'ring-2 ring-[#c9a84c] glow-gold' : ''}`}
        style={{ backgroundColor: '#1e2535' }}
      >
        {entity.isDead ? (
          <Skull className="w-5 h-5 text-gray-600" />
        ) : entity.type === 'player' ? (
          entity.icon
            ? <span className="text-xl leading-none">{entity.icon}</span>
            : <User className="w-5 h-5 text-gray-400" />
        ) : (
          <MonsterIcon icon={entity.icon} className={`w-6 h-6 ${entity.isElite ? 'text-gold' : 'text-blood-light'}`} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-semibold truncate
            ${isActive ? 'text-[#c9a84c]' : isPast ? 'text-gray-600' : 'text-gray-200'}`}>
            {entity.name}
          </span>
          {entity.isElite && (
            <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-[#c9a84c]/20
                             text-[#c9a84c] flex-shrink-0">ELITE</span>
          )}
          {entity.hasTakenTurn && !isActive && (
            <Check className="w-3 h-3 text-gray-600 flex-shrink-0" />
          )}
        </div>

        {/* HP bar */}
        <div className="mt-1.5 h-1.5 rounded-full bg-[#1e2535] overflow-hidden">
          <div className="h-full rounded-full hp-bar-fill"
               style={{ width: `${pct}%`, backgroundColor: hpColor }} />
        </div>

        {/* Status icons row */}
        {entity.statuses.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {entity.statuses.slice(0, 6).map((st) => {
              const def = statusData.find((s) => s.id === st.id) || st;
              return (
                <span
                  key={st.id}
                  title={def.name}
                  className="text-[13px] leading-none"
                >
                  {def.icon || '●'}
                </span>
              );
            })}
            {entity.statuses.length > 6 && (
              <span className="text-[10px] text-gray-500">+{entity.statuses.length - 6}</span>
            )}
          </div>
        )}
      </div>

      {/* Initiative badge */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center gap-0.5"
      >
        <span className={`text-[8px] font-bold uppercase tracking-tighter
          ${isActive ? 'text-black' : 'text-gray-500'}`}>Init</span>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center
          text-sm font-bold font-mono transition-all border-2
          ${isActive 
            ? 'bg-gold text-black border-gold shadow-lg shadow-gold/40' 
            : 'bg-void border-border/50 text-gray-400 focus-within:border-gold/50 focus-within:ring-2 focus-within:ring-gold/10'}`}>
          <input
            type="number"
            min={1} max={99}
            value={entity.initiative === 99 ? '' : entity.initiative}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (entity.type === 'player') {
                useGameStore.getState().updateEntityInitiative(entity.id, val);
              } else {
                useGameStore.getState().setMonsterTypeInitiative(entity.monsterType, val);
              }
            }}
            placeholder="SET"
            className={`w-full h-full bg-transparent text-center outline-none border-none
                       placeholder:text-gray-700 appearance-none text-sm font-bold
                       ${entity.initiative === 99 ? 'animate-pulse' : ''}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
