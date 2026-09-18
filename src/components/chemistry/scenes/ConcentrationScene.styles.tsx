// Styles for the Concentration scene.

export function ConcentrationSceneStyles() {
  return (
    <style>{`
      .co-root {
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
      .co-header {
        display: flex;
        align-items: baseline;
        gap: 12px;
        flex-wrap: wrap;
      }
      .co-title {
        font-size: 18px;
        font-weight: 700;
        color: #581C87;
      }
      .co-eq {
        font-family: ui-monospace, monospace;
        background: rgba(147, 51, 234, 0.06);
        border: 1px solid rgba(147, 51, 234, 0.18);
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 14px;
        color: #581C87;
        font-weight: 600;
      }
      .co-section-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #71717A;
        font-weight: 600;
      }
      .co-stage {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 760px) {
        .co-stage {
          grid-template-columns: 1fr;
        }
      }
      .co-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 14px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
      }
      .co-ctrl {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .co-ctrl-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .co-ctrl-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #71717A;
        font-weight: 600;
      }
      .co-ctrl-value {
        font-size: 13px;
        font-weight: 700;
        color: #581C87;
        font-family: ui-monospace, monospace;
      }
      .co-ctrl input[type="range"] {
        accent-color: #9333EA;
        width: 100%;
      }
      .co-solute {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .co-solute-chip {
        padding: 3px 8px;
        background: #F4F4F5;
        border: 1px solid transparent;
        border-radius: 999px;
        cursor: pointer;
        font-size: 11px;
        color: #3F3F46;
        font-family: ui-monospace, monospace;
      }
      .co-solute-chip:hover { background: #E4E4E7; }
      .co-solute-chip.active {
        background: rgba(147, 51, 234, 0.10);
        border-color: #9333EA;
        color: #581C87;
        font-weight: 600;
      }
      .co-grams-input {
        padding: 6px 8px;
        border: 1px solid #D4D4D8;
        border-radius: 6px;
        background: #fff;
        font-size: 12px;
        color: #18181B;
        font-family: ui-monospace, monospace;
      }
      .co-grams-input:focus {
        outline: 2px solid #9333EA;
        outline-offset: 1px;
      }
      .co-grams-hint {
        font-size: 10px;
        color: #71717A;
        font-family: ui-monospace, monospace;
      }
      .co-dilute-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: rgba(147, 51, 234, 0.08);
        border: 1px solid rgba(147, 51, 234, 0.30);
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        color: #581C87;
        font-weight: 600;
        transition: all 0.12s;
      }
      .co-dilute-btn:hover {
        background: rgba(147, 51, 234, 0.14);
      }
      .co-dilute-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .co-dilute-preview {
        font-family: ui-monospace, monospace;
        font-size: 11px;
        color: #9333EA;
      }

      .co-flask-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 14px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
      }
      .co-flask {
        position: relative;
        width: 200px;
        height: 320px;
        background: linear-gradient(180deg, #FAFAFA, #F4F4F5);
        border-radius: 10px 10px 30px 30px;
        border: 2px solid #18181B;
        overflow: hidden;
      }
      .co-flask-liquid {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        transition: height 0.4s, background 0.4s, opacity 0.4s;
      }
      .co-flask-particles {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .co-particle {
        position: absolute;
        border-radius: 50%;
        transition: all 0.4s ease-out;
        border: 1px solid rgba(0,0,0,0.18);
      }
      .co-flask-ticks {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 14px 0;
      }
      .co-flask-tick {
        width: 12px;
        height: 1px;
        background: rgba(0, 0, 0, 0.3);
        font-size: 9px;
        color: rgba(0, 0, 0, 0.6);
        text-align: left;
        font-family: ui-monospace, monospace;
        position: relative;
      }
      .co-flask-tick::before {
        content: attr(data-label);
        position: absolute;
        right: 14px;
        top: -5px;
        white-space: nowrap;
      }
      .co-flask-tag {
        position: absolute;
        top: 8px;
        left: 8px;
        padding: 3px 8px;
        background: rgba(255,255,255,0.92);
        border: 1px solid #E4E4E7;
        border-radius: 6px;
        font-family: ui-monospace, monospace;
        font-size: 11px;
        font-weight: 700;
        color: #581C87;
      }
      .co-flask-label {
        font-size: 13px;
        color: #52525B;
        font-family: ui-monospace, monospace;
        font-weight: 700;
      }

      /* ---- Stat cards ---- */
      .co-stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 8px;
      }
      .co-stat {
        padding: 10px 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .co-stat-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #71717A;
        font-weight: 600;
      }
      .co-stat-value {
        font-size: 16px;
        font-weight: 700;
        color: #18181B;
        font-family: ui-monospace, monospace;
      }

      /* ---- Step-by-step math ---- */
      .co-math {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 14px 16px;
        background: linear-gradient(180deg, #FAF5FF, #FFFFFF);
        border: 1px solid rgba(147, 51, 234, 0.18);
        border-radius: 10px;
        font-family: ui-monospace, monospace;
        font-size: 14px;
        line-height: 1.6;
        color: #18181B;
      }
      .co-math-line {
        display: flex;
        gap: 6px;
        align-items: center;
      }
      .co-math .op {
        color: #9333EA;
        font-weight: 700;
      }
      .co-math .num {
        color: #52525B;
      }
      .co-math .num-result {
        color: #581C87;
        font-weight: 700;
      }

      /* ---- Concept footer ---- */
      .co-concept {
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
      .co-concept-icon {
        flex-shrink: 0;
        font-size: 14px;
      }
    `}</style>
  )
}
