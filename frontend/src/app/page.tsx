"use client";
import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, Cpu, ArrowLeft } from 'lucide-react';
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

  const handleStepBack = () => {
    if (step === 'dashboard') {
      setStep('summary');
    } else if (step === 'summary') {
      setStep('upload');
    }
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
            <button
              className={styles.backBtn}
              onClick={handleStepBack}
              title={step === 'dashboard' ? 'Back to AI Standardization' : 'Back to Telemetry Ingestion'}
              id="global-back-btn"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          {step !== 'upload' && (
            <button className={styles.resetBtn} onClick={handleReset} title="Start new session from scratch">
              <RotateCcw size={16} /> New Analysis
            </button>
          )}

          {/* Interactive Stepper Navigation Bar */}
          <div className={styles.stepperContainer}>
            <button
              className={`${styles.stepPill} ${
                step === 'upload' ? styles.activeStepPill : styles.clickableStepPill
              }`}
              onClick={() => setStep('upload')}
              title="Go to Step 1: Telemetry Ingestion"
              type="button"
            >
              <span className={styles.stepNum}>1</span> Ingestion
            </button>
            <span className={styles.stepDivider}>→</span>
            <button
              className={`${styles.stepPill} ${
                step === 'summary'
                  ? styles.activeStepPill
                  : sessionData
                  ? styles.clickableStepPill
                  : styles.disabledStepPill
              }`}
              onClick={() => sessionData && setStep('summary')}
              disabled={!sessionData}
              title={sessionData ? 'Go to Step 2: AI Standardization' : 'Upload dataset first'}
              type="button"
            >
              <span className={styles.stepNum}>2</span> Standardization
            </button>
            <span className={styles.stepDivider}>→</span>
            <button
              className={`${styles.stepPill} ${
                step === 'dashboard'
                  ? styles.activeStepPill
                  : sessionData
                  ? styles.clickableStepPill
                  : styles.disabledStepPill
              }`}
              onClick={() => sessionData && setStep('dashboard')}
              disabled={!sessionData}
              title={sessionData ? 'Go to Step 3: Stream Monitoring' : 'Complete standardization first'}
              type="button"
            >
              <span className={styles.stepNum}>3</span> Monitoring
            </button>
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
              onBack={() => setStep('upload')}
            />
          </div>
        )}

        {step === 'dashboard' && sessionData && (
          <Dashboard sessionId={sessionData.sessionId} onBack={() => setStep('summary')} />
        )}
      </main>
    </div>
  );
}
