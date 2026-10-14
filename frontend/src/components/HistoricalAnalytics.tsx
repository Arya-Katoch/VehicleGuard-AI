"use client";
import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Layers, PieChart as PieIcon, Activity } from 'lucide-react';
import styles from './HistoricalAnalytics.module.css';

interface AnalyticsData {
  summary_stats: {
    total_records: number;
    total_anomalies: number;
    anomaly_rate_pct: number;
    strong_anomalies: number;
    consensus_anomalies: number;
    weak_anomalies: number;
    total_episodes: number;
  };
  episodes: any[];
  model_comparison: any;
  model_agreement_distribution: {
    all_3_models: number;
    if_and_lof: number;
    if_and_svm: number;
    lof_and_svm: number;
    only_if: number;
    only_lof: number;
    only_svm: number;
    normal: number;
  };
  most_affected_features: Array<{ feature: string; count: number; avg_z_score: number }>;
  anomalies_over_time: Array<{ timestamp: number; votes: number; confidence: number; is_anomaly: number; z_score: number }>;
}

export default function HistoricalAnalytics({ analytics }: { analytics: AnalyticsData }) {
  if (!analytics || !analytics.summary_stats) {
    return (
      <div className={`glass-panel ${styles.empty}`}>
        No analytics available. Upload or select a dataset first.
      </div>
    );
  }

  const stats = analytics.summary_stats;

  // Pie chart data for severity
  const severityPieData = [
    { name: 'Strong Anomaly', value: stats.strong_anomalies, color: '#ef4444' },
    { name: 'Consensus Anomaly', value: stats.consensus_anomalies, color: '#f59e0b' },
    { name: 'Weak Anomaly', value: stats.weak_anomalies, color: '#3b82f6' },
    { name: 'Normal Data', value: Math.max(0, stats.total_records - stats.total_anomalies), color: '#10b981' }
  ].filter(d => d.value > 0);

  // Model agreement bar data
  const dist = analytics.model_agreement_distribution || {};
  const agreementBarData = [
    { name: 'All 3 Models', count: dist.all_3_models || 0, fill: '#ef4444' },
    { name: 'IF + LOF', count: dist.if_and_lof || 0, fill: '#f59e0b' },
    { name: 'IF + SVM', count: dist.if_and_svm || 0, fill: '#f59e0b' },
    { name: 'LOF + SVM', count: dist.lof_and_svm || 0, fill: '#f59e0b' },
    { name: 'Only IF', count: dist.only_if || 0, fill: '#3b82f6' },
    { name: 'Only LOF', count: dist.only_lof || 0, fill: '#3b82f6' },
    { name: 'Only SVM', count: dist.only_svm || 0, fill: '#3b82f6' }
  ];

  // Most affected features data
  const affectedData = (analytics.most_affected_features || []).map(item => ({
    name: item.feature.replace('_', ' ').toUpperCase(),
    anomalies: item.count,
    avgZ: item.avg_z_score
  }));

  // Timeline & Frequency trend data
  const timelineData = (analytics.anomalies_over_time || []).map((item, idx) => ({
    time: item.timestamp !== undefined ? item.timestamp : idx,
    confidence: item.confidence,
    votes: item.votes,
    z_score: item.z_score
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2><BarChart3 className="text-gradient" size={28} /> Historical Analytics & Anomaly Episodes</h2>
          <p className={styles.subtitle}>
            Comprehensive analytics over complete dataset telemetry run with real ML predictions.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total Records</span>
          <span className={styles.kpiValue}>{stats.total_records.toLocaleString()}</span>
          <span className={styles.kpiSub}>Clean Telemetry Frames</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total Anomalies</span>
          <span className={styles.kpiValue} style={{ color: stats.total_anomalies > 0 ? '#ef4444' : '#10b981' }}>
            {stats.total_anomalies}
          </span>
          <span className={styles.kpiSub}>Anomaly Rate: {stats.anomaly_rate_pct}%</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Strong Anomalies</span>
          <span className={styles.kpiValue} style={{ color: '#ef4444' }}>{stats.strong_anomalies}</span>
          <span className={styles.kpiSub}>All 3 Models Consensus</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Consensus Anomalies</span>
          <span className={styles.kpiValue} style={{ color: '#f59e0b' }}>{stats.consensus_anomalies}</span>
          <span className={styles.kpiSub}>2 Models Agreement</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Anomaly Episodes</span>
          <span className={styles.kpiValue} style={{ color: '#3b82f6' }}>{stats.total_episodes}</span>
          <span className={styles.kpiSub}>Grouped Time Windows</span>
        </div>
      </div>

      {/* 5 Real-Data Visualizations */}
      <div className={styles.chartsGrid}>
        {/* Viz 1: Anomalies Over Time Timeline */}
        <div className={`glass-panel ${styles.fullWidthChart}`}>
          <div className={styles.chartTitle}>
            <span><TrendingUp size={18} style={{ display: 'inline', marginRight: '6px', color: '#3b82f6' }} /> Anomalies Over Time & Confidence Curve</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Dataset Sequence</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#94a3b8" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" domain={[0, 3]} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="confidence" name="Confidence (%)" stroke="#ef4444" fillOpacity={1} fill="url(#colorConf)" />
                <Area yAxisId="right" type="monotone" dataKey="votes" name="Model Votes (0-3)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVotes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Viz 2: Anomaly Severity Distribution */}
        <div className={`glass-panel ${styles.chartCard}`}>
          <div className={styles.chartTitle}>
            <span><PieIcon size={18} style={{ display: 'inline', marginRight: '6px', color: '#f59e0b' }} /> Anomaly Severity Distribution</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Viz 3: Most Affected Features */}
        <div className={`glass-panel ${styles.chartCard}`}>
          <div className={styles.chartTitle}>
            <span><Activity size={18} style={{ display: 'inline', marginRight: '6px', color: '#ec4899' }} /> Most Affected Features</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            {affectedData.length === 0 ? (
              <p className={styles.empty}>No anomalous feature deviations.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={affectedData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="anomalies" name="Anomaly Count" fill="#ec4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Viz 4: Model Agreement Distribution */}
        <div className={`glass-panel ${styles.chartCard}`}>
          <div className={styles.chartTitle}>
            <span><Layers size={18} style={{ display: 'inline', marginRight: '6px', color: '#10b981' }} /> Model Agreement Distribution</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agreementBarData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" angle={-15} textAnchor="end" interval={0} style={{ fontSize: '0.75rem' }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }} />
                <Bar dataKey="count" name="Records Count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {agreementBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Viz 5: Anomaly Z-Score Magnitude Trend */}
        <div className={`glass-panel ${styles.chartCard}`}>
          <div className={styles.chartTitle}>
            <span><TrendingUp size={18} style={{ display: 'inline', marginRight: '6px', color: '#60a5fa' }} /> Peak Z-Score Deviation Trend</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="z_score" name="Max Z-Score" stroke="#c084fc" fill="#c084fc" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
