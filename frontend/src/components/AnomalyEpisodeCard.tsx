"use client";
import React from 'react';
import { AlertOctagon, AlertTriangle, Clock, Zap } from 'lucide-react';
import styles from './AnomalyEpisodeCard.module.css';

interface EpisodeData {
  episode_id: string;
  episode_number: number;
  start_time: number;
  end_time: number;
  duration_seconds: number;
  record_count: number;
  severity: string;
  peak_confidence: number;
  affected_features: string[];
  peak_metrics: Record<string, number>;
  normal_ranges: Record<string, { min: number; max: number; median: number }>;
}

export default function AnomalyEpisodeCard({ episode }: { episode: EpisodeData }) {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'strong_anomaly':
        return styles.strong;
      case 'consensus_anomaly':
        return styles.consensus;
      default:
        return styles.weak;
    }
  };

  const formatSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'strong_anomaly': return 'Strong Episode';
      case 'consensus_anomaly': return 'Consensus Episode';
      default: return 'Weak Episode';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.episodeBadge}>{episode.episode_id}</span>
          <span className={styles.duration}>
            <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
            {episode.duration_seconds}s ({episode.record_count} records)
          </span>
        </div>
        <span className={`${styles.badge} ${getSeverityStyle(episode.severity)}`}>
          {formatSeverityLabel(episode.severity)}
        </span>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Peak Confidence</span>
          <span className={styles.statValue} style={{ color: episode.peak_confidence > 85 ? '#ef4444' : '#f59e0b' }}>
            {episode.peak_confidence}%
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Start Time</span>
          <span className={styles.statValue}>{episode.start_time}s</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>End Time</span>
          <span className={styles.statValue}>{episode.end_time}s</span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
          Affected Metrics
        </div>
        <div className={styles.featuresList}>
          {episode.affected_features.map((feat) => (
            <span key={feat} className={styles.featureTag}>
              {feat.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {Object.keys(episode.peak_metrics).length > 0 && (
        <div className={styles.peaksSection}>
          {Object.entries(episode.peak_metrics).map(([feat, val]) => {
            const range = episode.normal_ranges?.[feat];
            return (
              <div key={feat} className={styles.peakRow}>
                <span className={styles.peakName}>{feat.replace('_', ' ').toUpperCase()} Peak:</span>
                <div>
                  <span className={styles.peakValue}>{val}</span>
                  {range && (
                    <span className={styles.normalRange}>
                      (Norm: {range.min}–{range.max})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
