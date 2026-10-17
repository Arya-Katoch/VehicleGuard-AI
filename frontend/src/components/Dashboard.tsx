"use client";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TelemetryChart from './TelemetryChart';
import HealthScore from './HealthScore';
import AnomalyTimeline from './AnomalyTimeline';
import AnomalyIntelligence from './AnomalyIntelligence';
import HistoricalAnalytics from './HistoricalAnalytics';
import ModelComparison from './ModelComparison';
import { Activity, CheckCircle2, Brain, BarChart3, Cpu, Radio, ArrowLeft } from 'lucide-react';
import styles from '../app/page.module.css';
import { API_BASE_URL } from '../utils/apiConfig';

export default function Dashboard({ sessionId, onBack }: { sessionId: number; onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<'live' | 'intelligence' | 'analytics' | 'models'>('live');
  const [telemetryData, setTelemetryData] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState(100);
  const [isStreaming, setIsStreaming] = useState(true);
  const [progress, setProgress] = useState(0);

  // Advanced feature data states
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [modelData, setModelData] = useState<any>({});
  const [anomaliesIntelligenceList, setAnomaliesIntelligenceList] = useState<any[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch full analytics & model stats
  const fetchAnalyticsAndModels = async () => {
    try {
      const [analyticsRes, modelsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/sessions/${sessionId}/analytics`),
        axios.get(`${API_BASE_URL}/api/sessions/${sessionId}/models`)
      ]);
      setAnalyticsData(analyticsRes.data);
      setModelData(modelsRes.data);
    } catch (err) {
      console.error("Error fetching session analytics or model data:", err);
    }
  };

  useEffect(() => {
    fetchAnalyticsAndModels();

    setIsStreaming(true);
    setTelemetryData([]);
    setEvents([]);
    setAnomaliesIntelligenceList([]);
    setHealthScore(100);

    eventSourceRef.current = new EventSource(`${API_BASE_URL}/api/stream/${sessionId}`);

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.status === "completed") {
          setIsStreaming(false);
          eventSourceRef.current?.close();
          fetchAnalyticsAndModels(); // Refresh analytics after stream completes
          return;
        }

        if (data.progress !== undefined) {
          setProgress(Math.round(data.progress));
        }

        const tel = data.telemetry;
        const analysis = data.analysis;

        // Update Chart Data (keep last 60 points)
        setTelemetryData(prev => {
          const newData = [...prev, tel];
          if (newData.length > 60) return newData.slice(newData.length - 60);
          return newData;
        });

        // Update Health Score & Events
        if (analysis && analysis.votes > 0) {
          setHealthScore(prev => Math.max(0, prev - (analysis.votes * 6)));

          const eventItem = {
            id: analysis.anomaly_id || Math.random().toString(),
            timestamp: tel.timestamp !== undefined ? `T: ${tel.timestamp}` : new Date().toLocaleTimeString(),
            severity: analysis.severity,
            details: analysis.explanation?.reason || "Anomalous metric deviation detected.",
            feature: analysis.explanation?.feature || "multiple",
            modelBreakdown: analysis.model_breakdown
          };

          setEvents(prev => [eventItem, ...prev].slice(0, 50));

          // Enriched intelligence object
          setAnomaliesIntelligenceList(prev => [analysis, ...prev].slice(0, 50));
        } else {
          setHealthScore(prev => Math.min(100, prev + 0.5));
        }
      } catch (err) {
        console.error("Error parsing event stream data:", err);
      }
    };

    eventSourceRef.current.onerror = (err) => {
      console.error("SSE stream error", err);
      setIsStreaming(false);
      eventSourceRef.current?.close();
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [sessionId]);

  const handleRetrainSuccess = (data: any) => {
    if (data.analytics) {
      setAnalyticsData(data.analytics);
    }
    if (data.model_comparison) {
      setModelData({
        config: data.config,
        model_comparison: data.model_comparison,
        model_agreement_distribution: data.analytics?.model_agreement_distribution
      });
    }
    fetchAnalyticsAndModels();
  };

  return (
    <div>
      {/* Sub-Navigation Tabs & In-Dashboard Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className={styles.tabNav} style={{ marginBottom: 0 }}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'live' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('live')}
          >
            <Radio size={16} /> Live Monitoring
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'intelligence' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('intelligence')}
          >
            <Brain size={16} /> Anomaly Intelligence
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'analytics' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} /> Historical Analytics
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'models' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('models')}
          >
            <Cpu size={16} /> Model Intelligence & Config
          </button>
        </div>

        {onBack && (
          <button
            className={styles.backBtn}
            onClick={onBack}
            id="dashboard-back-btn"
            title="Go back to Step 2: AI Standardization"
            type="button"
          >
            <ArrowLeft size={16} />
            <span>Back to Standardization</span>
          </button>
        )}
      </div>

      {/* Tab 1: Live Monitoring */}
      {activeTab === 'live' && (
        <div className={styles.mainGrid}>
          <div className={styles.leftColumn}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {isStreaming ? (
                  <Activity size={18} className="alert-pulse" style={{ color: '#3b82f6' }} />
                ) : (
                  <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                )}
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {isStreaming ? `Live Telemetry Playback (${progress}%)` : 'Playback Complete'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Detected Anomaly Events: <strong style={{ color: events.length > 0 ? '#ef4444' : '#10b981' }}>{events.length}</strong>
              </div>
            </div>

            <div className={styles.chartsContainer}>
              <TelemetryChart
                data={telemetryData}
                title="Speed & Engine RPM Monitoring"
                primaryKey="speed"
                secondaryKey="rpm"
                primaryColor="#3b82f6"
                secondaryColor="#10b981"
              />
              <TelemetryChart
                data={telemetryData}
                title="Engine Load & Thermal Metrics"
                primaryKey="engine_load"
                secondaryKey="coolant_temp"
                primaryColor="#f59e0b"
                secondaryColor="#ec4899"
              />
            </div>
          </div>
          <div className={styles.rightColumn}>
            <HealthScore score={healthScore} />
            <AnomalyTimeline events={events} />
          </div>
        </div>
      )}

      {/* Tab 2: Anomaly Intelligence */}
      {activeTab === 'intelligence' && (
        <AnomalyIntelligence
          anomalies={anomaliesIntelligenceList}
          episodes={analyticsData?.episodes || []}
        />
      )}

      {/* Tab 3: Historical Analytics */}
      {activeTab === 'analytics' && (
        <HistoricalAnalytics analytics={analyticsData} />
      )}

      {/* Tab 4: Model Intelligence & Config */}
      {activeTab === 'models' && (
        <ModelComparison
          sessionId={sessionId}
          modelData={modelData}
          onRetrainSuccess={handleRetrainSuccess}
        />
      )}
    </div>
  );
}
