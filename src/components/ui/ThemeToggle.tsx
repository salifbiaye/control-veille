'use client';

import { useTheme } from '@/lib/theme-provider';
import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeToggle({ onDarkBackground = true }: { onDarkBackground?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Éviter le mismatch d'hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  function toggle() {
    setTheme(isDark ? 'light' : 'dark');
  }

  const border = onDarkBackground
    ? 'rgba(255,255,255,0.12)'
    : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)');
  const bg = onDarkBackground
    ? 'rgba(255,255,255,0.07)'
    : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)');
  const color = onDarkBackground
    ? 'rgba(248,250,252,0.80)'
    : (isDark ? 'rgba(248,250,252,0.80)' : 'rgba(15,15,26,0.70)');

  // Rendu par défaut pendant l'hydration
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="p-2 rounded-[8px] transition-all duration-200"
        style={{ border: `1px solid ${border}`, background: bg, color, opacity: 0 }}
      >
        <span className="block w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-[8px] transition-all duration-200"
      style={{ border: `1px solid ${border}`, background: bg, color }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.18)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.40)';
        (e.currentTarget as HTMLElement).style.color = '#A78BFA';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = bg;
        (e.currentTarget as HTMLElement).style.borderColor = border;
        (e.currentTarget as HTMLElement).style.color = color;
      }}
    >
      <span className="block transition-transform duration-300" style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(30deg)' }}>
        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </span>
    </button>
  );
}
