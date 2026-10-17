"use client";
import React, { useState } from 'react';
import { Send, UserCheck, Mail, Building2, Briefcase, FileText, Phone, CheckCircle2, ArrowLeft } from 'lucide-react';
import styles from './ReportDeliveryForm.module.css';

export interface DeliveryContactInfo {
  fullNames: string;
  email: string;
  organization: string;
  jobTitle: string;
  reportFormat: string;
  emergencyPhone: string;
}

export default function ReportDeliveryForm({
  onSave,
  onClose,
}: {
  onSave?: (info: DeliveryContactInfo) => void;
  onClose?: () => void;
}) {
  const [formData, setFormData] = useState<DeliveryContactInfo>({
    fullNames: '',
    email: '',
    organization: '',
    jobTitle: '',
    reportFormat: 'PDF Comprehensive Anomaly Dossier',
    emergencyPhone: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email && !formData.fullNames) return;
    setSubmitted(true);
    if (onSave) {
      onSave(formData);
    }
    setTimeout(() => {
      if (onClose) onClose();
    }, 1800);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>
          Please provide user names and full contact details for report delivery:
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={styles.backBtn}
              id="delivery-back-btn"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            className={styles.submitBtn}
            id="submit-user-info-btn"
          >
            <Send size={15} />
            <span>Submit User Info</span>
          </button>
        </div>
      </div>

      {submitted ? (
        <div className={styles.successNotice}>
          <CheckCircle2 size={24} className={styles.successIcon} />
          <div>
            <h4>Report Delivery Profile Registered!</h4>
            <p>
              Diagnostic outputs will automatically stream to <strong>{formData.email || 'operator'}</strong> in{' '}
              <strong>{formData.reportFormat}</strong> format.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* Full Name */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <UserCheck size={14} className={styles.fieldIcon} /> Full Name(s):
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="fullNames"
                value={formData.fullNames}
                onChange={handleChange}
                placeholder="e.g. Dr. Alex Mercer, Fleet Lead"
                className={styles.input}
                required
              />
            </div>
          </div>

          {/* Primary Contact Email */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <Mail size={14} className={styles.fieldIcon} /> Primary Contact Email:
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="operator@telematics-guard.ai"
                className={styles.input}
                required
              />
            </div>
          </div>

          {/* Organization Name */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <Building2 size={14} className={styles.fieldIcon} /> Organization Name:
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="e.g. Autonomous Fleet Dynamics Ltd."
                className={styles.input}
              />
            </div>
          </div>

          {/* Job Title */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <Briefcase size={14} className={styles.fieldIcon} /> Job Title:
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="Chief Vehicle Telematics Architect"
                className={styles.input}
              />
            </div>
          </div>

          {/* Preferred Report Format */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <FileText size={14} className={styles.fieldIcon} /> Preferred Report Format:
            </label>
            <div className={styles.inputWrapper}>
              <select
                name="reportFormat"
                value={formData.reportFormat}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="PDF Comprehensive Anomaly Dossier">PDF Comprehensive Anomaly Dossier</option>
                <option value="CSV Raw Anomaly & Telemetry Data">CSV Raw Anomaly & Telemetry Data</option>
                <option value="JSON Real-Time Telemetry Stream Buffer">JSON Real-Time Telemetry Stream Buffer</option>
                <option value="Interactive Web Diagnostic Archive">Interactive Web Diagnostic Archive</option>
              </select>
            </div>
          </div>

          {/* Emergency Contact Phone Number */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <Phone size={14} className={styles.fieldIcon} /> Emergency Contact Phone Number:
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                placeholder="+1 (555) 942-8392"
                className={styles.input}
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
