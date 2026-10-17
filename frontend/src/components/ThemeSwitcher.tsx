"use client";
import React from 'react';
import { Sparkles, Terminal, Compass, Wind, Volume2, VolumeX } from 'lucide-react';
import styles from './ThemeSwitcher.module.css';

export type CreativeTheme = 'holo' | 'cockpit' | 'synthwave' | 'aero';

interface ThemeSwitcherProps {
  currentTheme: CreativeTheme;
  onThemeChange: (theme: CreativeTheme) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const THEMES: { id: CreativeTheme; label: string; icon: any; color: string }[] = [
  { id: 'holo', label: 'Holo Telemetry', icon: Sparkles, color: '#06b6d4' },
  { id: 'cockpit', label: 'Cyber Cockpit', icon: Terminal, color: '#22c55e' },
  { id: 'synthwave', label: 'Synthwave Grid', icon: Compass, color: '#ec4899' },
  { id: 'aero', label: 'Aero Streamline', icon: Wind, color: '#38bdf8' },
];

export default function ThemeSwitcher({
  currentTheme,
  onThemeChange,
  soundEnabled,
  onToggleSound,
}: ThemeSwitcherProps) {
  return (
    <aside className={styles.dockContainer} aria-label="Creative Aesthetic Themes">
      <div className={styles.themePills}>
        <span className={styles.dockLabel}>Creative View:</span>
        {THEMES.map((theme) => {
          const Icon = theme.icon;
          const isActive = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`${styles.themeBtn} ${isActive ? styles.activeThemeBtn : ''}`}
              style={{
                borderColor: isActive ? theme.color : undefined,
                color: isActive ? '#ffffff' : undefined,
                boxShadow: isActive ? `0 0 16px ${theme.color}40, inset 0 0 8px ${theme.color}25` : undefined,
              }}
              title={`Switch to ${theme.label} aesthetic`}
            >
              <Icon size={14} style={{ color: isActive ? theme.color : '#94a3b8' }} />
              <span>{theme.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onToggleSound}
        className={`${styles.soundBtn} ${soundEnabled ? styles.soundActive : ''}`}
        title={soundEnabled ? 'Mute audio FX' : 'Enable sci-fi telemetry audio FX'}
        aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
      >
        {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
      </button>
    </aside>
  );
}
