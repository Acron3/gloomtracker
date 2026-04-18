import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { User, Skull, Zap, Plus, ArrowRight, ArrowLeft, ChevronDown, Ghost } from 'lucide-react';
import MonsterIcon from './MonsterIcon';
import HPTracker from './HPTracker';
import StatusPanel from './StatusPanel';
import StatusApplyModal from './StatusApplyModal';
import SpawnModal from './SpawnModal';
import SummonModal from './SummonModal';
import useGameStore from '../store/gameStore';

export default function ActiveTurnPanel({ entity, onClose, onBackToActive }) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const [showSummonModal, setShowSummonModal] = useState(false);
  const endTurn = useGameStore((s) => s.endTurn);
  const skipTurn = useGameStore((s) => s.skipTurn);
  const killEntity = useGameStore((s) => s.killEntity);
  const isRoundOver = useGameStore((s) => s.currentTurnIndex >= s.turnQueue.length);

  const currentEntityId = useGameStore((s) => s.turnQueue[s.currentTurnIndex]?.id);
  const isCurrentActive = entity?.id === currentEntityId;

  const isStunned = entity?.statuses?.some((s) => s.id === 'stun');

  if (!entity || isRoundOver) return null;

  const handleEndTurn = () => {
    if (isStunned) skipTurn();
    else endTurn();
  };

  return (
    <>
      <div
        className="glass border-t border-[#2e3850] rounded-t-2xl p-4 flex flex-col gap-4 shadow-2xl relative"
      >
        {/* Dismiss button */}
        <button 
          onClick={onClose}
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-6 flex items-center justify-center
                     glass-light rounded-t-lg border-b-0 text-gray-500 hover:text-gold transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
            ${entity.isElite ? 'ring-2 ring-gold glow-gold' : ''}`}
               style={{ backgroundColor: '#1e2535' }}>
            {entity.type === 'player' ? (
              entity.icon
                ? <span className="text-2xl leading-none">{entity.icon}</span>
                : <User className="w-7 h-7 text-gray-400" />
            ) : (
              <MonsterIcon icon={entity.icon} className={`w-7 h-7 ${entity.isElite ? 'text-gold' : 'text-blood-light'}`} />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gold font-display">{entity.name}</h2>
              {entity.isElite && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded
                  bg-gold/20 text-gold">ELITE</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">Initiative</span>
              <span className="text-xs font-mono font-bold text-white bg-surface
                                px-1.5 py-0.5 rounded">
                {entity.initiative === 99 ? '?' : entity.initiative}
              </span>
              {isStunned && (
                <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                  <Zap className="w-3 h-3" /> STUNNED
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1.5">
            {/* Kill button */}
            <button
              onClick={() => killEntity(entity.id)}
              className="w-9 h-9 rounded-lg bg-blood/10 border border-blood/30
                         text-blood-light flex items-center justify-center text-sm
                         active:scale-90 transition-transform touch-manipulation"
              title="Kill entity"
            ><Skull className="w-4 h-4" /></button>
          </div>
        </div>

        {/* HP */}
        <HPTracker entity={entity} />

        {/* Status */}
        <StatusPanel entity={entity} onAdd={() => setShowStatusModal(true)} />

        {/* Action row */}
        <div className="flex gap-2 pt-1">
          {isCurrentActive ? (
          <>
              {/* Spawn & Summon as compact icon-cards */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => setShowSpawnModal(true)}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl
                             bg-blood/10 border border-blood/30 text-blood-light
                             active:scale-95 transition-transform touch-manipulation min-w-[60px]"
                >
                  <Skull className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Spawn</span>
                </button>
                <button
                  onClick={() => setShowSummonModal(true)}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl
                             bg-[#1e2535] border border-[#2e3850] text-gray-300
                             active:scale-95 transition-transform touch-manipulation min-w-[60px]"
                >
                  <Ghost className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Summon</span>
                </button>
              </div>
              <button
                onClick={handleEndTurn}
                className="flex-1 py-3 rounded-xl text-sm font-bold
                           bg-gold text-black active:scale-95
                           transition-transform touch-manipulation glow-gold"
              >
                {isStunned ? 'Skip (Stunned)' : <span className="flex items-center gap-1 justify-center">End Turn <ArrowRight className="w-4 h-4" /></span>}
              </button>
            </>
          ) : (
            <button
              onClick={onBackToActive}
              className="w-full py-3 rounded-xl text-sm font-bold
                         bg-card-2 border border-border text-gray-300 active:scale-95
                         transition-transform touch-manipulation"
            >
              <span className="flex items-center gap-2 justify-center"><ArrowLeft className="w-4 h-4" /> Back to Active Turn</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showStatusModal && (
          <StatusApplyModal
            entity={entity}
            onClose={() => setShowStatusModal(false)}
          />
        )}
        {showSpawnModal && (
          <SpawnModal onClose={() => setShowSpawnModal(false)} />
        )}
        {showSummonModal && (
          <SummonModal summoner={entity} onClose={() => setShowSummonModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
