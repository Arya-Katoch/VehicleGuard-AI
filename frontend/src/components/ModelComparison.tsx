"use client";
import React from 'react';
import { Cpu, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import ModelConfiguration from './ModelConfiguration';
import styles from './ModelComparison.module.css';

interface ModelComparisonProps {
  sessionId: number;
  modelData: {
    config?: any;
    model_comparison?: {
      isolation_forest?: {
        anomalies_detected: number;
        normal_detected: number;
        consensus_agreement_pct: number;
        runtime_ms: number;
        parameters: any;
      };
      lof?: {
        anomalies_detected: number;
        normal_detected: number;
        consensus_agreement_pct: number;
        runtime_ms: number;
        parameters: any;
      };
      ocsvm?: {
        anomalies_detected: number;
        normal_detected: number;
        consensus_agreement_pct: number;
        runtime_ms: number;
        parameters: any;
      };
    };
    model_agreement_distribution?: {
      all_3_models: number;
      if_and_lof: number;
      if_and_svm: number;
      lof_and_svm: number;
      only_if: number;
      only_lof: number;
      only_svm: number;
      normal: number;
    };
  };
  onRetrainSuccess?: (data: any) => void;
}

export default function ModelComparison({
  sessionId,
  modelData,
  onRetrainSuccess
}: ModelComparisonProps) {
  const comp = modelData?.model_comparison || {};
  const dist = modelData?.model_agreement_distribution || {
    all_3_models: 0,
    if_and_lof: 0,
    if_and_svm: 0,
    lof_and_svm: 0,
    only_if: 0,
    only_lof: 0,
    only_svm: 0,
    normal: 0
  };

  const ifData = comp.isolation_forest || { anomalies_detected: 0, normal_detected: 0, consensus_agreement_pct: 0, runtime_ms: 0, parameters: {} };
  const lofData = comp.lof || { anomalies_detected: 0, normal_detected: 0, consensus_agreement_pct: 0, runtime_ms: 0, parameters: {} };
  const svmData = comp.ocsvm || { anomalies_detected: 0, normal_detected: 0, consensus_agreement_pct: 0, runtime_ms: 0, parameters: {} };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2><Cpu className="text-gradient" size={28} /> ML Model Intelligence & Comparison Center</h2>
          <p className={styles.subtitle}>
            Performance metrics, model consensus agreement, and interactive hyperparameter tuning.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left Side: Comparison Table & Agreement Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Comparison Table */}
          <div className={`glass-panel ${styles.panel}`}>
            <div className={styles.panelTitle}>
              <ShieldCheck size={20} color="#10b981" /> Algorithm Performance Comparison
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.compTable}>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th><span className={`${styles.modelBadge} ${styles.ifBadge}`}>Isolation Forest</span></th>
                    <th><span className={`${styles.modelBadge} ${styles.lofBadge}`}>LOF</span></th>
                    <th><span className={`${styles.modelBadge} ${styles.svmBadge}`}>One-Class SVM</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Anomalies Detected</strong></td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>{ifData.anomalies_detected}</td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>{lofData.anomalies_detected}</td>
                    <td style={{ color: '#ef4444', fontWeight: 700 }}>{svmData.anomalies_detected}</td>
                  </tr>
                  <tr>
                    <td><strong>Normal Records</strong></td>
                    <td style={{ color: '#10b981' }}>{ifData.normal_detected}</td>
                    <td style={{ color: '#10b981' }}>{lofData.normal_detected}</td>
                    <td style={{ color: '#10b981' }}>{svmData.normal_detected}</td>
                  </tr>
                  <tr>
                    <td><strong>Consensus Agreement</strong></td>
                    <td style={{ color: '#60a5fa', fontWeight: 600 }}>{ifData.consensus_agreement_pct}%</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>{lofData.consensus_agreement_pct}%</td>
                    <td style={{ color: '#c084fc', fontWeight: 600 }}>{svmData.consensus_agreement_pct}%</td>
                  </tr>
                  <tr>
                    <td><strong>Fit Runtime (ms)</strong></td>
                    <td>{ifData.runtime_ms} ms</td>
                    <td>{lofData.runtime_ms} ms</td>
                    <td>{svmData.runtime_ms} ms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Agreement Breakdown */}
          <div className={`glass-panel ${styles.panel}`}>
            <div className={styles.panelTitle}>
              <CheckCircle2 size={20} color="#3b82f6" /> Model Consensus & Intersection Matrix
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>All 3 Models (Consensus)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f87171' }}>{dist.all_3_models || 0}</div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>IF + LOF Only</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24' }}>{dist.if_and_lof || 0}</div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>IF + SVM Only</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24' }}>{dist.if_and_svm || 0}</div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>LOF + SVM Only</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24' }}>{dist.lof_and_svm || 0}</div>
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>Isolation Forest Only</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#60a5fa' }}>{dist.only_if || 0}</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>LOF Only</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>{dist.only_lof || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Configuration Form */}
        <div>
          <ModelConfiguration
            sessionId={sessionId}
            initialConfig={modelData.config}
            onRetrainSuccess={onRetrainSuccess}
          />
        </div>
      </div>
    </div>
  );
}
