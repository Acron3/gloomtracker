/**
 * MonsterIcon — renders the appropriate lucide-react icon for a given monster icon key.
 * The `icon` prop is a string matching a lucide icon name (e.g. "Skull", "Sword").
 * Falls back to <Skull> if the icon is not found.
 */
import {
  Skull, Sword, Swords, Crosshair, Shield, ShieldAlert, Target, Ghost,
  Zap, PawPrint, TreePine, Snowflake, Flame, FlameKindling, Mountain,
  Moon, Wind, Axe, Wand, Wand2, Droplets, Droplet, Eye, Dog, Bird, Bug,
  Sun, ShieldCheck, Bomb, Rat, Waves, Crown, Bot, CloudMoon, Sparkles,
  Wheat, Cylinder,
} from 'lucide-react';

const ICON_MAP = {
  Skull, Sword, Swords, Crosshair, Shield, ShieldAlert, Target, Ghost,
  Zap, PawPrint, TreePine, Snowflake, Flame, FlameKindling, Mountain,
  Moon, Wind, Axe, Wand, Wand2, Droplets, Droplet, Eye, Dog, Bird, Bug,
  Sun, ShieldCheck, Bomb, Rat, Waves, Crown, Bot, CloudMoon, Sparkles,
  Wheat, Cylinder,
};

export const ICON_KEYS = new Set(Object.keys(ICON_MAP));

export default function MonsterIcon({ icon, className = 'w-5 h-5', style }) {
  const Component = ICON_MAP[icon] ?? Skull;
  return <Component className={className} style={style} />;
}
