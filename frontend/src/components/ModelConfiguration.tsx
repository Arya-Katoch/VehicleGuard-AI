"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { Settings, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './ModelComparison.module.css';
import { API_BASE_URL } from '../utils/apiConfig';

interface ModelConfig {
  iso_forest: {
    n_estimators: number;
    contamination: number;
    random_state: number;
  };
  lof: {
    n_neighbors: number;
    contamination: number;
    metric: string;
  };
  ocsvm: {
    kernel: string;
    nu: number;
    gamma: string | number;
  };
}

interface ModelConfigurationProps {
  sessionId: number;
  initialConfig?: ModelConfig;
  onRetrainSuccess?: (data: any) => void;
}

export default function ModelConfiguration({
  sessionId,
  initialConfig,
  onRetrainSuccess
}: ModelConfigurationProps) {
  const [config, setConfig] = useState<ModelConfig>(
    initialConfig || {
      iso_forest: { n_estimators: 200, contamination: 0.05, random_state: 42 },
      lof: { n_neighbors: 20, contamination: 0.05, metric: 'minkowski' },
      ocsvm: { kernel: 'rbf', nu: 0.05, gamma: 'scale' }
    }
  );

  const [isRetraining, setIsRetraining] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleIsoChange = (field: string, val: any) => {
    setConfig(prev => ({
      ...prev,
      iso_forest: { ...prev.iso_forest, [field]: val }
    }));
  };

  const handleLofChange = (field: string, val: any) => {
    setConfig(prev => ({
      ...prev,
      lof: { ...prev.lof, [field]: val }
    }));
  };

  const handleOcsvmChange = (field: string, val: any) => {
    setConfig(prev => ({
      ...prev,
      ocsvm: { ...prev.ocsvm, [field]: val }
    }));
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    setStatusMsg(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/sessions/${sessionId}/models/retrain`, config);
      setStatusMsg({ type: 'success', text: res.data.message || 'Models retrained successfully!' });
      if (onRetrainSuccess) {
        onRetrainSuccess(res.data);
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to retrain models. Check input values.'
      });
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className={`glass-panel ${styles.panel}`}>
      <div className={styles.panelTitle}>
        <Settings size={20} color="#3b82f6" /> Model Configuration & Hyperparameters
      </div>

      {statusMsg && (
        <div className={`${styles.statusBanner} ${statusMsg.type === 'success' ? styles.statusSuccess : styles.statusError}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {statusMsg.text}
        </div>
      )}

      <div className={styles.configForm}>
        {/* Isolation Forest Configuration */}
        <div className={styles.modelGroup}>
          <div className={styles.groupHeader}>
            <span>Isolation Forest</span>
            <span className={`${styles.modelBadge} ${styles.ifBadge}`}>IF</span>
          </div>
          <div className={styles.paramRow}>
            <span className={styles.paramLabel}>Estimators (Trees)</span>
            <input
              type="number"
              min={10}
              max={1000}
              className={styles.paramInput}
              value={config.iso_forest.n_estimators}
              onChange={(e) => handleIsoChange('n_estimators', parseInt(e.target.value) || 200)}
            />
            <span className={styles.paramRangeHint}>[10 – 1000]</span>
          </div>
          <div className={styles.paramRow}>
            <span className={styles.paramLabel}>Contamination</span>
            <input
              type="number"
              step={0.01}
              min={0.001}
              max={0.5}
              className={styles.paramInput}
              value={config.iso_forest.contamination}
              onChange={(e) => handleIsoChange('contamination', parseFloat(e.target.value) || 0.05)}
            />
            <span className={styles.paramRangeHint}>[0.001 – 0.5]</span>
          </div>
        </div>

        {/* LOF Configuration */}
        <div className={styles.modelGroup}>
          <div className={styles.groupHeader}>
            <span>Local Outlier Factor (LOF)</span>
            <span className={`${styles.modelBadge} ${styles.lofBadge}`}>LOF</span>
          </div>
          <div className={styles.paramRow}>
            <span className={styles.paramLabel}>Neighbors (n_neighbors)</span>
            <input
              type="number"
              min={2}
              max={200}
              className={styles.paramInput}
              value={config.lof.n_neighbors}
              onChange={(e) => handleLofChange('n_neighbors', parseInt(e.target.value) || 20)}
            />
            <span className={styles.paramRangeHint}>[2 – 200]</span>
          </div>
          <div className={styles.paramRow}>
            <span className={styles.paramLabel}>Contamination</span>
            <input
              type="number"
              step={0.01}
              min={0.001}
              max={0.5}
              className={styles.paramInput}
              value={config.lof.contamination}
              onChange={(e) => handleLofChange('contamination', parseFloat(e.target.value) || 0.05)}
            />
            <span className={styles.paramRangeHint}>[0.001 – 0.5]</span>
          </div>
          <div className={styles.paramRow}>
            <span className={styles.paramLabel}>Distance Metric</span>
            <select
              className={styles.paramInput}
              value={config.lof.metric}
              onChange={(e) => handleLofChange('metric', e.target.value)}
            >
              <option value="minkowski">Minkowski</option>
              <option value="euclidean">Euclidean</option>
              <option value="manhattan">Manhattan</option>
            </select>
            <span className={styles.paramRangeHint}>Metric</span>
          </div>
        </div>

        {/* One-Class SVM Configuration */}
        <div className={styles.modelGroup}>
          <div className={styles.groupHeader}>
            <span>One-Class SVM</span>
            <span className={`${styles.modelBadge} ${styles.svmBadge}`}>OCSVM</span>
          </div>
          <div className={styles.paramRow}>
            <span className={styles.paramLabel}>Kernel</span>
            <select
              className={styles.paramInput}
              value={config.ocsvm.kernel}
              onChange={(e) => handleOcsvmChange('kernel', e.target.value)}
            >
              <option value="rbf">RBF (Radial)</option>
              <option value="linear">Linear</option>
              <option value="poly">Polynomial</option>
              <option value="sigmoid">Sigmoid</option>
            </select>
            <span className={styles.paramRangeHint}>Kernel</span>
          </div>
          <div className={styles.paramRow}>
            <span className={styles.paramLabel}>Nu (Outlier Bound)</span>
            <input
              type="number"
              step={0.01}
              min={0.001}
              max={0.5}
              className={styles.paramInput}
              value={config.ocsvm.nu}
              onChange={(e) => handleOcsvmChange('nu', parseFloat(e.target.value) || 0.05)}
            />
            <span className={styles.paramRangeHint}>[0.001 – 0.5]</span>
          </div>
          <div className={styles.paramRow}>
            <span className={styles.paramLabel}>Gamma</span>
            <select
              className={styles.paramInput}
              value={String(config.ocsvm.gamma)}
              onChange={(e) => handleOcsvmChange('gamma', e.target.value)}
            >
              <option value="scale">Scale</option>
              <option value="auto">Auto</option>
            </select>
            <span className={styles.paramRangeHint}>Gamma</span>
          </div>
        </div>

        <button
          className={styles.retrainBtn}
          onClick={handleRetrain}
          disabled={isRetraining}
        >
          <RefreshCw size={18} className={isRetraining ? 'alert-pulse' : ''} />
          {isRetraining ? 'Retraining ML Models & Re-Analyzing...' : 'Retrain Models'}
        </button>
      </div>
    </div>
  );
}
