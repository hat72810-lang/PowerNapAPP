import React from "react";

export const RestMudraSVG = () => (
  <div className="mudra-svg-container" style={{ margin: "4px auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
    <img src="chin_mudra.jpg" alt="チン・ムドラー" class="mudra-hand-img" style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 20px rgba(0, 229, 255, 0.5)", border: "1.5px solid rgba(0, 229, 255, 0.4)", display: "block" }} />
  </div>
);

export const AwakeMudraSVG = () => (
  <div className="mudra-svg-container" style={{ margin: "4px auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
    <img src="surya_mudra.jpg" alt="スーリヤ・ムドラー" class="mudra-hand-img" style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 20px rgba(255, 145, 0, 0.5)", border: "1.5px solid rgba(255, 145, 0, 0.4)", display: "block" }} />
  </div>
);
