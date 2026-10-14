"use client";
import React from 'react';
import { Brain, Layers, Check, X, ShieldAlert, Sparkles } from 'lucide-react';
import AnomalyEpisodeCard from './AnomalyEpisodeCard';
import styles from './AnomalyIntelligence.module.css';

interface ContributingFeature {
  feature: string;
  percentage: number;
  z_score: number;
  value: number;
}

interface AnomalyIntelligenceItem {
  anomaly_id: string;
  timestamp: number | string;
  severity: string;
  confidence: number;
  primary_feature: string;
  z_score: number;
  votes: number;
  model_agreement: {
    isolation_forest: boolean;
    lof: boolean;
    ocsvm: boolean;
  };
  contributing_features: ContributingFeature[];
  explanation: {
    feature?: string;
    z_score?: number;
    reason?: string;
  };
}

export default function AnomalyIntelligence({
  anomalies,
  episodes
}: {
  anomalies: AnomalyIntelligenceItem[];
  episodes: any[];
}) {
  const getSevClass = (severity: string) => {
    switch (severity) {
      case 'strong_anomaly': return styles.strong;
      case 'consensus_anomaly': return styles.consensus;
      default: return styles.weak;
    }
  };

  const getSevLabel = (severity: string) => {
    switch (severity) {
      case 'strong_anomaly': return 'Strong Anomaly';
      case 'consensus_anomaly': return 'Consensus Anomaly';
      default: return 'Weak Anomaly';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2><Brain className="text-gradient" size={28} /> Anomaly Intelligence & Root-Cause Analysis</h2>
          <p className={styles.subtitle}>
            Multi-model consensus agreement, confidence calculation, feature contribution weights, and data-driven explanations.
          </p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Panel: Recent Detected Anomaly Events */}
        <div className={`glass-panel ${styles.panel}`}>
          <div className={styles.panelTitle}>
            <ShieldAlert size={20} color="#ef4444" />
            Detected Anomaly Events ({anomalies.length})
          </div>

          <div className={styles.cardList}>
            {anomalies.length === 0 ? (
              <p className={styles.emptyMsg}>No anomaly events detected in telemetry stream.</p>
            ) : (
              anomalies.map((anom) => (
                <div key={anom.anomaly_id || Math.random().toString()} className={styles.anomalyCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleGroup}>
                      <span className={`${styles.sevBadge} ${getSevClass(anom.severity)}`}>
                        {getSevLabel(anom.severity)}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Timestamp: {anom.timestamp}s
                      </span>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className={styles.confidenceMeter}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Confidence:
                    </span>
                    <div className={styles.confBar}>
                      <div
                        className={styles.confFill}
                        style={{
                          width: `${anom.confidence}%`,
                          backgroundColor: anom.confidence >= 85 ? '#ef4444' : anom.confidence >= 65 ? '#f59e0b' : '#3b82f6'
                        }}
                      />
                    </div>
                    <span
                      className={styles.confValue}
                      style={{ color: anom.confidence >= 85 ? '#ef4444' : anom.confidence >= 65 ? '#f59e0b' : '#3b82f6' }}
                    >
                      {anom.confidence}%
                    </span>
                  </div>

                  {/* Primary Feature & Z-Score */}
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Primary Affected Feature</span>
                      <span className={styles.detailVal}>
                        {anom.primary_feature ? anom.primary_feature.replace('_', ' ').toUpperCase() : 'N/A'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Max Z-Score</span>
                      <span className={styles.detailVal} style={{ color: '#ec4899' }}>
                        {anom.z_score ? anom.z_score.toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>

                  {/* Model Agreement Breakdown */}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Model Agreement ({anom.votes || 0}/3 Models)
                    </div>
                    <div className={styles.modelAgreementGrid}>
                      <span className={`${styles.modelBadge} ${anom.model_agreement?.isolation_forest ? styles.modelYes : styles.modelNo}`}>
                        {anom.model_agreement?.isolation_forest ? <Check size={12} /> : <X size={12} />} Isolation Forest
                      </span>
                      <span className={`${styles.modelBadge} ${anom.model_agreement?.lof ? styles.modelYes : styles.modelNo}`}>
                        {anom.model_agreement?.lof ? <Check size={12} /> : <X size={12} />} LOF
                      </span>
                      <span className={`${styles.modelBadge} ${anom.model_agreement?.ocsvm ? styles.modelYes : styles.modelNo}`}>
                        {anom.model_agreement?.ocsvm ? <Check size={12} /> : <X size={12} />} One-Class SVM
                      </span>
                    </div>
                  </div>

                  {/* Contributing Features Percentage */}
                  {anom.contributing_features && anom.contributing_features.length > 0 && (
                    <div className={styles.contribSection}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                        Feature Contribution Breakdown
                      </div>
                      {anom.contributing_features.slice(0, 3).map((item) => (
                        <div key={item.feature} className={styles.contribRow}>
                          <span className={styles.contribName}>{item.feature.replace('_', ' ')}</span>
                          <div className={styles.contribBarTrack}>
                            <div className={styles.contribBarFill} style={{ width: `${item.percentage}%` }} />
                          </div>
                          <span className={styles.contribPct}>{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Data-Driven Human Explanation */}
                  {anom.explanation?.reason && (
                    <div className={styles.explanationBox}>
                      <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', color: '#60a5fa' }} />
                      {anom.explanation.reason}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Grouped Anomaly Episodes */}
        <div className={`glass-panel ${styles.panel}`}>
          <div className={styles.panelTitle}>
            <Layers size={20} color="#3b82f6" />
            Grouped Anomaly Episodes ({episodes.length})
          </div>

          <div className={styles.cardList}>
            {episodes.length === 0 ? (
              <p className={styles.emptyMsg}>No multi-record anomaly episodes grouped yet.</p>
            ) : (
              episodes.map((episode) => (
                <AnomalyEpisodeCard key={episode.episode_id || episode.episode_number} episode={episode} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
