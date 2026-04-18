import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, User, ArrowRight, Swords, AlertTriangle } from 'lucide-react';
import MonsterIcon from '../components/MonsterIcon';
import ElementBar from '../components/ElementBar';
import InitiativeQueue from '../components/InitiativeQueue';
import ActiveTurnPanel from '../components/ActiveTurnPanel';
import useGameStore, { sortQueue } from '../store/gameStore';
import elementsData from '../data/elements.json';

function RoundEndOverlay({ onConfirm, onCancel }) {
  const elements = useGameStore((s) => s.elements);
  const round = useGameStore((s) => s.round);

  const decayPreview = {};
  for (const el of elementsData) {
    const cur = elements[el.id];
    decayPreview[el.id] = cur === 'strong' ? 'waning' : cur === 'waning' ? 'inert' : 'inert';
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass rounded-2xl p-6 w-full max-w-sm"
      >
        <h2 className="text-xl font-bold text-gold font-display mb-1">
          End of Round {round}
        </h2>
        <p className="text-xs text-gray-500 mb-5">Elements will decay. Ready for round {round + 1}?</p>

        <div className="mb-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Element Decay</p>
          <div className="grid grid-cols-3 gap-2">
            {elementsData.map((el) => {
              const cur = elements[el.id];
              const next = decayPreview[el.id];
              const changed = cur !== next;
              return (
                <div key={el.id}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl
                    ${changed ? 'bg-card-2 border border-border' : 'opacity-30'}`}>
                  <span className="text-xl">{el.icon}</span>
                  <span className="text-[10px] text-gray-400">{el.name}</span>
                  {changed && (
                    <span className="text-[10px] font-semibold" style={{ color: el.color }}>
                      {cur} → {next}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm text-gray-400
                       bg-card-2 border border-border active:scale-95 transition-transform">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-[2] py-3 rounded-xl text-sm font-bold
                       bg-gold text-black active:scale-95 transition-transform glow-gold">
            Start Round {round + 1} →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InitiativeInputPhase() {
  const entities = useGameStore((s) => s.entities);
  const finishInitiativePhase = useGameStore((s) => s.finishInitiativePhase);
  const updateEntityInitiative = useGameStore((s) => s.updateEntityInitiative);
  const setMonsterTypeInitiative = useGameStore((s) => s.setMonsterTypeInitiative);
  const monsterTypePriority = useGameStore((s) => s.monsterTypePriority);
  const setMonsterTypePriority = useGameStore((s) => s.setMonsterTypePriority);
  const round = useGameStore((s) => s.round);

  const players = entities.filter((e) => e.type === 'player' && !e.isDead);
  const monsterGroups = [...new Set(
    entities.filter((e) => e.type === 'monster' && !e.isDead).map((e) => e.monsterType)
  )].map(mt => {
    return entities.find(e => e.monsterType === mt);
  });

  const allSet = [...players, ...monsterGroups].every(e => e.initiative !== 99);

  // Live preview of queue
  const previewQueue = allSet ? sortQueue(entities, monsterTypePriority) : [];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Timer className="w-6 h-6 text-gold" />
          <h2 className="text-xl font-bold text-gold font-display">Round {round} Setup</h2>
        </div>
        <p className="text-xs text-gray-500">Reveal initiatives and resolve ties</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-6">
        {/* Input grid */}
        <div className="grid grid-cols-1 gap-3">
          {/* Players */}
          {players.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-void/60 text-2xl">
                {p.icon ? p.icon : <User className="w-6 h-6 text-gray-400" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-200 truncate">{p.name}</p>
                <p className="text-[10px] text-gray-600">Player</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-gold uppercase tracking-tighter">Initiative</span>
                <input
                  type="number" min={1} max={99} placeholder="SET"
                  value={p.initiative === 99 ? '' : p.initiative}
                  onChange={(e) => updateEntityInitiative(p.id, Number(e.target.value))}
                  className={`w-20 h-14 bg-void border-2 rounded-xl
                             text-center text-2xl font-mono font-bold text-gold outline-none
                             transition-all placeholder:text-gold/20
                             ${p.initiative === 99 
                               ? 'border-gold/60 glow-gold animate-pulse' 
                               : 'border-gold/30'
                             }
                             focus:border-gold focus:ring-4 focus:ring-gold/30 focus:animate-none`}
                />
              </div>
            </div>
          ))}

          {/* Monster Types */}
          {monsterGroups.map(m => {
            // Check for ties with other monster types
            const tiedWith = monsterGroups.filter(other => 
              other.monsterType !== m.monsterType && 
              other.initiative === m.initiative && 
              m.initiative !== 99
            );
            const hasTie = tiedWith.length > 0;

            return (
              <div key={m.monsterType} className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-void/60">
                    <MonsterIcon icon={m.icon} className="w-6 h-6 text-blood-light" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-200 truncate">{m.monsterName}</p>
                    <p className="text-[10px] text-gray-600">Monster Group</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-blood-light uppercase tracking-tighter">Initiative</span>
                    <input
                      type="number" min={1} max={99} placeholder="SET"
                      value={m.initiative === 99 ? '' : m.initiative}
                      onChange={(e) => setMonsterTypeInitiative(m.monsterType, Number(e.target.value))}
                      className={`w-20 h-14 bg-void border-2 rounded-xl
                                 text-center text-2xl font-mono font-bold text-blood-light outline-none
                                 transition-all placeholder:text-blood-light/20
                                 ${m.initiative === 99 
                                   ? 'border-blood-light/60 shadow-[0_0_15px_rgba(192,57,43,0.4)] animate-pulse' 
                                   : 'border-blood/30'
                                 }
                                 focus:border-blood-light focus:ring-4 focus:ring-blood/30 focus:animate-none`}
                    />
                  </div>
                </div>
                
                {hasTie && (
                  <div className="px-3 py-2 rounded-xl bg-blood/5 border border-blood/20 flex items-center justify-between">
                    <span className="text-[10px] text-blood-light font-bold uppercase tracking-wider">Tie-breaker Priority</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setMonsterTypePriority(m.monsterType, (monsterTypePriority[m.monsterType] || 0) - 1)}
                        className="w-6 h-6 rounded bg-blood/20 text-blood-light text-xs flex items-center justify-center active:scale-90"
                      >↑</button>
                      <button 
                        onClick={() => setMonsterTypePriority(m.monsterType, (monsterTypePriority[m.monsterType] || 0) + 1)}
                        className="w-6 h-6 rounded bg-blood/20 text-blood-light text-xs flex items-center justify-center active:scale-90"
                      >↓</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Preview */}
        {allSet && (
          <div className="mt-2">
            <h3 className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-1 mb-3">Order Preview</h3>
            <div className="flex flex-col gap-2">
              {previewQueue.map((e, idx) => (
                <div key={`${e.id}-${idx}`} className="flex items-center gap-3 opacity-60">
                  <span className="text-[10px] font-mono w-4 text-gray-600">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-card-2 flex items-center justify-center">
                    {e.type === 'player'
                      ? <User className="w-4 h-4 text-gray-400" />
                      : <MonsterIcon icon={e.icon} className="w-4 h-4 text-blood-light" />}
                  </div>
                  <span className="text-xs text-gray-400 truncate flex-1">{e.name}</span>
                  <span className="text-xs font-mono font-bold text-gray-500">{e.initiative}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 pt-2 bg-void/90 backdrop-blur-xl border-t border-border/50">
        <button
          onClick={finishInitiativePhase}
          disabled={!allSet}
          className="w-full py-5 rounded-2xl text-base font-bold transition-all
                     bg-gradient-to-r from-gold to-gold-light text-black
                     disabled:opacity-20 disabled:grayscale shadow-2xl shadow-gold/20
                     active:scale-[0.98]"
        >
          ⚔️ Begin Round {round}
        </button>
      </div>
    </div>
  );
}


export default function Combat() {
  const round = useGameStore((s) => s.round);
  const phase = useGameStore((s) => s.phase);
  const currentTurnIndex = useGameStore((s) => s.currentTurnIndex);
  const turnQueue = useGameStore((s) => s.turnQueue);
  const entities = useGameStore((s) => s.entities);
  const startRound = useGameStore((s) => s.startRound);
  const resetSetup = useGameStore((s) => s.resetSetup);
  const showPanel = useGameStore((s) => s.showPanel);
  const setShowPanel = useGameStore((s) => s.setShowPanel);

  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [showRoundEnd, setShowRoundEnd] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isRoundOver = currentTurnIndex >= turnQueue.length && phase === 'combat';

  // Find entity by ID
  const findEntity = (id) => entities.find((e) => e.id === id);

  const currentEntity = phase === 'combat' && turnQueue[currentTurnIndex] 
    ? findEntity(turnQueue[currentTurnIndex].id) 
    : null;

  const panelEntity = selectedEntityId ? findEntity(selectedEntityId) : currentEntity;

  const handleSelectEntity = (entity) => {
    setSelectedEntityId(entity.id);
    setShowPanel(true);
  };

  const handleConfirmRoundEnd = () => {
    startRound();
    setShowRoundEnd(false);
    setSelectedEntityId(null);
  };

  const aliveCount = entities.filter((e) => !e.isDead).length;

  return (
    <div className="flex flex-col h-dvh bg-void overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-safe pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-base font-bold text-gold font-display flex items-center gap-1.5">
              <Swords className="w-4 h-4" /> Gloom Tracker
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-gray-500">Round <span className="text-white font-bold">{round}</span></span>
              {phase === 'combat' && (
                <span className="text-xs text-gray-500">Turn <span className="text-white font-bold">
                  {Math.min(currentTurnIndex + 1, turnQueue.length)}/{turnQueue.length}
                </span></span>
              )}
              <span className="text-xs text-gray-600">Alive: {aliveCount}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-red-950/40 text-red-400
                         border border-red-900/50 active:scale-95 transition-all"
            >
              Reset Scenario
            </button>
          </div>
        </div>

        {/* Element Bar */}
        <ElementBar />
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {phase === 'initiative' ? (
          <InitiativeInputPhase />
        ) : (
          <>
            {/* Initiative Queue */}
            <div className="flex-1 overflow-y-auto px-4 py-2 min-h-[150px] custom-scrollbar">
              <InitiativeQueue onSelectEntity={handleSelectEntity} />
            </div>

            {/* Bottom: Active Turn or End Round */}
            <div className="flex-shrink-0 z-10">
              {isRoundOver ? (
                <div className="px-4 pb-safe pb-4">
                  <button
                    onClick={() => setShowRoundEnd(true)}
                    className="w-full py-4 rounded-2xl text-base font-bold
                               bg-gradient-to-r from-mana to-blood text-white
                               active:scale-95 transition-transform"
                    style={{ boxShadow: '0 0 24px var(--color-blood-light)44' }}
                  >
                    🔄 End Round {round}
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {showPanel && panelEntity && (
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="max-h-[70dvh] overflow-y-auto custom-scrollbar"
                    >
                      <ActiveTurnPanel 
                        entity={panelEntity} 
                        onClose={() => setShowPanel(false)}
                        onBackToActive={() => setSelectedEntityId(null)}
                      />
                    </motion.div>
                  )}
                  {!showPanel && !isRoundOver && (
                    <div className="px-4 pb-safe pb-4 flex justify-center">
                      <button 
                        onClick={() => setShowPanel(true)}
                        className="glass-light px-10 py-4 rounded-full text-sm font-bold text-gold
                                   border border-gold/40 active:scale-95 transition-all shadow-2xl
                                   hover:bg-gold/10"
                      >
                        Show Turn Panel ↑
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showRoundEnd && (
          <RoundEndOverlay
            onConfirm={handleConfirmRoundEnd}
            onCancel={() => setShowRoundEnd(false)}
          />
        )}
      </AnimatePresence>
      {/* Reset Confirm Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-2xl p-6 w-full max-w-sm border border-red-900/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-950/60 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-red-400 font-display">Reset Scenario?</h2>
              </div>
              <p className="text-sm text-gray-400 mb-5">All progress — HP, statuses, rounds — will be permanently lost. This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-xl text-sm text-gray-400
                             bg-card-2 border border-border active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { resetSetup(); setShowResetConfirm(false); }}
                  className="flex-[1.5] py-3 rounded-xl text-sm font-bold
                             bg-red-600 text-white active:scale-95 transition-transform"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

