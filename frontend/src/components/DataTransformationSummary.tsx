import React from 'react';
import { Database, FileCheck, Info, Play, TrendingUp, ArrowLeft } from 'lucide-react';
import styles from './DataTransformationSummary.module.css';

interface SummaryData {
  raw_records: number;
  processed_records: number;
  columns_detected: number;
  columns_mapped: Record<string, string>;
  missing_values_handled: number;
  duplicates_handled: number;
  features_generated: string[];
}

export default function DataTransformationSummary({ 
  summary, 
  onStartPlayback,
  onBack,
}: { 
  summary: SummaryData;
  onStartPlayback: () => void;
  onBack?: () => void;
}) {
  return (
    <div className={`glass-panel ${styles.container}`}>
      <div className={styles.header}>
        <h2><FileCheck className={styles.icon} /> AI Data Processing Complete</h2>
        <p className="text-secondary">VehicleGuard has successfully parsed and standardized your raw telemetry.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Records</div>
          <div className={styles.statValue}>
            {summary.raw_records.toLocaleString()} <span className={styles.arrow}>→</span> {summary.processed_records.toLocaleString()}
          </div>
          <div className={styles.statHint}>Cleaned & Deduplicated</div>
        </div>
        
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Data Quality</div>
          <div className={styles.statValue}>
            {summary.missing_values_handled.toLocaleString()}
          </div>
          <div className={styles.statHint}>Missing Values Imputed</div>
        </div>

        <div className={styles.statBox}>
          <div className={styles.statLabel}>Features Engineered</div>
          <div className={styles.statValue}>
            {summary.features_generated.length}
          </div>
          <div className={styles.statHint}>AI Derived Metrics</div>
        </div>
      </div>

      <div className={styles.detailsRow}>
        <div className={styles.detailCard}>
          <h3><Database size={18} /> Column Mapping</h3>
          {Object.keys(summary.columns_mapped).length > 0 ? (
            <ul className={styles.mappingList}>
              {Object.entries(summary.columns_mapped).map(([raw, std]) => (
                <li key={raw}>
                  <span className={styles.rawCol}>{raw}</span>
                  <span className={styles.mapArrow}>→</span>
                  <span className={styles.stdCol}>{std}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyMsg}>No columns needed mapping.</p>
          )}
        </div>

        <div className={styles.detailCard}>
          <h3><TrendingUp size={18} /> Derived Features</h3>
          {summary.features_generated.length > 0 ? (
            <div className={styles.tagsContainer}>
              {summary.features_generated.map(f => (
                <span key={f} className={styles.tag}>{f}</span>
              ))}
            </div>
          ) : (
            <p className={styles.emptyMsg}>No additional features generated.</p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.infoText}>
          <Info size={16} /> Data is standardized and ML models are trained.
        </div>
        <div className={styles.buttonRow}>
          {onBack && (
            <button className={styles.backBtn} onClick={onBack} type="button" id="summary-back-btn">
              <ArrowLeft size={18} /> Back to Ingestion
            </button>
          )}
          <button className={styles.playBtn} onClick={onStartPlayback} type="button" id="start-live-monitoring-btn">
            <Play size={20} fill="currentColor" /> Start Live Monitoring
          </button>
        </div>
      </div>
    </div>
  );
}
