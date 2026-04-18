import './index.css';
import useGameStore from './store/gameStore';
import Setup from './pages/Setup';
import Combat from './pages/Combat';

export default function App() {
  const phase = useGameStore((s) => s.phase);
  return phase === 'setup' ? <Setup /> : <Combat />;
}
