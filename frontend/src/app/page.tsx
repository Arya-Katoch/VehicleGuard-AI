"use client";
import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, Cpu } from 'lucide-react';
import DataUploader from '@/components/DataUploader';
import DataTransformationSummary from '@/components/DataTransformationSummary';
import Dashboard from '@/components/Dashboard';
import styles from './page.module.css';

export default function Home() {
  const [step, setStep] = useState<'upload' | 'summary' | 'dashboard'>('upload');
  const [sessionData, setSessionData] = useState<{ sessionId: number; summary: any } | null>(null);

  const handleUploadSuccess = (data: { session_id: number; summary: any }) => {
    setSessionData({
      sessionId: data.session_id,
      summary: data.summary,
    });
    setStep('summary');
  };

  const handleStartPlayback = () => {
    setStep('dashboard');
  };

  const handleReset = () => {
    setStep('upload');
    setSessionData(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1 className={styles.title}>
            <Cpu className={styles.logoIcon} size={36} />
            <span className="text-gradient">VehicleGuard AI</span>
          </h1>
          <p className={styles.subtitle}>
            Unsupervised Multi-Model Vehicle Telemetry Anomaly Detection System
          </p>
        </div>

        <div className={styles.headerActions}>
          {step !== 'upload' && (
            <button className={styles.resetBtn} onClick={handleReset}>
              <RotateCcw size={16} /> New Analysis
            </button>
          )}
          <div className={styles.stepBadge}>
            {step === 'upload' && 'Step 1: Data Ingestion'}
            {step === 'summary' && 'Step 2: AI Standardization'}
            {step === 'dashboard' && 'Step 3: Real-Time Stream Monitoring'}
          </div>
        </div>
      </header>

      <main>
        {step === 'upload' && (
          <div className={styles.uploaderContainer}>
            <DataUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {step === 'summary' && sessionData && (
          <div className={styles.uploaderContainer}>
            <DataTransformationSummary
              summary={sessionData.summary}
              onStartPlayback={handleStartPlayback}
            />
          </div>
        )}

        {step === 'dashboard' && sessionData && (
          <Dashboard sessionId={sessionData.sessionId} />
        )}
      </main>
    </div>
  );
}
