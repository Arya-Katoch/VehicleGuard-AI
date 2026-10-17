"use client";
import React, { useState } from 'react';
import { Radio, Activity, Zap, ShieldAlert, Cpu } from 'lucide-react';
import styles from './VehicleSensorHotspots.module.css';

interface SensorNode {
  id: string;
  name: string;
  category: string;
  x: number; // percentage from left
  y: number; // percentage from top
  sampleRate: string;
  protocol: string;
  status: 'Nominal' | 'Active' | 'Monitored';
  color: string;
  icon: any;
}

const SENSOR_NODES: SensorNode[] = [
  {
    id: 'ecu',
    name: 'Powertrain ECU & RPM Sensor',
    category: 'Engine Telemetry',
    x: 67,
    y: 54,
    sampleRate: '100 Hz',
    protocol: 'SAE J1979 / OBD-II (PID 0x0C)',
    status: 'Nominal',
    color: '#f59e0b',
    icon: Cpu,
  },
  {
    id: 'radar',
    name: 'Front LiDAR & Proximity Array',
    category: 'ADAS Sensor Fusion',
    x: 60,
    y: 63,
    sampleRate: '40 Hz',
    protocol: 'CAN-FD High-Speed (2 Mbps)',
    status: 'Active',
    color: '#06b6d4',
    icon: Radio,
  },
  {
    id: 'wheel',
    name: 'ABS Wheel Speed & Yaw Rate',
    category: 'Chassis Dynamics',
    x: 77,
    y: 68,
    sampleRate: '100 Hz',
    protocol: 'ISO 11898-2 (CAN 0x284)',
    status: 'Nominal',
    color: '#38bdf8',
    icon: Activity,
  },
  {
    id: 'gateway',
    name: 'Central Diagnostic CAN Gateway',
    category: 'Bus Interconnect',
    x: 78,
    y: 45,
    sampleRate: 'Continuous 500 kbps',
    protocol: 'ISO 14229 / UDS',
    status: 'Monitored',
    color: '#ec4899',
    icon: Zap,
  },
  {
    id: 'diff',
    name: 'Rear Traction & Torque Vector',
    category: 'Drivetrain Telemetry',
    x: 93,
    y: 58,
    sampleRate: '50 Hz',
    protocol: 'FlexRay / Differential Telemetry',
    status: 'Nominal',
    color: '#10b981',
    icon: ShieldAlert,
  },
];

export default function VehicleSensorHotspots() {
  const [activeNode, setActiveNode] = useState<SensorNode | null>(null);

  return (
    <div className={styles.hotspotsContainer} aria-hidden="true">
      {SENSOR_NODES.map((node) => {
        const Icon = node.icon;
        const isActive = activeNode?.id === node.id;

        return (
          <div
            key={node.id}
            className={styles.hotspotAnchor}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onMouseEnter={() => setActiveNode(node)}
            onMouseLeave={() => setActiveNode(null)}
          >
            {/* Pulsing Ripple Rings */}
            <span
              className={styles.pulseRing}
              style={{ borderColor: node.color }}
            />
            <span
              className={styles.pulseCore}
              style={{ backgroundColor: node.color, boxShadow: `0 0 12px ${node.color}` }}
            >
              <span className={styles.innerDot} />
            </span>

            {/* Futuristic HUD Tooltip Card */}
            {isActive && (
              <div className={styles.tooltipCard} style={{ borderColor: node.color }}>
                <div className={styles.tooltipHeader}>
                  <Icon size={14} style={{ color: node.color }} />
                  <span className={styles.nodeCategory}>{node.category}</span>
                  <span
                    className={styles.statusPill}
                    style={{
                      color: node.color,
                      backgroundColor: `${node.color}18`,
                      borderColor: `${node.color}40`,
                    }}
                  >
                    {node.status}
                  </span>
                </div>
                <div className={styles.nodeName}>{node.name}</div>
                <div className={styles.metaRow}>
                  <span>Rate: <strong>{node.sampleRate}</strong></span>
                  <span>Bus: <strong>{node.protocol}</strong></span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
