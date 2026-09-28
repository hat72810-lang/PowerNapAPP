/**
 * Mudra Data & High-Quality AI Generated Neon Hand Images
 */

const mudrasData = {
  rest: {
    id: "chin_mudra",
    name: "瞑想とリラックス",
    subtitle: "チン・ムドラーを結び、深呼吸を始めましょう。リラックスした姿勢で心を落ち着かせます。",
    description: "両手の人差し指と親指の指先を優しく合わせ、膝の上に置いて、副交感神経を刺激します。",
    benefits: [
      { title: "親指と人差し指を優しく接触させる", desc: "気の流れを整え、集中力を高めます。" },
      { title: "手のひらを上に向けて膝の上に置く", desc: "開かれた姿勢でリラックスを深めます。" }
    ],
    svg: `<div class="mudra-svg-container" style="width: 130px; height: 130px; margin: 4px auto; display: flex; justify-content: center; align-items: center;">
      <img src="chin_mudra.jpg" alt="チン・ムドラー (Chin Mudra)" class="mudra-hand-img" style="width: 130px; height: 130px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 20px rgba(0, 229, 255, 0.5), inset 0 0 15px rgba(0, 229, 255, 0.3); border: 1.5px solid rgba(0, 229, 255, 0.4); display: block;" />
    </div>`
  },
  awake: {
    id: "surya_mudra",
    name: "覚醒タイム",
    subtitle: "スーリヤ・ムドラーを結び、体内エネルギーを活性化させます。",
    description: "薬指を折り、親指で上から優しく押さえ、交感神経を刺激してすっきり覚醒します。",
    benefits: [
      { title: "薬指を折って親指で上から押さえる", desc: "体温と代謝を上昇させ、交感神経をONにします。" },
      { title: "人差し指・中指・小指をまっすぐ伸ばす", desc: "エネルギーを全身に循環させ、頭脳を鮮明にします。" }
    ],
    svg: `<div class="mudra-svg-container" style="width: 130px; height: 130px; margin: 4px auto; display: flex; justify-content: center; align-items: center;">
      <img src="surya_mudra.jpg" alt="スーリヤ・ムドラー (Surya Mudra)" class="mudra-hand-img" style="width: 130px; height: 130px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 20px rgba(255, 145, 0, 0.5), inset 0 0 15px rgba(255, 145, 0, 0.3); border: 1.5px solid rgba(255, 145, 0, 0.4); display: block;" />
    </div>`
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = mudrasData;
}
