'use client';

import { useTheme } from '@/lib/theme-provider';
import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeToggle({ onDarkBackground = false }: { onDarkBackground?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  function toggle() {
    setTheme(isDark ? 'light' : 'dark');
  }

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="p-2 rounded-[8px] transition-all duration-200"
        style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--txt-sub)', opacity: 0 }}
      >
        <span className="block w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={[
        'p-2 rounded-[8px] transition-all duration-200',
        'hover:scale-110 active:scale-95',
        onDarkBackground
          ? 'hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400'
          : 'hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400',
      ].join(' ')}
      style={{
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        color: onDarkBackground ? 'rgba(248,250,252,0.80)' : 'var(--txt-sub)',
      }}
    >
      <span
        className="block transition-transform duration-300"
        style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(40deg)' }}
      >
        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </span>
    </button>
  );
}
