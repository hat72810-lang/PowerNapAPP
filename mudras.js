/**
 * Mudra Data & SVG Graphics Definitions (High precision hand outline graphics matching user reference)
 */

const mudrasData = {
  rest: {
    id: 'chin_mudra',
    name: '瞑想とリラックス',
    subtitle: 'チン・ムドラーを結び、深呼吸を始めましょう。リラックスした姿勢で心を落ち着かせます。',
    description: '両手の人差し指と親指の指先を優しく合わせ、膝の上に置いて、副交感神経を刺激します。',
    benefits: [
      { title: '親指と人差し指を優しく接触させる', desc: '気の流れを整え、集中力を高めます。' },
      { title: '手のひらを上に向けて膝の上に置く', desc: '開かれた姿勢でリラックスを深めます。' }
    ],
    svg: `
      <svg viewBox="0 0 200 240" class="mudra-svg" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;">
        <defs>
          <radialGradient id="glowGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffa726" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#ffa726" stop-opacity="0"/>
          </radialGradient>
          <filter id="neonGlowGold" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="100" cy="120" r="75" fill="url(#glowGold)" />

        <g stroke="#ffa726" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#neonGlowGold)">
          <path d="M 82,220 C 84,185 70,165 65,145" />
          <path d="M 122,220 C 120,185 128,165 124,140" />
          <path d="M 65,145 C 52,125 60,95 90,100 C 102,102 110,115 100,128 C 90,138 75,128 75,112 C 75,100 88,96 95,100" stroke="#ffb74d" />
          <path d="M 98,96 L 98,32 C 98,22 108,22 108,32 L 110,98" stroke="#ffa726" />
          <path d="M 110,98 L 118,40 C 118,30 127,30 127,40 L 123,105" stroke="#ffa726" />
          <path d="M 123,105 L 135,58 C 135,50 144,52 143,60 L 130,125" stroke="#ffa726" />
          <circle cx="95" cy="100" r="4.5" fill="#ffffff" stroke="#ffa726" stroke-width="2" />
        </g>
      </svg>
    `
  },
  awake: {
    id: 'surya_mudra',
    name: 'スーリヤ・ムドラー (Surya Mudra)',
    subtitle: '交感神経を刺激し、頭脳を鮮明にする印',
    description: '薬指を折って親指の付け根につけ、親指で薬指の第二関節を上から優しく押さえます。他の3本の指はまっすぐ伸ばします。体熱を上昇させ、代謝と交感神経を刺激してスッキリ覚醒させます。',
    benefits: [
      { title: '薬指を折って親指で上から押さえる', desc: '体温と代謝を上昇させ、交感神経をONにします。' },
      { title: '人差し指・中指・小指をまっすぐ伸ばす', desc: 'エネルギーを全身に循環させ、頭脳を鮮明にします。' }
    ],
    svg: `
      <svg viewBox="0 0 200 240" class="mudra-svg" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;">
        <defs>
          <radialGradient id="glowFire" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ff6e40" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="#ff6e40" stop-opacity="0"/>
          </radialGradient>
          <filter id="neonGlowFire" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="100" cy="120" r="75" fill="url(#glowFire)" />

        <g stroke="#ff6e40" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#neonGlowFire)">
          <path d="M 80,220 C 82,185 70,165 65,145" />
          <path d="M 124,220 C 122,185 130,165 125,140" />
          <path d="M 72,138 L 72,42 C 72,32 82,32 82,42 L 85,120" stroke="#ff8a65" />
          <path d="M 85,120 L 94,30 C 94,20 104,20 104,30 L 108,120" stroke="#ff8a65" />
          <path d="M 108,120 C 114,108 102,88 90,92 C 82,95 80,108 88,115 L 100,122" stroke="#ff3d00" stroke-width="5" />
          <path d="M 65,145 C 55,128 65,104 84,104 C 95,104 98,114 90,118" stroke="#ffea00" stroke-width="5" />
          <path d="M 115,125 L 132,60 C 132,50 141,52 140,62 L 126,135" stroke="#ff8a65" />
          <circle cx="90" cy="110" r="10" stroke="#ffea00" stroke-width="3" fill="none" />
          <circle cx="90" cy="110" r="3.5" fill="#ffffff" />
        </g>
      </svg>
    `
  }
};
