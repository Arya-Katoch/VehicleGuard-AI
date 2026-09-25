"use client";
import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function HealthScore({ score }: { score: number }) {
  let color = 'var(--success-color)';
  let Icon = ShieldCheck;
  let status = 'Healthy';

  if (score < 50) {
    color = 'var(--danger-color)';
    Icon = ShieldAlert;
    status = 'Critical';
  } else if (score < 80) {
    color = 'var(--warning-color)';
    Icon = Shield;
    status = 'Warning';
  }

  return (
    <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>{Math.round(score)}</span>
        </div>
      </div>
      <div>
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Vehicle Health</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <Icon color={color} size={24} className={score < 50 ? 'alert-pulse' : ''} />
          <span style={{ fontSize: '1.5rem', fontWeight: 600, color }}>{status}</span>
        </div>
      </div>
    </div>
  );
}
