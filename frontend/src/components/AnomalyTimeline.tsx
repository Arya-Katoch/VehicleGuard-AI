"use client";
import React from 'react';
import { AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import styles from './AnomalyTimeline.module.css';

interface AnomalyEvent {
  id: string;
  timestamp: string;
  severity: string;
  details: string;
  feature: string;
  modelBreakdown: any;
}

export default function AnomalyTimeline({ events }: { events: AnomalyEvent[] }) {
  const getSeverityConfig = (severity: string) => {
    switch(severity) {
      case 'strong_anomaly': return { color: 'var(--danger-color)', icon: AlertOctagon, label: 'Strong Anomaly' };
      case 'consensus_anomaly': return { color: 'var(--warning-color)', icon: AlertTriangle, label: 'Consensus Anomaly' };
      case 'weak_anomaly': return { color: 'var(--accent-color)', icon: Info, label: 'Weak Anomaly' };
      default: return { color: 'var(--text-secondary)', icon: Info, label: 'Info' };
    }
  };

  return (
    <div className={`glass-panel ${styles.container}`}>
      <h3 className={styles.title}>AI Event Timeline</h3>
      <div className={styles.timelineList}>
        {events.length === 0 ? (
          <p className={styles.empty}>No anomalies detected yet.</p>
        ) : (
          events.map((event) => {
            const config = getSeverityConfig(event.severity);
            const Icon = config.icon;
            return (
              <div key={event.id} className={styles.eventItem}>
                <div className={styles.iconWrapper} style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                  <Icon size={18} />
                </div>
                <div className={styles.eventContent}>
                  <div className={styles.eventHeader}>
                    <span className={styles.eventLabel} style={{ color: config.color }}>{config.label}</span>
                    <span className={styles.eventTime}>{event.timestamp}</span>
                  </div>
                  <p className={styles.eventDetails}>{event.details}</p>
                  
                  <div className={styles.modelBreakdown}>
                    <span className={event.modelBreakdown.isolation_forest === 'anomaly' ? styles.modelAnomaly : styles.modelNormal}>IF</span>
                    <span className={event.modelBreakdown.lof === 'anomaly' ? styles.modelAnomaly : styles.modelNormal}>LOF</span>
                    <span className={event.modelBreakdown.ocsvm === 'anomaly' ? styles.modelAnomaly : styles.modelNormal}>SVM</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
