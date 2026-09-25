"use client";
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, FileType, CheckCircle, AlertCircle, Sparkles, FileSpreadsheet } from 'lucide-react';
import styles from './DataUploader.module.css';

export default function DataUploader({ onUploadSuccess }: { onUploadSuccess: (data: any) => void }) {
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
  };

  const uploadFile = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('http://localhost:8000/api/upload', formData, {
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
    try {
      const res = await fetch(`/samples/${samplePath}`);
      const blob = await res.blob();
      const sampleFile = new File([blob], fileName, { type: 'text/csv' });
      setFile(sampleFile);

      const formData = new FormData();
      formData.append('file', sampleFile);

      const response = await axios.post('http://localhost:8000/api/upload', formData, {
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
    <div className={`glass-panel ${styles.container}`}>
      <div className={styles.header}>
        <h2><UploadCloud className={styles.icon} /> Upload Telemetry</h2>
        <p className={styles.subtitle}>Drag & drop raw vehicle CSV data or select a sample dataset below.</p>
      </div>
      
      <div 
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInput} 
          accept=".csv" 
          style={{ display: 'none' }} 
        />
        
        {!file ? (
          <div className={styles.dropContent}>
            <FileType size={48} className={styles.fileIcon} />
            <p>Click or drag file to this area</p>
            <p className={styles.hint}>VehicleGuard AI will auto-map features & clean noisy data</p>
          </div>
        ) : (
          <div className={styles.fileContent}>
            <CheckCircle size={32} className={styles.successIcon} />
            <p className={styles.filename}>{file.name}</p>
            <p className={styles.filesize}>{(file.size / 1024).toFixed(2)} KB</p>
            <button 
              className={styles.removeBtn} 
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      
      {file && (
        <button 
          className={styles.uploadBtn} 
          onClick={uploadFile} 
          disabled={isUploading}
        >
          {isUploading ? 'AI is processing & training models...' : 'Analyze Dataset'}
        </button>
      )}

      {!file && (
        <div className={styles.samplesSection}>
          <p className={styles.samplesTitle}>— Or Try Instant Sample Datasets —</p>
          <div className={styles.sampleButtons}>
            <button 
              className={styles.sampleBtn}
              onClick={() => handleSampleClick('sample_vehicle_telemetry.csv', 'standard_telemetry.csv')}
              disabled={isUploading}
            >
              <Sparkles size={16} color="#3b82f6" /> Standard Telemetry
            </button>
            <button 
              className={styles.sampleBtn}
              onClick={() => handleSampleClick('sample_can_bus_unstandardized.csv', 'can_bus_raw.csv')}
              disabled={isUploading}
            >
              <FileSpreadsheet size={16} color="#10b981" /> Raw CAN-Bus Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
