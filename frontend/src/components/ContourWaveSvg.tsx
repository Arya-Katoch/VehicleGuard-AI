import React from 'react';

/**
 * Topographical contour waveform SVG that matches the inner dropzone texture
 * seen in the VehicleGuard-AI sample photos.
 */
export default function ContourWaveSvg({ theme = 'holo' }: { theme?: string }) {
  const isCockpit = theme === 'cockpit';
  const strokeColor = isCockpit ? 'rgba(74, 222, 128, 0.35)' : 'rgba(6, 182, 212, 0.35)';
  const highlightColor = isCockpit ? 'rgba(74, 222, 128, 0.7)' : 'rgba(56, 189, 248, 0.7)';

  return (
    <svg
      className="contour-wave-svg"
      viewBox="0 0 600 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.85,
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <defs>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={highlightColor} stopOpacity="0.25" />
          <stop offset="60%" stopColor={strokeColor} stopOpacity="0.08" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="waveFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.1" />
          <stop offset="50%" stopColor={highlightColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Subtle radial center ambient glow */}
      <rect x="0" y="0" width="600" height="220" fill="url(#centerGlow)" />

      {/* Topographic Elevation Curves (Waveform Rings) */}
      <path
        d="M 50 110 C 120 70, 200 40, 300 40 C 400 40, 480 70, 550 110"
        stroke="url(#waveFade)"
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />
      <path
        d="M 70 110 C 135 78, 210 52, 300 52 C 390 52, 465 78, 530 110"
        stroke={strokeColor}
        strokeWidth="1"
      />
      <path
        d="M 90 110 C 150 86, 220 64, 300 64 C 380 64, 450 86, 510 110"
        stroke={strokeColor}
        strokeWidth="1.2"
      />
      <path
        d="M 110 110 C 165 92, 230 76, 300 76 C 370 76, 435 92, 490 110"
        stroke="url(#waveFade)"
        strokeWidth="1.5"
      />
      <path
        d="M 130 110 C 180 98, 240 88, 300 88 C 360 88, 420 98, 470 110"
        stroke={highlightColor}
        strokeWidth="1.2"
      />

      {/* Center inner focal ring */}
      <ellipse
        cx="300"
        cy="110"
        rx="140"
        ry="18"
        stroke="url(#waveFade)"
        strokeWidth="1.2"
        strokeDasharray="6 4"
      />

      {/* Lower contour wave lines */}
      <path
        d="M 130 110 C 180 122, 240 132, 300 132 C 360 132, 420 122, 470 110"
        stroke={highlightColor}
        strokeWidth="1.2"
      />
      <path
        d="M 110 110 C 165 128, 230 144, 300 144 C 370 144, 435 128, 490 110"
        stroke="url(#waveFade)"
        strokeWidth="1.5"
      />
      <path
        d="M 90 110 C 150 134, 220 156, 300 156 C 380 156, 450 134, 510 110"
        stroke={strokeColor}
        strokeWidth="1.2"
      />
      <path
        d="M 70 110 C 135 142, 210 168, 300 168 C 390 168, 465 142, 530 110"
        stroke={strokeColor}
        strokeWidth="1"
      />
      <path
        d="M 50 110 C 120 150, 200 180, 300 180 C 400 180, 480 150, 550 110"
        stroke="url(#waveFade)"
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />

      {/* Crosshair telemetry calibration ticks */}
      <line x1="300" y1="20" x2="300" y2="35" stroke={highlightColor} strokeWidth="1.5" />
      <line x1="300" y1="185" x2="300" y2="200" stroke={highlightColor} strokeWidth="1.5" />
      <line x1="40" y1="110" x2="55" y2="110" stroke={highlightColor} strokeWidth="1.5" />
      <line x1="545" y1="110" x2="560" y2="110" stroke={highlightColor} strokeWidth="1.5" />

      {/* Digital telemetry data dots */}
      <circle cx="160" cy="94" r="2" fill={highlightColor} />
      <circle cx="440" cy="94" r="2" fill={highlightColor} />
      <circle cx="210" cy="148" r="2" fill={highlightColor} />
      <circle cx="390" cy="148" r="2" fill={highlightColor} />
    </svg>
  );
}
