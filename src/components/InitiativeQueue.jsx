import { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Swords } from 'lucide-react';
import EntityCard from './EntityCard';
import useGameStore from '../store/gameStore';

export default function InitiativeQueue({ onSelectEntity }) {
  const turnQueue = useGameStore((s) => s.turnQueue);
  const currentTurnIndex = useGameStore((s) => s.currentTurnIndex);
  const entities = useGameStore((s) => s.entities);
  const listRef = useRef(null);

  // Merge live entity state into queue (HP, statuses may have changed)
  const liveQueue = turnQueue.map((qe) => {
    const live = entities.find((e) => e.id === qe.id);
    return live || qe;
  });

  const isRoundOver = currentTurnIndex >= turnQueue.length;

  return (
    <div ref={listRef} className="flex flex-col gap-2 pb-2">
      {liveQueue.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
          No entities in queue
        </div>
      )}

      {/* Group label helper */}
      {liveQueue.map((entity, idx) => {
        const isActive = idx === currentTurnIndex && !isRoundOver;
        const isPast = idx < currentTurnIndex;

        // Show monster-type group header when type changes
        const prevType = idx > 0 ? liveQueue[idx - 1].monsterType : null;
        const showGroupHeader =
          entity.type === 'monster' &&
          entity.monsterType !== prevType;

        return (
          <div key={entity.id}>
            {showGroupHeader && (
              <div className="flex items-center gap-2 px-1 mt-1 mb-0.5">
                <div className="flex-1 h-px bg-[#2e3850]/50" />
                <span className="text-[10px] text-gray-600 font-medium tracking-widest uppercase">
                  {entity.monsterName}
                </span>
                <div className="flex-1 h-px bg-[#2e3850]/50" />
              </div>
            )}
            <EntityCard
              entity={entity}
              isActive={isActive}
              isPast={isPast}
              onClick={onSelectEntity}
            />
          </div>
        );
      })}

      {isRoundOver && liveQueue.length > 0 && (
        <div className="text-center py-4 text-[#c9a84c] text-sm font-semibold animate-pulse flex items-center justify-center gap-2">
          <Swords className="w-4 h-4" /> Round Complete — End Round to continue
        </div>
      )}
    </div>
  );
}
