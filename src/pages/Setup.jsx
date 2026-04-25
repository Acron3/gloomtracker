import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users, Ghost, Swords, Crown } from 'lucide-react';
import MonsterIcon from '../components/MonsterIcon';
import PWAInstallBanner from '../components/PWAInstallBanner';
import monstersData from '../data/monsters.json';
import charactersData from '../data/characters.json';
import scenariosData from '../data/scenarios.json';
import useGameStore from '../store/gameStore';
import ComboBox from '../components/ComboBox';

function PlayerSetupCard({ onAdd }) {
  const [selectedId, setSelectedId] = useState('');
  const [level, setLevel] = useState(1);
  const [name, setName] = useState('');

  const selected = charactersData.find((c) => c.id === selectedId) || null;

  const add = () => {
    if (!selected) return;
    const hp = selected.maxHp[level - 1] || selected.maxHp[0];
    onAdd({
      type: 'player',
      characterId: selected.id,
      name: name.trim() || selected.name,
      icon: selected.icon,
      color: selected.color,
      initiative: 99,
      hp, maxHp: hp,
    });
    setSelectedId('');
    setName('');
    setLevel(1);
  };

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-4 relative z-30">
      <div className="flex items-center gap-2 mb-1">
        <Users className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-bold text-gray-300 font-display">Add Player</h3>
      </div>

      <ComboBox
        options={charactersData}
        value={selectedId}
        onChange={setSelectedId}
        placeholder="Select character class..."
        icon={<Users className="w-4 h-4" />}
      />

      {selected && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                          bg-gold/10 border border-gold/30">
            <span className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-2xl">
              {selected.icon || <Users className="w-5 h-5 text-gold" />}
            </span>
            <div>
              <p className="text-sm font-semibold text-gold">{selected.name}</p>
              <p className="text-[11px] text-gray-500">{selected.expansion}</p>
            </div>
            <div className="ml-auto text-xs text-gray-500">
              Base HP: <span className="text-white font-mono">{selected.maxHp[level - 1]}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Name (${selected.name})`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-void/50 border border-border/50
                         text-sm text-gray-200 placeholder-gray-600 outline-none
                         focus:border-gold/60 transition-colors"
            />
            
            <div className="relative w-28">
              <select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-void/50 border border-border/50
                           text-sm text-gray-200 outline-none appearance-none cursor-pointer
                           focus:border-gold/60 transition-colors"
              >
                {[1,2,3,4,5,6,7,8,9].map((l) => (
                  <option key={l} value={l} className="bg-void text-gray-200">Lvl {l}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">▼</span>
            </div>

            <button
              onClick={add}
              className="px-6 rounded-xl bg-gold text-black text-sm
                         font-bold active:scale-95 transition-transform touch-manipulation shadow-lg shadow-gold/20"
            >Add</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

const regularMonsters = monstersData.filter((m) => !m.isBoss);
const bossMonsters = monstersData.filter((m) => m.isBoss);

function MonsterSetupCard({ onAdd, scenarioLevel }) {
  const [selectedId, setSelectedId] = useState('');
  const [normal, setNormal] = useState(1);
  const [elite, setElite] = useState(0);
  const [tab, setTab] = useState('regular');

  const sourceList = tab === 'boss' ? bossMonsters : regularMonsters;
  const selected = sourceList.find((m) => m.id === selectedId) || null;

  const getStats = (m, type) => {
    const lvl = String(Math.min(scenarioLevel, 7));
    return m.levels[lvl]?.[type] || m.levels['1']?.[type];
  };

  const add = () => {
    if (!selected) return;
    const ns = getStats(selected, 'normal');
    const es = getStats(selected, 'elite');
    onAdd({
      monsterId: selected.id,
      monsterName: selected.name,
      icon: selected.icon,
      isBoss: selected.isBoss,
      normalCount: selected.isBoss ? normal : normal,
      eliteCount: selected.isBoss ? 0 : elite,
      normalHp: ns.hp,
      eliteHp: es.hp,
    });
    setSelectedId('');
    setNormal(selected.isBoss ? 1 : 1);
    setElite(0);
  };

  const ns = selected ? getStats(selected, 'normal') : null;
  const es = selected ? getStats(selected, 'elite') : null;

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-4 relative z-20">
      <div className="flex items-center gap-2 mb-1">
        <Ghost className="w-4 h-4 text-blood-light" />
        <h3 className="text-sm font-bold text-gray-300 font-display">Add Monster Group</h3>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-[#0f1219] rounded-xl p-1">
        <button
          onClick={() => { setTab('regular'); setSelectedId(''); }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            tab === 'regular' ? 'bg-blood/80 text-white' : 'text-gray-500'
          }`}
        >
          Monsters
        </button>
        <button
          onClick={() => { setTab('boss'); setSelectedId(''); }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            tab === 'boss' ? 'bg-gold text-black' : 'text-gray-500'
          }`}
        >
          <Crown className="w-3 h-3" /> Boss
        </button>
      </div>

      <ComboBox
        options={sourceList}
        value={selectedId}
        onChange={setSelectedId}
        placeholder={tab === 'boss' ? 'Select boss...' : 'Select monster type...'}
        icon={tab === 'boss' ? <Crown className="w-4 h-4" /> : <Ghost className="w-4 h-4" />}
      />

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
            selected.isBoss ? 'bg-gold/10 border border-gold/30' : 'bg-blood/10 border border-blood/30'
          }`}>
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              selected.isBoss ? 'bg-gold/20' : 'bg-blood/20'
            }`}>
              <MonsterIcon icon={selected.icon} className={`w-5 h-5 ${selected.isBoss ? 'text-gold' : 'text-blood-light'}`} />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${selected.isBoss ? 'text-gold' : 'text-blood-light'}`}>{selected.name}</p>
                {selected.isBoss && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gold/20 text-gold border border-gold/30">BOSS</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                Lvl {scenarioLevel}: <span className="text-white font-mono">{ns?.hp}</span> HP
                {!selected.isBoss && <> (N) / <span className="text-gold font-mono">{es?.hp}</span> HP (E)</>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!selected.isBoss && (
              <>
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl
                                bg-void/50 border border-border/50">
                  <span className="text-xs text-gray-500 whitespace-nowrap">Normal</span>
                  <input
                    type="number" min={0} max={20} value={normal}
                    onChange={(e) => setNormal(Number(e.target.value))}
                    className="flex-1 w-0 bg-transparent text-center text-white text-sm font-mono outline-none"
                  />
                </div>
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl
                                bg-gold/10 border border-gold/40">
                  <span className="text-xs text-gold whitespace-nowrap">Elite</span>
                  <input
                    type="number" min={0} max={20} value={elite}
                    onChange={(e) => setElite(Number(e.target.value))}
                    className="flex-1 w-0 bg-transparent text-center text-gold text-sm font-mono outline-none"
                  />
                </div>
              </>
            )}
            {selected.isBoss && (
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-gold/10 border border-gold/40">
                <Crown className="w-3 h-3 text-gold" />
                <span className="text-xs text-gold whitespace-nowrap">Count</span>
                <input
                  type="number" min={1} max={4} value={normal}
                  onChange={(e) => setNormal(Number(e.target.value))}
                  className="flex-1 w-0 bg-transparent text-center text-gold text-sm font-mono outline-none"
                />
              </div>
            )}
            <button
              onClick={add}
              className="px-6 py-3 rounded-xl bg-gold text-black text-sm
                         font-bold active:scale-95 transition-transform touch-manipulation shadow-lg shadow-gold/20"
            >Add</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function Setup() {
  const addPlayer = useGameStore((s) => s.addPlayer);
  const addMonsterGroup = useGameStore((s) => s.addMonsterGroup);
  const entities = useGameStore((s) => s.entities);
  const removeEntity = useGameStore((s) => s.removeEntity);
  const startCombat = useGameStore((s) => s.startCombat);
  const setScenarioLevel = useGameStore((s) => s.setScenarioLevel);
  const scenarioLevel = useGameStore((s) => s.scenarioLevel);
  const resetSetup = useGameStore((s) => s.resetSetup);
  const selectedScenario = useGameStore((s) => s.selectedScenario);
  const loadScenarioTemplate = useGameStore((s) => s.loadScenarioTemplate);

  const players = entities.filter((e) => e.type === 'player');
  const monsterTypes = [...new Set(
    entities.filter((e) => e.type === 'monster').map((e) => e.monsterType)
  )];

  const canStart = entities.length >= 1;

  return (
    <div className="flex flex-col min-h-dvh bg-void overflow-x-hidden">
      {/* Header */}
      <div className="px-4 pt-safe pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 text-gold" />
            <h1 className="text-2xl font-bold text-gold font-display tracking-tight">
              Gloom Tracker
            </h1>
          </div>
          <button onClick={resetSetup}
            className="text-[10px] text-gray-500 hover:text-gray-300 uppercase tracking-widest px-2 py-1 rounded-lg border border-border/40 transition-colors">
            Reset All
          </button>
        </div>
        <p className="text-xs text-gray-600 ml-1">Combat Assistant · Campaign Setup</p>

        {/* Scenario level */}
        <div className="mt-6">
          <label className="text-xs font-medium text-gray-500 ml-1 mb-2 block">Scenario Level</label>
          <div className="flex gap-2 glass-light p-1 rounded-2xl border border-border/30">
            {[0,1,2,3,4,5,6,7].map((l) => (
              <button key={l} onClick={() => setScenarioLevel(l)}
                className={`flex-1 aspect-square rounded-xl text-sm font-bold transition-all
                  touch-manipulation active:scale-90 flex items-center justify-center
                  ${scenarioLevel === l
                    ? 'bg-gold text-black shadow-lg shadow-gold/20'
                    : 'bg-void/40 text-gray-500 hover:text-gray-300'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Template */}
        <div className="mt-4">
          <label className="text-xs font-medium text-gray-500 ml-1 mb-2 block">Scenario Template</label>
          <div className="relative">
            <select
              value={selectedScenario}
              onChange={(e) => loadScenarioTemplate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-void/50 border border-border/50
                         text-sm text-gray-200 outline-none appearance-none cursor-pointer
                         focus:border-gold/60 transition-colors"
            >
              {scenariosData.map(sc => (
                <option key={sc.id} value={sc.id} className="bg-void text-gray-200">{sc.name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">▼</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32 flex flex-col gap-6 pt-2">
        {/* Current entities */}
        <AnimatePresence>
          {entities.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl p-4 flex flex-col gap-3"
            >
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Current Encounter</h3>

              {/* Players */}
              <div className="flex flex-col gap-2">
                {players.map((p) => (
                  <motion.div 
                    layout
                    key={p.id} 
                    className="flex items-center gap-3 p-3 rounded-xl bg-void/60 border border-border/40"
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-200 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-600">Level {p.level || 1}</p>
                    </div>
                    <button onClick={() => removeEntity(p.id)}
                      className="p-1 text-gray-600 hover:text-blood-light transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                {/* Monster groups */}
                {monsterTypes.map((mt) => {
                  const group = entities.filter((e) => e.monsterType === mt);
                  const first = group[0];
                  const isBoss = first.isBoss;
                  return (
                    <motion.div
                      layout
                      key={mt}
                      className={`p-3 rounded-xl border ${
                        isBoss
                          ? 'bg-gold/5 border-gold/20'
                          : 'bg-void/60 border-border/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isBoss ? 'bg-gold/20' : 'bg-blood/20'
                        }`}>
                          <MonsterIcon icon={first.icon} className={`w-5 h-5 ${isBoss ? 'text-gold' : 'text-blood-light'}`} />
                        </span>
                        <span className="flex-1 text-sm font-semibold text-gray-200 truncate">
                          {first.monsterName}
                        </span>
                        {isBoss && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gold/20 text-gold border border-gold/30">BOSS</span>
                        )}
                        <button onClick={() => group.forEach((e) => removeEntity(e.id))}
                          className="p-1 text-gray-600 hover:text-blood-light transition-colors ml-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-11">
                        {group.map((e) => (
                          <span key={e.id}
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter
                              ${e.isElite
                                ? 'bg-gold/20 text-gold border border-gold/30'
                                : isBoss
                                ? 'bg-gold/10 text-gold/70 border border-gold/20'
                                : 'bg-void text-gray-500 border border-border/30'}`}>
                            {e.isElite ? 'Elite' : isBoss ? '👑' : ''}#{e.standeeNumber}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PlayerSetupCard onAdd={addPlayer} />
        <MonsterSetupCard onAdd={addMonsterGroup} scenarioLevel={scenarioLevel} />
      </div>

      {/* Start Combat CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40"
           style={{ background: 'linear-gradient(to top, var(--color-void) 70%, transparent)' }}>
        <PWAInstallBanner />
        <div className="px-4 pb-safe pb-4">
          <button
            onClick={startCombat}
            disabled={!canStart}
            className="w-full py-4 rounded-2xl text-base font-bold transition-all
                       touch-manipulation active:scale-[0.98] disabled:opacity-30
                       bg-gradient-to-r from-blood to-gold text-black
                       disabled:cursor-not-allowed shadow-2xl shadow-gold/20"
          >
            <span className="flex items-center gap-2 justify-center w-full">
              <Swords className="w-4 h-4" /> Start Campaign
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

