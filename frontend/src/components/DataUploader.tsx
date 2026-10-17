"use client";
import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  Layers,
  Cpu,
  ArrowUpRight,
} from 'lucide-react';
import ContourWaveSvg from './ContourWaveSvg';
import VehicleSensorHotspots from './VehicleSensorHotspots';
import ReportDeliveryForm, { DeliveryContactInfo } from './ReportDeliveryForm';
import { playSampleClickTone, playProcessingChime } from '../utils/audioFx';
import styles from './DataUploader.module.css';
import { API_BASE_URL } from '../utils/apiConfig';

interface DataUploaderProps {
  onUploadSuccess: (data: any) => void;
}

export default function DataUploader({ onUploadSuccess }: DataUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'delivery'>('upload');
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryContactInfo | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Only CSV files are supported.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    playSampleClickTone();
  };

  const uploadFile = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    playProcessingChime();

    const formData = new FormData();
    formData.append('file', file);
    if (deliveryInfo) {
      formData.append('delivery_contact', JSON.stringify(deliveryInfo));
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUploadSuccess(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSampleClick = async (samplePath: string, fileName: string) => {
    setIsUploading(true);
    setError(null);
    playSampleClickTone();

    try {
      const res = await fetch(`/samples/${samplePath}`);
      const blob = await res.blob();
      const sampleFile = new File([blob], fileName, { type: 'text/csv' });
      setFile(sampleFile);

      const formData = new FormData();
      formData.append('file', sampleFile);
      if (deliveryInfo) {
        formData.append('delivery_contact', JSON.stringify(deliveryInfo));
      }

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUploadSuccess(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load sample dataset.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`${styles.creativeStage} ${styles.theme_holo}`}
      style={{ backgroundImage: `url('/themes/cyber_holo_car.jpg')` }}
    >
      {/* Dark Ambient Vignette Overlay */}
      <div className={styles.stageOverlay} />

      {/* Interactive Telemetry Hotspots over the Holographic Car */}
      <VehicleSensorHotspots />

      {/* Central Glassmorphic Holographic HUD Card */}
      <div className={styles.uploaderCard}>
        {/* Sci-Fi Corner Bracket Reticles */}
        <span className={`${styles.cornerReticle} ${styles.cornerTL}`} />
        <span className={`${styles.cornerReticle} ${styles.cornerTR}`} />
        <span className={`${styles.cornerReticle} ${styles.cornerBL}`} />
        <span className={`${styles.cornerReticle} ${styles.cornerBR}`} />

        {/* Top Header & Tab Toggle */}
        <div className={styles.cardHeader}>
          <div className={styles.titleArea}>
            <div className={styles.titleBadge}>
              {activeTab === 'delivery' ? (
                <FileText className={styles.headerIcon} size={22} />
              ) : (
                <UploadCloud className={styles.headerIcon} size={22} />
              )}
              <h2 className={styles.mainTitle}>
                {activeTab === 'delivery' ? 'Report Delivery Routing' : 'Upload Telemetry'}
              </h2>
            </div>
            <p className={styles.subtitle}>
              {activeTab === 'delivery'
                ? 'Specify recipient credentials and diagnostic export formats for fleet reports.'
                : 'Drag & drop raw vehicle CSV data or select a sample dataset below.'}
            </p>
          </div>

          {/* Tab Selector: Ingestion vs Report Routing */}
          <div className={styles.tabNav}>
            <button
              className={`${styles.tabItem} ${activeTab === 'upload' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('upload')}
              type="button"
            >
              <UploadCloud size={14} /> Ingestion
            </button>
            <button
              className={`${styles.tabItem} ${activeTab === 'delivery' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('delivery')}
              type="button"
            >
              <FileText size={14} /> Report Routing
              {deliveryInfo && <span className={styles.activeDot} title="Configured" />}
            </button>
          </div>
        </div>

        {/* TAB 1: Ingestion / Dropzone & Samples */}
        {activeTab === 'upload' ? (
          <>
            {/* High-Tech Dropzone */}
            <div
              className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${
                file ? styles.hasFile : ''
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              {/* Topographical Contour Waveform SVG */}
              <ContourWaveSvg theme="holo" />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept=".csv"
                style={{ display: 'none' }}
              />

              {!file ? (
                <div className={styles.dropContent}>
                  <div className={styles.iconCircle}>
                    <FileText size={38} className={styles.fileIcon} />
                    <ArrowUpRight size={18} className={styles.cornerUploadArrow} />
                  </div>
                  <p className={styles.dropPrompt}>Click or drag file to this area</p>
                  <p className={styles.hint}>
                    VehicleGuard AI will auto-map features & clean noisy data
                  </p>
                </div>
              ) : (
                <div className={styles.fileContent}>
                  <div className={styles.successBadge}>
                    <CheckCircle2 size={32} className={styles.successIcon} />
                  </div>
                  <div className={styles.fileInfo}>
                    <p className={styles.filename}>{file.name}</p>
                    <p className={styles.filesize}>
                      {(file.size / 1024).toFixed(2)} KB • Ready for Ingestion
                    </p>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    type="button"
                  >
                    Remove File
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className={styles.error}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {file && (
              <button
                className={styles.uploadBtn}
                onClick={uploadFile}
                disabled={isUploading}
                type="button"
              >
                {isUploading ? (
                  <span className={styles.processingText}>
                    <Cpu className={styles.spinIcon} size={18} />
                    AI is processing & training unsupervised models...
                  </span>
                ) : (
                  <span>Initiate Telemetry Analysis & Anomaly Detection</span>
                )}
              </button>
            )}

            {!file && (
              <div className={styles.samplesSection}>
                <div className={styles.dividerRow}>
                  <span className={styles.dividerLine} />
                  <p className={styles.samplesTitle}>— OR TRY INSTANT SAMPLE DATASETS —</p>
                  <span className={styles.dividerLine} />
                </div>

                <div className={styles.sampleButtons}>
                  <button
                    className={`${styles.sampleBtn} ${styles.btnTelematics}`}
                    onClick={() => handleSampleClick('Telematicsdata.csv', 'Telematicsdata.csv')}
                    disabled={isUploading}
                    type="button"
                  >
                    <div
                      className={styles.sampleIconWrapper}
                      style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}
                    >
                      <Sparkles size={16} />
                    </div>
                    <div className={styles.sampleTextCol}>
                      <span className={styles.sampleLabel}>Telematics Data</span>
                      <span className={styles.sampleSub}>Log</span>
                    </div>
                  </button>

                  <button
                    className={`${styles.sampleBtn} ${styles.btnStandard}`}
                    onClick={() =>
                      handleSampleClick('sample_vehicle_telemetry.csv', 'standard_telemetry.csv')
                    }
                    disabled={isUploading}
                    type="button"
                  >
                    <div
                      className={styles.sampleIconWrapper}
                      style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}
                    >
                      <Layers size={16} />
                    </div>
                    <div className={styles.sampleTextCol}>
                      <span className={styles.sampleLabel}>Standard</span>
                      <span className={styles.sampleSub}>Telemetry</span>
                    </div>
                  </button>

                  <button
                    className={`${styles.sampleBtn} ${styles.btnCanbus}`}
                    onClick={() =>
                      handleSampleClick('sample_can_bus_unstandardized.csv', 'can_bus_raw.csv')
                    }
                    disabled={isUploading}
                    type="button"
                  >
                    <div
                      className={styles.sampleIconWrapper}
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
                    >
                      <FileSpreadsheet size={16} />
                    </div>
                    <div className={styles.sampleTextCol}>
                      <span className={styles.sampleLabel}>Raw CAN-Bus</span>
                      <span className={styles.sampleSub}>Log</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* TAB 2: Delivery & Contact Details (from Sample Photo 1) */
          <ReportDeliveryForm
            onSave={(info) => {
              setDeliveryInfo(info);
              setActiveTab('upload');
            }}
            onClose={() => setActiveTab('upload')}
          />
        )}
      </div>
    </div>
  );
}
