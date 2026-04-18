import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import monstersData from '../data/monsters.json';
import scenariosData from '../data/scenarios.json';

const ELEMENTS = ['fire', 'ice', 'wind', 'earth', 'light', 'dark'];

const defaultElementState = () =>
  Object.fromEntries(ELEMENTS.map((e) => [e, 'inert']));

export function sortQueue(entities, monsterTypePriority = {}) {
  const getRoot = (e) => e.summonerId ? entities.find(x => x.id === e.summonerId) || e : e;

  return [...entities]
    .filter((e) => !e.isDead)
    .sort((a, b) => {
      // 1. Initiative (Lower is faster)
      if (a.initiative !== b.initiative) return a.initiative - b.initiative;
      
      const rootA = getRoot(a);
      const rootB = getRoot(b);

      if (rootA.id !== rootB.id) {
        // 2. Tie-breaker: Players before monsters
        if (rootA.type !== rootB.type) return rootA.type === 'player' ? -1 : 1;
        
        // 3. Ties between players: keep original relative order
        if (rootA.type === 'player') return 0;
        
        // 4. Ties between monsters
        if (rootA.monsterType !== rootB.monsterType) {
          const pA = monsterTypePriority[rootA.monsterType] || 0;
          const pB = monsterTypePriority[rootB.monsterType] || 0;
          return pA - pB;
        }
        
        // 5. Same monster type: Elite first, then standee number
        if (rootA.isElite !== rootB.isElite) return rootA.isElite ? -1 : 1;
        return (rootA.standeeNumber || 0) - (rootB.standeeNumber || 0);
      }

      // 6. Tie-breaker for summons vs root or summons vs summons
      if (a.id === rootA.id) return 1; // a is root -> b goes first
      if (b.id === rootB.id) return -1; // b is root -> a goes first

      // Both are summons of same root
      return (a.summonIndex || 0) - (b.summonIndex || 0);
    });
}

const useGameStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────
      phase: 'setup',        // 'setup' | 'initiative' | 'combat'
      round: 0,
      entities: [],          // all players + monster standees
      turnQueue: [],         // sorted for current round
      currentTurnIndex: 0,
      showPanel: true,       // UI state: whether active turn panel is visible
      elements: defaultElementState(),
      scenarioLevel: 1,
      selectedScenario: 'custom',
      monsterTypePriority: {}, // { monsterId: number } for tie-breaking
      log: [],

      // ── Setup Actions ──────────────────────────────────────
      addPlayer: (player) =>
        set((s) => ({
          entities: [...s.entities, {
            id: `player-${Date.now()}`,
            type: 'player',
            initiative: 99,
            hp: player.maxHp,
            maxHp: player.maxHp,
            statuses: [],
            hasTakenTurn: false,
            isDead: false,
            ...player,
          }],
        })),

      addMonsterGroup: (group) =>
        set((s) => {
          const standees = [];
          let standeeCounter = 1;
          
          for (let i = 1; i <= group.eliteCount; i++) {
            standees.push({
              id: `${group.monsterId}-elite-${standeeCounter}-${Date.now()}`,
              type: 'monster',
              monsterType: group.monsterId,
              monsterName: group.monsterName,
              icon: group.icon,
              name: `${group.monsterName} E#${standeeCounter}`,
              standeeNumber: standeeCounter,
              isElite: true,
              initiative: 99,
              hp: group.eliteHp,
              maxHp: group.eliteHp,
              statuses: [],
              hasTakenTurn: false,
              isDead: false,
            });
            standeeCounter++;
          }
          
          for (let i = 1; i <= group.normalCount; i++) {
            standees.push({
              id: `${group.monsterId}-normal-${standeeCounter}-${Date.now()}`,
              type: 'monster',
              monsterType: group.monsterId,
              monsterName: group.monsterName,
              icon: group.icon,
              name: `${group.monsterName} #${standeeCounter}`,
              standeeNumber: standeeCounter,
              isElite: false,
              initiative: 99,
              hp: group.normalHp,
              maxHp: group.normalHp,
              statuses: [],
              hasTakenTurn: false,
              isDead: false,
            });
            standeeCounter++;
          }
          
          return { entities: [...s.entities, ...standees] };
        }),

      removeEntity: (id) =>
        set((s) => ({ entities: s.entities.filter((e) => e.id !== id) })),

      updateEntityInitiative: (id, initiative) =>
        set((s) => ({
          entities: s.entities.map((e) =>
            (e.id === id || e.summonerId === id) ? { ...e, initiative } : e
          ),
        })),

      setMonsterTypeInitiative: (monsterType, initiative) =>
        set((s) => {
          const monsterIds = s.entities.filter(e => e.monsterType === monsterType).map(e => e.id);
          return {
            entities: s.entities.map((e) =>
              (e.monsterType === monsterType || monsterIds.includes(e.summonerId)) ? { ...e, initiative } : e
            ),
          };
        }),

      setScenarioLevel: (level) => set((s) => {
        if (s.phase !== 'setup') return { scenarioLevel: level };
        const lvlStr = String(level);
        return {
          scenarioLevel: level,
          entities: s.entities.map(e => {
            if (e.type !== 'monster') return e;
            const mData = monstersData.find(x => x.id === e.monsterType);
            if (!mData) return e;
            const stats = mData.levels[lvlStr]?.[e.isElite ? 'elite' : 'normal'] || mData.levels['1'][e.isElite ? 'elite' : 'normal'];
            return { ...e, hp: stats.hp, maxHp: stats.hp };
          })
        };
      }),

      loadScenarioTemplate: (scenarioId) =>
        set((s) => {
          const players = s.entities.filter(e => e.type === 'player');
          const scenario = scenariosData.find(sc => sc.id === scenarioId);
          if (!scenario) return { selectedScenario: 'custom', entities: players };
          
          let updatedEntities = [...players];
          const lvl = String(s.scenarioLevel);
          const pCount = Math.max(2, Math.min(4, players.length === 0 ? 2 : players.length));
          
          for (const m of scenario.monsters) {
            const mData = monstersData.find(x => x.id === m.monsterId);
            if (!mData) continue;
            
            const normalHp = mData.levels[lvl]?.normal?.hp || mData.levels['1'].normal.hp;
            const eliteHp = mData.levels[lvl]?.elite?.hp || mData.levels['1'].elite.hp;
            
            const countConfig = m.counts ? m.counts[String(pCount)] : { normal: m.normalCount || 0, elite: m.eliteCount || 0 };
            
            const group = {
              monsterId: mData.id,
              monsterName: mData.name,
              icon: mData.icon,
              normalCount: countConfig.normal,
              eliteCount: countConfig.elite,
              normalHp, eliteHp
            };
            
            const standees = [];
            let standeeCounter = 1;
            for (let i = 1; i <= group.eliteCount; i++) {
              standees.push({
                id: `${group.monsterId}-elite-${standeeCounter}-${Date.now()}`,
                type: 'monster',
                monsterType: group.monsterId,
                monsterName: group.monsterName,
                icon: group.icon,
                name: `${group.monsterName} E#${standeeCounter}`,
                standeeNumber: standeeCounter,
                isElite: true,
                initiative: 99,
                hp: group.eliteHp,
                maxHp: group.eliteHp,
                statuses: [],
                hasTakenTurn: false,
                isDead: false,
              });
              standeeCounter++;
            }
            for (let i = 1; i <= group.normalCount; i++) {
              standees.push({
                id: `${group.monsterId}-normal-${standeeCounter}-${Date.now()}`,
                type: 'monster',
                monsterType: group.monsterId,
                monsterName: group.monsterName,
                icon: group.icon,
                name: `${group.monsterName} #${standeeCounter}`,
                standeeNumber: standeeCounter,
                isElite: false,
                initiative: 99,
                hp: group.normalHp,
                maxHp: group.normalHp,
                statuses: [],
                hasTakenTurn: false,
                isDead: false,
              });
              standeeCounter++;
            }
            updatedEntities.push(...standees);
          }
          return { selectedScenario: scenarioId, entities: updatedEntities };
        }),

      resetSetup: () =>
        set({
          entities: [],
          phase: 'setup',
          round: 0,
          selectedScenario: 'custom',
          turnQueue: [],
          currentTurnIndex: 0,
          elements: defaultElementState(),
          monsterTypePriority: {},
          log: [],
        }),

      setMonsterTypePriority: (monsterType, priority) =>
        set((s) => ({
          monsterTypePriority: { ...s.monsterTypePriority, [monsterType]: priority },
        })),

      // ── Combat Actions ─────────────────────────────────────
      startCombat: () => {
        set({
          phase: 'initiative',
          round: 1,
          currentTurnIndex: 0,
          showPanel: true,
          log: [{ id: Date.now(), text: 'Campaign begins!', type: 'round' }],
        });
      },

      finishInitiativePhase: () => {
        const { entities, monsterTypePriority } = get();
        const queue = sortQueue(entities, monsterTypePriority);
        set({
          phase: 'combat',
          turnQueue: queue,
          currentTurnIndex: 0,
        });
        // Apply start-of-turn effects for the first entity
        if (queue[0]) {
          get().applyStartOfTurnEffects(queue[0].id);
        }
      },

      startRound: () => {
        const { entities, round, elements, log } = get();
        const newRound = round + 1;
        const newElements = {};
        for (const el of ELEMENTS) {
          if (elements[el] === 'strong') newElements[el] = 'waning';
          else if (elements[el] === 'waning') newElements[el] = 'inert';
          else newElements[el] = 'inert';
        }
        // Reset initiatives for new round
        const resetEntities = entities.map((e) => ({ 
          ...e, 
          hasTakenTurn: false, 
          initiative: 99 
        }));
        set({
          phase: 'initiative',
          round: newRound,
          entities: resetEntities,
          turnQueue: [],
          currentTurnIndex: 0,
          elements: newElements,
          monsterTypePriority: {}, // Reset priorities for new round
          showPanel: true,
          log: [...(log || []), { id: Date.now(), text: `Round ${newRound} begins!`, type: 'round' }],
        });
      },

      setShowPanel: (show) => set({ showPanel: show }),

      // Called when "End Turn" pressed for current entity
      endTurn: () => {
        const { turnQueue, currentTurnIndex, entities } = get();
        const current = turnQueue[currentTurnIndex];
        if (!current) return;

        // Apply end-of-turn status effects
        let updatedEntities = entities.map((e) => {
          if (e.id !== current.id) return e;
          let newHp = e.hp;
          let newStatuses = [...e.statuses];

          // Regenerate: +1 hp end turn
          if (newStatuses.find((s) => s.id === 'regenerate')) {
            newHp = Math.min(e.maxHp, newHp + 1);
          }
          // Process end_turn statuses duration
          newStatuses = newStatuses.map(s => {
            if (s.removeOn === 'end_turn') {
               return { ...s, expireAtEndOfTurns: (s.expireAtEndOfTurns ?? 1) - 1 };
            }
            return s;
          }).filter((s) => s.removeOn !== 'end_turn' || s.expireAtEndOfTurns > 0);

          return { ...e, hp: newHp, statuses: newStatuses, hasTakenTurn: true };
        });

        // Mark dead
        updatedEntities = updatedEntities.map((e) => ({
          ...e,
          isDead: e.hp <= 0,
        }));
        
        // cascade dead summons
        const deadIds = updatedEntities.filter(e => e.isDead).map(e => e.id);
        updatedEntities = updatedEntities.map(e => 
          (e.summonerId && deadIds.includes(e.summonerId)) ? { ...e, hp: 0, isDead: true } : e
        );

        const nextIndex = currentTurnIndex + 1;
        const nextEntity = turnQueue[nextIndex];

        set({ entities: updatedEntities, currentTurnIndex: nextIndex });

        // Apply start-of-turn effects for next entity
        if (nextEntity) {
          get().applyStartOfTurnEffects(nextEntity.id);
        }
      },

      applyStartOfTurnEffects: (entityId) => {
        set((s) => {
          const updated = s.entities.map((e) => {
            if (e.id !== entityId) return e;
            let newHp = e.hp;
            let newStatuses = [...e.statuses];

            // Wound: -1 hp
            if (newStatuses.find((st) => st.id === 'wound')) {
              newHp = Math.max(0, newHp - 1);
            }
            // Stun: remove after noting it (caller handles skip)
            newStatuses = newStatuses.filter((st) => st.removeOn !== 'start_turn_after');

            return { ...e, hp: newHp, statuses: newStatuses };
          });
          
          // cascade dead summons
          const deadIds = updated.filter(e => e.hp <= 0).map(e => e.id);
          return {
            entities: updated.map(e => 
              (e.summonerId && deadIds.includes(e.summonerId)) ? { ...e, hp: 0, isDead: true } : e
            )
          };
        });
      },

      skipTurn: () => {
        // skipTurn acts exactly like endTurn in Gloomhaven (end of turn effects process normally)
        get().endTurn();
      },

      addSummon: (summonerId, summonData) => {
        const { entities, turnQueue, currentTurnIndex } = get();
        const summoner = entities.find(e => e.id === summonerId);
        if (!summoner) return;

        const existingSummons = entities.filter(e => e.summonerId === summonerId);
        const summonIndex = existingSummons.length;

        const newSummon = {
          id: `summon-${Date.now()}`,
          type: 'summon',
          summonerId: summonerId,
          summonIndex: summonIndex,
          initiative: summoner.initiative,
          hasTakenTurn: true, // Do not act the round they are summoned
          isDead: false,
          statuses: [],
          ...summonData
        };

        const updatedEntities = [...entities, newSummon];
        
        let newQueue = [...turnQueue];
        const summonerQueueIdx = newQueue.findIndex(e => e.id === summonerId);
        let newCurrentTurnIndex = currentTurnIndex;

        if (summonerQueueIdx !== -1) {
           newQueue.splice(summonerQueueIdx, 0, newSummon);
           if (summonerQueueIdx <= currentTurnIndex) {
              newCurrentTurnIndex++;
           }
        } else {
           newQueue.push(newSummon);
        }

        set({ entities: updatedEntities, turnQueue: newQueue, currentTurnIndex: newCurrentTurnIndex });
      },

      // Spawn entity mid-combat and inject into queue after current index
      spawnEntity: (entity) => {
        const { currentTurnIndex, turnQueue, entities } = get();
        const newEntity = {
          id: `${entity.monsterType || 'spawned'}-${Date.now()}`,
          hasTakenTurn: false,
          isDead: false,
          statuses: [],
          ...entity,
        };
        const updatedEntities = [...entities, newEntity];
        // Insert into queue: find position after current index, respecting initiative
        const newQueue = [...turnQueue];
        // Find where to insert: after current, in initiative order
        let insertAt = currentTurnIndex + 1;
        while (
          insertAt < newQueue.length &&
          newQueue[insertAt].initiative <= newEntity.initiative
        ) {
          insertAt++;
        }
        newQueue.splice(insertAt, 0, newEntity);
        set({ entities: updatedEntities, turnQueue: newQueue });
      },

      // HP
      updateHp: (entityId, delta) =>
        set((s) => {
          const updated = s.entities.map((e) => {
            if (e.id !== entityId) return e;
            const newHp = Math.max(0, Math.min(e.maxHp, e.hp + delta));
            return { ...e, hp: newHp, isDead: newHp <= 0 };
          });
          
          const deadIds = updated.filter(e => e.isDead).map(e => e.id);
          return {
            entities: updated.map(e => 
              (e.summonerId && deadIds.includes(e.summonerId)) ? { ...e, hp: 0, isDead: true } : e
            )
          };
        }),

      // Statuses — no stacking
      applyStatus: (entityId, status) =>
        set((s) => {
          const currentEntityId = s.turnQueue[s.currentTurnIndex]?.id;
          const isCurrentTurn = entityId === currentEntityId;
          
          return {
            entities: s.entities.map((e) => {
              if (e.id !== entityId) return e;
              const existing = e.statuses.find((st) => st.id === status.id);
              if (existing) return e; // no stack
              return { 
                ...e, 
                statuses: [...e.statuses, {
                  ...status,
                  expireAtEndOfTurns: isCurrentTurn ? 2 : 1
                }] 
              };
            }),
          };
        }),

      removeStatus: (entityId, statusId) =>
        set((s) => ({
          entities: s.entities.map((e) =>
            e.id === entityId
              ? { ...e, statuses: e.statuses.filter((st) => st.id !== statusId) }
              : e
          ),
        })),

      healEntity: (entityId, amount) =>
        set((s) => ({
          entities: s.entities.map((e) => {
            if (e.id !== entityId) return e;
            const newHp = Math.min(e.maxHp, e.hp + amount);
            // Remove heal-clearable statuses
            const newStatuses = e.statuses.filter((st) => st.removeOn !== 'heal');
            return { ...e, hp: newHp, statuses: newStatuses };
          }),
        })),

      killEntity: (entityId) =>
        set((s) => ({
          entities: s.entities.map((e) =>
            (e.id === entityId || e.summonerId === entityId) ? { ...e, hp: 0, isDead: true } : e
          ),
        })),

      // Elements
      setElement: (elementId, state) =>
        set((s) => ({ elements: { ...s.elements, [elementId]: state } })),

      consumeElement: (elementId) =>
        set((s) => ({ elements: { ...s.elements, [elementId]: 'inert' } })),

      infuseElement: (elementId) =>
        set((s) => ({ elements: { ...s.elements, [elementId]: 'strong' } })),

      // Computed helpers (not state)
      getCurrentEntity: () => {
        const { turnQueue, currentTurnIndex } = get();
        return turnQueue[currentTurnIndex] || null;
      },

      isRoundOver: () => {
        const { turnQueue, currentTurnIndex } = get();
        return currentTurnIndex >= turnQueue.length;
      },
    }),
    {
      name: 'gloom-tracker-state',
      version: 1,
    }
  )
);

export default useGameStore;
