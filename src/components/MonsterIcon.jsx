/**
 * MonsterIcon — renders the appropriate lucide-react icon for a given monster icon key.
 * The `icon` prop is a string matching a lucide icon name (e.g. "Skull", "Sword").
 * Falls back to <Skull> if the icon is not found.
 */
import {
  Skull, Sword, Crosshair, Shield, Target, Ghost, Zap, PawPrint,
  TreePine, Snowflake, Flame, Mountain, Moon, Wind, Axe, Wand,
  Droplets, Eye, Dog, Bird, Droplet, Bug, Sun, ShieldCheck, Bomb,
  Wand2, Rat, FlameKindling,
} from 'lucide-react';

const ICON_MAP = {
  Skull, Sword, Crosshair, Shield, Target, Ghost, Zap, PawPrint,
  TreePine, Snowflake, Flame, Mountain, Moon, Wind, Axe, Wand,
  Droplets, Eye, Dog, Bird, Droplet, Bug, Sun, ShieldCheck, Bomb,
  Wand2, Rat, FlameKindling,
};

export const ICON_KEYS = new Set(Object.keys(ICON_MAP));

export default function MonsterIcon({ icon, className = 'w-5 h-5', style }) {
  const Component = ICON_MAP[icon] || Skull;
  return <Component className={className} style={style} />;
}
