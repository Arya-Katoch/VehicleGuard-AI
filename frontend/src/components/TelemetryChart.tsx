"use client";
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface TelemetryChartProps {
  data: any[];
  title?: string;
  primaryKey?: string;
  secondaryKey?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function TelemetryChart({
  data,
  title = "Live Telemetry Stream",
  primaryKey = "speed",
  secondaryKey = "rpm",
  primaryColor = "#3b82f6",
  secondaryColor = "#10b981"
}: TelemetryChartProps) {
  // Format X Axis timestamp key dynamically
  const formattedData = data.map((item, idx) => ({
    ...item,
    displayTime: item.timestamp !== undefined ? item.timestamp : item.time !== undefined ? item.time : idx
  }));

  const hasPrimary = data.length > 0 && primaryKey in data[0];
  const hasSecondary = data.length > 0 && secondaryKey in data[0];

  // If primaryKey is missing in data, find any available numerical key
  const availableKeys = data.length > 0 ? Object.keys(data[0]).filter(k => typeof data[0][k] === 'number' && k !== 'timestamp' && k !== 'time') : [];
  const actualPrimaryKey = hasPrimary ? primaryKey : availableKeys[0] || primaryKey;
  const actualSecondaryKey = hasSecondary ? secondaryKey : (availableKeys[1] && availableKeys[1] !== actualPrimaryKey) ? availableKeys[1] : (secondaryKey !== actualPrimaryKey ? secondaryKey : undefined);

  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{title}</span>
        {data.length > 0 && (
          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            {data.length} frames
          </span>
        )}
      </h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="displayTime" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            {actualSecondaryKey && (
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            )}
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            {actualPrimaryKey && (
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey={actualPrimaryKey} 
                stroke={primaryColor} 
                activeDot={{ r: 6 }} 
                isAnimationActive={false} 
                name={actualPrimaryKey.replace('_', ' ').toUpperCase()} 
              />
            )}
            {actualSecondaryKey && (
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey={actualSecondaryKey} 
                stroke={secondaryColor} 
                isAnimationActive={false} 
                name={actualSecondaryKey.replace('_', ' ').toUpperCase()} 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
