import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, DoorOpen, ChevronRight } from 'lucide-react';
import MonsterIcon from './MonsterIcon';
import monstersData from '../data/monsters.json';
import scenariosData from '../data/scenarios.json';
import useGameStore from '../store/gameStore';

const regularMonsters = monstersData.filter((m) => !m.isBoss);
const bossMonsters = monstersData.filter((m) => m.isBoss);

export default function SpawnModal({ onClose }) {
  const scenarioLevel = useGameStore((s) => s.scenarioLevel);
  const spawnEntity = useGameStore((s) => s.spawnEntity);
  const entities = useGameStore((s) => s.entities);
  const selectedScenario = useGameStore((s) => s.selectedScenario);

  // --- tab: 'regular' | 'boss' | 'room'
  const [tab, setTab] = useState('regular');
  const [selected, setSelected] = useState(null);
  const [normalCount, setNormalCount] = useState(0);
  const [eliteCount, setEliteCount] = useState(0);
  const [customInitiative, setCustomInitiative] = useState(99);
  const [search, setSearch] = useState('');

  // ── Room Spawn state ────────────────────────────
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Dapatkan spawnRooms dari scenario aktif
  const currentScenarioData = scenariosData.find((sc) => sc.id === selectedScenario);
  const spawnRooms = currentScenarioData?.spawnRooms || [];

  // Player count dari entities
  const playerCount = Math.max(2, Math.min(4, entities.filter((e) => e.type === 'player').length || 2));

  const getStats = (m, elite) => {
    const lvl = String(Math.min(scenarioLevel, 7));
    return m.levels[lvl]?.[elite ? 'elite' : 'normal'] || m.levels['1']?.[elite ? 'elite' : 'normal'];
  };

  // ── Manual spawn (tab regular/boss) ──────────────
  const sourceList = tab === 'boss' ? bossMonsters : regularMonsters;
  const filtered = sourceList.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const existingMonsters = selected
    ? entities.filter((e) => e.type === 'monster' && e.monsterType === selected.id && !e.isDead)
    : [];
  const inUseStandees = existingMonsters.map((e) => e.standeeNumber);
  const existingInitiative = existingMonsters.length > 0 ? existingMonsters[0].initiative : null;

  const handleSpawn = () => {
    if (!selected || (normalCount === 0 && eliteCount === 0)) return;

    let inUse = [...inUseStandees];
    const finalInitiative = existingInitiative !== null ? existingInitiative : customInitiative;

    const spawnOne = (isElite) => {
      const stats = getStats(selected, isElite);
      let standeeNum = 1;
      while (inUse.includes(standeeNum)) standeeNum++;
      inUse.push(standeeNum);

      spawnEntity({
        type: 'monster',
        monsterType: selected.id,
        monsterName: selected.name,
        name: `${selected.name} ${isElite ? 'E' : ''}#${standeeNum}`,
        icon: selected.icon,
        standeeNumber: standeeNum,
        isElite,
        isBoss: selected.isBoss,
        initiative: finalInitiative,
        hp: stats.hp,
        maxHp: stats.hp,
      });
    };

    for (let i = 0; i < eliteCount; i++) spawnOne(true);
    for (let i = 0; i < normalCount; i++) spawnOne(false);
    onClose();
  };

  // ── Room Spawn (tab room) ─────────────────────────
  const handleRoomSpawn = (room) => {
    const pKey = String(playerCount);
    for (const rm of room.monsters) {
      const mData = monstersData.find((x) => x.id === rm.monsterId);
      if (!mData) continue;

      const counts = rm.counts?.[pKey] || { normal: 0, elite: 0 };
      const existingGroup = entities.filter(
        (e) => e.type === 'monster' && e.monsterType === mData.id && !e.isDead
      );
      const inUse = existingGroup.map((e) => e.standeeNumber);
      const initiative =
        existingGroup.length > 0 ? existingGroup[0].initiative : 99;

      const spawnOne = (isElite) => {
        const stats = getStats(mData, isElite);
        let standeeNum = 1;
        while (inUse.includes(standeeNum)) standeeNum++;
        inUse.push(standeeNum);

        spawnEntity({
          type: 'monster',
          monsterType: mData.id,
          monsterName: mData.name,
          name: `${mData.name} ${isElite ? 'E' : ''}#${standeeNum}`,
          icon: mData.icon,
          standeeNumber: standeeNum,
          isElite,
          isBoss: mData.isBoss,
          initiative,
          hp: stats.hp,
          maxHp: stats.hp,
        });
      };

      for (let i = 0; i < counts.elite; i++) spawnOne(true);
      for (let i = 0; i < counts.normal; i++) spawnOne(false);
    }
    onClose();
  };

  // ── Helpers ──────────────────────────────────────
  const getRoomLabel = (roomNum) => {
    if (roomNum === 2) return 'Room 2';
    if (roomNum === 3) return 'Room 3';
    return `Room ${roomNum}`;
  };

  const getRoomMonsterSummary = (room) => {
    const pKey = String(playerCount);
    return room.monsters
      .map((rm) => {
        const mData = monstersData.find((x) => x.id === rm.monsterId);
        const c = rm.counts?.[pKey] || { normal: 0, elite: 0 };
        const parts = [];
        if (c.elite > 0) parts.push(`${c.elite}E`);
        if (c.normal > 0) parts.push(`${c.normal}N`);
        return `${mData?.name || rm.monsterId} (${parts.join('+') || '0'})`;
      })
      .join(', ');
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
        className="w-full max-w-lg glass border-t border-[#2e3850] rounded-t-2xl p-5
                   flex flex-col max-h-[85dvh]"
      >
        <div className="w-10 h-1 rounded-full bg-[#2e3850] mx-auto mb-4" />
        <h3 className="text-base font-bold text-gray-200 mb-3 font-display">Spawn Monster</h3>

        {/* Tab toggle */}
        <div className="flex gap-1 bg-[#0f1219] rounded-xl p-1 mb-3">
          <button
            onClick={() => { setTab('regular'); setSelected(null); setSelectedRoom(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'regular'
                ? 'bg-blood/80 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Monsters
          </button>
          <button
            onClick={() => { setTab('boss'); setSelected(null); setSelectedRoom(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              tab === 'boss'
                ? 'bg-gold text-black'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Crown className="w-3 h-3" /> Boss
          </button>
          {spawnRooms.length > 0 && (
            <button
              onClick={() => { setTab('room'); setSelected(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                tab === 'room'
                  ? 'bg-[#3b82f6] text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <DoorOpen className="w-3 h-3" /> Rooms
            </button>
          )}
        </div>

        {/* ── ROOM SPAWN TAB ── */}
        {tab === 'room' && (
          <div className="overflow-y-auto flex-1 flex flex-col gap-2 mb-3 custom-scrollbar">
            <p className="text-xs text-gray-500 italic mb-1">
              Tap a room to spawn all its monsters for {playerCount} players.
            </p>
            {spawnRooms.map((room) => {
              const pKey = String(playerCount);
              const totalCount = room.monsters.reduce((sum, rm) => {
                const c = rm.counts?.[pKey] || { normal: 0, elite: 0 };
                return sum + c.normal + c.elite;
              }, 0);

              return (
                <button
                  key={room.roomNumber}
                  onClick={() => setSelectedRoom(selectedRoom?.roomNumber === room.roomNumber ? null : room)}
                  className={`flex flex-col gap-2 p-3 rounded-xl border text-left transition-all
                    touch-manipulation active:scale-[0.98]
                    ${selectedRoom?.roomNumber === room.roomNumber
                      ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                      : 'border-[#2e3850] bg-[#161b25]'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#3b82f6]/20 border border-[#3b82f6]/40">
                        <DoorOpen className="w-3.5 h-3.5 text-[#3b82f6]" />
                      </span>
                      <span className="text-sm font-bold text-gray-200">
                        {getRoomLabel(room.roomNumber)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{totalCount} standees</span>
                  </div>

                  {/* Monster list inside room */}
                  <div className="flex flex-col gap-1 pl-9">
                    {room.monsters.map((rm) => {
                      const mData = monstersData.find((x) => x.id === rm.monsterId);
                      const c = rm.counts?.[pKey] || { normal: 0, elite: 0 };
                      return (
                        <div key={rm.monsterId} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            {mData && (
                              <MonsterIcon
                                icon={mData.icon}
                                className="w-3 h-3 text-blood-light/70"
                              />
                            )}
                            <span>{mData?.name || rm.monsterId}</span>
                          </div>
                          <div className="flex gap-1.5">
                            {c.elite > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-[#c9a84c]/20 text-[#c9a84c] font-mono font-bold">
                                {c.elite}E
                              </span>
                            )}
                            {c.normal > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-300 font-mono font-bold">
                                {c.normal}N
                              </span>
                            )}
                            {c.elite === 0 && c.normal === 0 && (
                              <span className="text-gray-600">—</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── MANUAL MONSTER / BOSS TAB ── */}
        {(tab === 'regular' || tab === 'boss') && (
          <>
            {/* Search */}
            <input
              type="text"
              placeholder="Search monster…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1e2535] border border-[#2e3850]
                         text-sm text-gray-200 placeholder-gray-600 outline-none mb-3"
            />

            {/* Monster list */}
            <div className="overflow-y-auto flex-1 flex flex-col gap-1.5 mb-3 custom-scrollbar">
              {filtered.length === 0 && (
                <p className="text-center text-xs text-gray-600 py-8 italic">No monsters found.</p>
              )}
              {filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm
                    transition-all touch-manipulation active:scale-[0.98]
                    ${selected?.id === m.id
                      ? m.isBoss
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]'
                      : 'border-[#2e3850] bg-[#161b25] text-gray-300'}`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border
                    ${m.isBoss
                      ? selected?.id === m.id ? 'bg-gold/20 border-gold/40' : 'bg-gold/10 border-gold/20'
                      : 'bg-[#1e2535] border-[#2e3850]'}`}>
                    <MonsterIcon
                      icon={m.icon}
                      className={`w-4 h-4 ${selected?.id === m.id ? (m.isBoss ? 'text-gold' : 'text-gold') : m.isBoss ? 'text-gold/60' : 'text-blood-light'}`}
                    />
                  </span>
                  <span className="font-medium flex-1">{m.name}</span>
                  {m.isBoss && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gold/20 text-gold border border-gold/30 flex-shrink-0">
                      BOSS
                    </span>
                  )}
                </button>
              ))}
            </div>

            {selected && (
              <div className="flex flex-col gap-3 mb-4">
                {!selected.isBoss && (
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center justify-between p-2 px-3 rounded-xl bg-[#1e2535] border border-[#2e3850]">
                      <span className="text-xs text-gray-400 font-medium">Normal</span>
                      <input
                        type="number" min={0} max={20} value={normalCount}
                        onChange={(e) => setNormalCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 bg-transparent text-right text-white font-mono text-sm outline-none"
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-between p-2 px-3 rounded-xl bg-[#1e2535] border border-[#c9a84c]/50">
                      <span className="text-xs text-[#c9a84c] font-medium">Elite</span>
                      <input
                        type="number" min={0} max={20} value={eliteCount}
                        onChange={(e) => setEliteCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 bg-transparent text-right text-[#c9a84c] font-mono text-sm outline-none"
                      />
                    </div>
                  </div>
                )}
                {selected.isBoss && (
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center justify-between p-2 px-3 rounded-xl bg-gold/10 border border-gold/40">
                      <span className="text-xs text-gold font-medium flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Count
                      </span>
                      <input
                        type="number" min={0} max={4} value={normalCount}
                        onChange={(e) => setNormalCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 bg-transparent text-right text-gold font-mono text-sm outline-none"
                      />
                    </div>
                  </div>
                )}
                <div className={`flex items-center justify-between p-2 px-3 rounded-xl border ${existingInitiative !== null ? 'bg-black/40 border-[#2e3850]/50 opacity-60' : 'bg-[#1e2535] border-[#2e3850]'}`}>
                  <span className="text-xs text-gray-400 font-medium">
                    Initiative {existingInitiative !== null && '(Inherited)'}
                  </span>
                  <input
                    type="number" min={1} max={99}
                    value={existingInitiative !== null ? existingInitiative : customInitiative}
                    onChange={(e) => setCustomInitiative(Math.max(1, Math.min(99, parseInt(e.target.value) || 99)))}
                    disabled={existingInitiative !== null}
                    className="w-12 bg-transparent text-right text-white font-mono text-sm outline-none disabled:text-gray-500"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ACTION BUTTON ── */}
        {tab === 'room' ? (
          <button
            onClick={() => selectedRoom && handleRoomSpawn(selectedRoom)}
            disabled={!selectedRoom}
            className="w-full py-3.5 rounded-xl text-sm font-bold transition-all
                       touch-manipulation active:scale-95 flex items-center justify-center gap-2
                       disabled:opacity-40 disabled:cursor-not-allowed
                       bg-[#3b82f6] text-white"
          >
            <DoorOpen className="w-4 h-4" />
            {selectedRoom
              ? `Spawn ${getRoomLabel(selectedRoom.roomNumber)}`
              : 'Select a Room'}
            {selectedRoom && <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <button
            onClick={handleSpawn}
            disabled={!selected || (normalCount === 0 && eliteCount === 0)}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all
                       touch-manipulation active:scale-95
                       disabled:opacity-40 disabled:cursor-not-allowed
                       ${selected?.isBoss
                         ? 'bg-gold text-black glow-gold'
                         : 'bg-[#c9a84c] text-black glow-gold'}`}
          >
            {selected?.isBoss ? '👑 ' : ''}Spawn {selected ? selected.name : '…'}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
