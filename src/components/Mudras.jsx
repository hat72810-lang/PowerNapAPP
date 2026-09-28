import React from "react";

export const RestMudraSVG = () => (
  <div className="mudra-svg-container" style={{ margin: "4px auto", display: "flex", justifyContent: "center" }}>
    <svg viewBox="0 0 200 200" width="130" height="130" className="mudra-hand-svg">
      <defs>
        <filter id="glow-chin-react" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="grad-chin-react" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c4dff" />
          <stop offset="50%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#64ffda" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="1.5" strokeDasharray="6 4" />
      <path d="M 82 180 C 75 160 62 145 55 125 C 50 110 56 95 72 82 C 82 74 92 82 92 90 C 92 78 86 65 96 60 C 104 56 112 65 110 85 L 106 32 C 106 24 116 24 118 32 L 122 80 L 128 42 C 128 34 138 34 140 42 L 138 88 L 150 62 C 150 55 160 58 160 65 L 145 120 C 140 140 128 160 118 180 Z" fill="rgba(0, 229, 255, 0.08)" />
      <path d="M 82 180 C 76 160 64 145 56 126 C 50 110 56 94 72 82 C 82 74 92 82 92 90" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3" strokeLinecap="round" filter="url(#glow-chin-react)" />
      <path d="M 94 112 C 94 92 86 68 96 60 C 104 56 112 65 110 86 C 108 98 106 115 106 122" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3" strokeLinecap="round" filter="url(#glow-chin-react)" />
      <circle cx="91" cy="74" r="5" fill="#00e5ff" filter="url(#glow-chin-react)" />
      <circle cx="91" cy="74" r="2" fill="#ffffff" />
      <path d="M 106 120 L 107 32 C 107 24 117 24 117 32 L 120 122" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-chin-react)" />
      <path d="M 120 122 L 129 42 C 129 34 139 34 139 42 L 136 125" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-chin-react)" />
      <path d="M 136 125 L 151 62 C 151 55 161 58 160 65 L 144 122 C 138 142 126 160 118 180" fill="none" stroke="url(#grad-chin-react)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-chin-react)" />
      <path d="M 72 135 C 88 142 108 136 124 128" fill="none" stroke="rgba(0, 229, 255, 0.4)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

export const AwakeMudraSVG = () => (
  <div className="mudra-svg-container" style={{ margin: "4px auto", display: "flex", justifyContent: "center" }}>
    <svg viewBox="0 0 200 200" width="130" height="130" className="mudra-hand-svg">
      <defs>
        <filter id="glow-surya-react" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="grad-surya-react" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff3d00" />
          <stop offset="50%" stopColor="#ff9100" />
          <stop offset="100%" stopColor="#ffea00" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,145,0,0.2)" strokeWidth="1.5" strokeDasharray="6 4" />
      <path d="M 82 180 C 75 160 62 145 55 125 C 48 108 55 90 75 92 L 72 40 C 72 32 82 32 84 40 L 92 118 L 97 28 C 97 20 107 20 109 28 L 114 118 L 138 126 L 148 60 C 148 53 158 56 158 63 L 144 120 C 138 140 126 160 118 180 Z" fill="rgba(255, 145, 0, 0.08)" />
      <path d="M 82 180 C 76 160 64 145 56 126 C 48 108 55 90 75 92" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3" strokeLinecap="round" filter="url(#glow-surya-react)" />
      <path d="M 75 120 L 73 40 C 73 32 83 32 85 40 L 91 118" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-surya-react)" />
      <path d="M 91 118 L 98 28 C 98 20 108 20 110 28 L 115 118" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-surya-react)" />
      <path d="M 115 118 C 118 100 110 88 95 94 C 88 98 94 110 105 110" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3" strokeLinecap="round" filter="url(#glow-surya-react)" />
      <path d="M 56 126 C 54 110 65 92 82 92 C 94 92 102 98 98 104" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-surya-react)" />
      <circle cx="94" cy="96" r="5" fill="#ffea00" filter="url(#glow-surya-react)" />
      <circle cx="94" cy="96" r="2" fill="#ffffff" />
      <path d="M 125 122 L 149 60 C 149 53 159 56 158 63 L 144 120 C 138 142 126 160 118 180" fill="none" stroke="url(#grad-surya-react)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-surya-react)" />
      <path d="M 72 135 C 88 142 108 136 124 128" fill="none" stroke="rgba(255, 145, 0, 0.4)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);
