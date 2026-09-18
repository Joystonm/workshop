// Styles for the Titration scene.

export function TitrationSceneStyles() {
  return (
    <style>{`
      .ti-root {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 16px;
        min-height: 100%;
        background: #FAFAFA;
        font-family: ui-sans-serif, system-ui;
        color: #18181B;
        overflow-y: auto;
      }
      .ti-header {
        display: flex;
        align-items: baseline;
        gap: 12px;
        flex-wrap: wrap;
      }
      .ti-title {
        font-size: 18px;
        font-weight: 700;
        color: #581C87;
      }
      .ti-eq {
        font-family: ui-monospace, monospace;
        background: rgba(147, 51, 234, 0.06);
        border: 1px solid rgba(147, 51, 234, 0.18);
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 14px;
        color: #581C87;
        font-weight: 600;
      }
      .ti-section-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #71717A;
        font-weight: 600;
      }
      .ti-controls {
        display: grid;
        grid-template-columns: 2fr 1fr 2fr;
        gap: 10px;
        padding: 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
      }
      @media (max-width: 700px) {
        .ti-controls { grid-template-columns: 1fr; }
      }
      .ti-ctrl {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ti-ctrl label {
        font-size: 11px;
        color: #52525B;
        font-weight: 600;
      }
      .ti-ctrl select, .ti-ctrl input {
        padding: 6px 8px;
        border: 1px solid #D4D4D8;
        border-radius: 6px;
        background: #fff;
        font-size: 12px;
        color: #18181B;
        font-family: inherit;
      }
      .ti-ctrl select:focus, .ti-ctrl input:focus {
        outline: 2px solid #9333EA;
        outline-offset: 1px;
      }

      /* ---- Canvases ---- */
      .ti-canvases {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ti-plot-wrap {
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ti-plot-deriv { padding-top: 8px; padding-bottom: 8px; }
      .ti-plot {
        width: 100%;
        height: 200px;
        display: block;
      }
      .ti-plot-deriv .ti-plot {
        height: 100px;
      }

      /* ---- Side: flask + burette + indicator ---- */
      .ti-side {
        display: grid;
        grid-template-columns: auto auto 1fr;
        gap: 14px;
        align-items: stretch;
      }
      @media (max-width: 700px) {
        .ti-side { grid-template-columns: 1fr; }
      }

      .ti-flask-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
      }
      .ti-flask-bottle {
        width: 80px;
        height: 140px;
        border-radius: 6px 6px 30px 30px;
        border: 2px solid #18181B;
        position: relative;
        overflow: hidden;
        background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1));
      }
      .ti-flask-liquid {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        transition: background 0.4s;
        border-radius: 6px 6px 28px 28px;
      }
      .ti-flask-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: ui-monospace, monospace;
        font-size: 14px;
        font-weight: 700;
        color: #fff;
        text-shadow: 0 0 3px rgba(0,0,0,0.5);
        background: rgba(0,0,0,0.18);
        padding: 2px 8px;
        border-radius: 4px;
      }
      .ti-flask-meta {
        display: flex;
        gap: 4px;
      }
      .ti-flask-pill {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        padding: 2px 8px;
        border-radius: 999px;
        letter-spacing: 0.04em;
        background: #F4F4F5;
        color: #52525B;
        font-family: ui-monospace, monospace;
      }

      /* ---- Burette ---- */
      .ti-burette {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
      }
      .ti-burette-top {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .ti-burette-label {
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #71717A;
      }
      .ti-burette-drop-count {
        font-family: ui-monospace, monospace;
        font-size: 10px;
        color: #2563EB;
        font-weight: 600;
      }
      .ti-burette-svg {
        display: block;
      }

      /* ---- Indicator card ---- */
      .ti-indicator-card {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
      }
      .ti-indicator-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
      }
      .ti-indicator-chip {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 4px;
        border: 1px solid #E4E4E7;
        border-radius: 6px;
        background: #FAFAFA;
        cursor: pointer;
        font-size: 9px;
        color: #52525B;
        transition: all 0.12s;
      }
      .ti-indicator-chip:hover {
        background: #F4F4F5;
      }
      .ti-indicator-chip.active {
        border-color: #9333EA;
        background: rgba(147, 51, 234, 0.08);
        color: #581C87;
      }
      .ti-indicator-swatch {
        width: 22px;
        height: 22px;
        border-radius: 4px;
        border: 1px solid rgba(0,0,0,0.08);
        transition: background 0.3s;
      }
      .ti-indicator-name {
        font-size: 9px;
        font-weight: 600;
        text-align: center;
        line-height: 1.1;
      }
      .ti-indicator-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 4px;
        padding-top: 6px;
        border-top: 1px dashed #E4E4E7;
      }
      .ti-indicator-now {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* ---- Stat cards ---- */
      .ti-stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
        gap: 8px;
      }
      .ti-stat {
        padding: 10px 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ti-stat-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #71717A;
        font-weight: 600;
      }
      .ti-stat-value {
        font-size: 16px;
        font-weight: 700;
        color: #18181B;
        font-family: ui-monospace, monospace;
      }
      .ti-stat.warn .ti-stat-value { color: #B45309; }
      .ti-stat.equiv .ti-stat-value { color: #15803D; }

      /* ---- Concept footer ---- */
      .ti-concept {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 12px 14px;
        background: linear-gradient(180deg, #FFFBEB, #FFFFFF);
        border: 1px solid #FCD34D;
        border-radius: 8px;
        font-size: 12px;
        line-height: 1.5;
        color: #52525B;
      }
      .ti-concept-icon {
        flex-shrink: 0;
        font-size: 14px;
      }
    `}</style>
  )
}
