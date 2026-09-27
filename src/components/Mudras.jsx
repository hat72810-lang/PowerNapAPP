import React from "react";

export const RestMudraSVG = () => (
  <div className="mudra-svg-container" style={{ margin: "4px auto", display: "flex", justifyContent: "center" }}>
    <svg viewBox="0 0 200 220" width="130" height="140" className="mudra-hand-svg">
      <filter id="glow-chin-react" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <g stroke="#00e5ff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-chin-react)">
        {/* 手首と手のひら */}
        <path d="M75 190 C75 160, 65 140, 60 115 C55 90, 60 70, 68 50 C72 40, 80 40, 85 52 C92 70, 95 95, 95 115" />
        {/* 人差し指の輪 */}
        <path d="M85 52 C88 45, 98 42, 108 48 C118 55, 122 68, 118 78 C112 90, 100 98, 88 95" />
        {/* 親指 */}
        <path d="M60 115 C68 112, 85 105, 98 88 C105 78, 108 68, 106 60" />
        {/* 中指 */}
        <path d="M95 115 C95 85, 98 50, 104 28 C107 18, 117 18, 122 28 C126 48, 122 80, 120 110" />
        {/* 薬指 */}
        <path d="M120 110 C122 85, 126 58, 131 38 C134 28, 143 28, 147 38 C150 55, 145 85, 140 115" />
        {/* 小指 */}
        <path d="M140 115 C143 95, 148 72, 153 55 C156 46, 164 47, 167 56 C169 72, 162 105, 155 130 C145 155, 130 190, 130 190" />
      </g>
    </svg>
  </div>
);

export const AwakeMudraSVG = () => (
  <div className="mudra-svg-container" style={{ margin: "4px auto", display: "flex", justifyContent: "center" }}>
    <svg viewBox="0 0 200 220" width="130" height="140" className="mudra-hand-svg">
      <filter id="glow-surya-react" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <g stroke="#ff6e40" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-surya-react)">
        {/* 手首と手のひら */}
        <path d="M75 190 C75 160, 65 140, 60 115 C55 90, 60 70, 68 50 C72 40, 80 40, 85 52 C92 70, 95 95, 95 115" />
        {/* 人差し指（まっすぐ伸びる） */}
        <path d="M85 52 C88 35, 92 18, 98 10 C102 5, 110 8, 112 18 C115 35, 110 70, 108 95" />
        {/* 中指（まっすぐ伸びる） */}
        <path d="M108 95 C110 70, 115 35, 120 15 C124 5, 132 8, 134 20 C136 40, 130 80, 128 105" />
        {/* 薬指（折れて親指と合わさる） */}
        <path d="M128 105 C125 90, 115 80, 100 82 C90 84, 85 95, 88 105 C92 115, 105 118, 118 112" />
        {/* 親指（薬指を押さえる） */}
        <path d="M60 115 C68 112, 85 105, 96 95 C102 88, 105 80, 100 82" />
        {/* 小指（まっすぐ伸びる） */}
        <path d="M128 105 C135 90, 142 65, 148 45 C152 35, 160 38, 162 48 C165 65, 158 100, 150 130 C140 155, 130 190, 130 190" />
      </g>
    </svg>
  </div>
);
