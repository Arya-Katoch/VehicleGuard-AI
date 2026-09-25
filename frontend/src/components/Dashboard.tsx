"use client";
import React, { useState, useEffect, useRef } from 'react';
import TelemetryChart from './TelemetryChart';
import HealthScore from './HealthScore';
import AnomalyTimeline from './AnomalyTimeline';
import { Activity, CheckCircle2, RefreshCw } from 'lucide-react';
import styles from '../app/page.module.css';

export default function Dashboard({ sessionId }: { sessionId: number }) {
  const [telemetryData, setTelemetryData] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState(100);
  const [isStreaming, setIsStreaming] = useState(true);
  const [progress, setProgress] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setIsStreaming(true);
    setTelemetryData([]);
    setEvents([]);
    setHealthScore(100);

    eventSourceRef.current = new EventSource(`http://localhost:8000/api/stream/${sessionId}`);

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.status === "completed") {
          setIsStreaming(false);
          eventSourceRef.current?.close();
          return;
        }

        if (data.progress !== undefined) {
          setProgress(Math.round(data.progress));
        }

        const tel = data.telemetry;
        const analysis = data.analysis;

        // Update Chart Data (keep last 60 data points)
        setTelemetryData(prev => {
          const newData = [...prev, tel];
          if (newData.length > 60) return newData.slice(newData.length - 60);
          return newData;
        });

        // Update Health Score & Anomaly Events
        if (analysis && analysis.votes > 0) {
          setHealthScore(prev => Math.max(0, prev - (analysis.votes * 6)));
          
          setEvents(prev => [{
            id: Math.random().toString(),
            timestamp: tel.timestamp !== undefined ? `T: ${tel.timestamp}` : new Date().toLocaleTimeString(),
            severity: analysis.severity,
            details: analysis.explanation?.reason || "Anomalous metric deviation detected.",
            feature: analysis.explanation?.feature || "multiple",
            modelBreakdown: analysis.model_breakdown
          }, ...prev].slice(0, 50));
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

  return (
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
  );
}
