// Styles for the pH Scale scene.

export function PhScaleSceneStyles() {
  return (
    <style>{`
      .ph-root {
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
      .ph-header {
        display: flex;
        align-items: baseline;
        gap: 12px;
        flex-wrap: wrap;
      }
      .ph-title {
        font-size: 18px;
        font-weight: 700;
        color: #581C87;
      }
      .ph-eq {
        font-family: ui-monospace, monospace;
        background: rgba(147, 51, 234, 0.06);
        border: 1px solid rgba(147, 51, 234, 0.18);
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 14px;
        color: #581C87;
        font-weight: 600;
      }
      .ph-section-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #71717A;
        font-weight: 600;
        margin-bottom: 6px;
      }
      .ph-scale {
        display: flex;
        height: 56px;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #E4E4E7;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
      }
      .ph-marker {
        position: relative;
        flex: 1;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding-bottom: 4px;
        font-size: 9px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.7);
        font-family: ui-monospace, monospace;
      }
      .ph-marker span {
        background: rgba(255, 255, 255, 0.7);
        padding: 1px 4px;
        border-radius: 3px;
      }
      .ph-pointer {
        position: absolute;
        top: -10px;
        transform: translateX(-50%);
        font-size: 18px;
        color: #18181B;
        line-height: 1;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
        transition: left 0.2s ease-out;
      }
      .ph-pointer::before {
        content: '▼';
        font-size: 14px;
        color: #18181B;
      }
      .ph-pointer-label {
        position: absolute;
        top: -32px;
        transform: translateX(-50%);
        background: #18181B;
        color: #fff;
        font-size: 11px;
        font-family: ui-monospace, monospace;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;
        white-space: nowrap;
      }
      .ph-pointer-label::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid #18181B;
      }
      .ph-scale-frame {
        position: relative;
        padding-top: 40px;
        margin-top: 12px;
      }
      .ph-picker {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
      }
      .ph-picker select {
        flex: 1;
        padding: 6px 10px;
        border: 1px solid #D4D4D8;
        border-radius: 6px;
        background: #fff;
        font-size: 12px;
        color: #18181B;
        font-family: inherit;
        cursor: pointer;
      }
      .ph-picker select:focus {
        outline: 2px solid #9333EA;
        outline-offset: 1px;
      }
      .ph-picker label {
        font-size: 11px;
        color: #52525B;
        font-weight: 600;
      }

      /* ---- Logarithmic [H+]/[OH-] bar ---- */
      .ph-log-block {
        padding: 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ph-log-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ph-log-label {
        width: 48px;
        font-family: ui-monospace, monospace;
        font-size: 11px;
        color: #52525B;
        font-weight: 600;
      }
      .ph-log-bar {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(14, 1fr);
        gap: 1px;
        border-radius: 4px;
        overflow: hidden;
      }
      .ph-log-seg {
        position: relative;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .ph-log-seg.active {
        outline: 2px solid #18181B;
        outline-offset: -1px;
        z-index: 1;
        font-weight: 700;
      }
      .ph-log-seg-label {
        font-family: ui-monospace, monospace;
        font-size: 8px;
        color: rgba(0, 0, 0, 0.55);
        background: rgba(255, 255, 255, 0.7);
        padding: 0 2px;
        border-radius: 2px;
      }
      .ph-log-seg.active .ph-log-seg-label {
        color: rgba(0, 0, 0, 0.85);
      }

      /* ---- Indicator swatches ---- */
      .ph-indicators {
        padding: 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
      }
      .ph-indicator-row {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 8px;
      }
      .ph-indicator {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px;
        background: #FAFAFA;
        border: 1px solid #E4E4E7;
        border-radius: 6px;
        transition: all 0.2s;
      }
      .ph-indicator:hover {
        background: #F4F4F5;
      }
      .ph-indicator-swatch {
        height: 36px;
        border-radius: 4px;
        border: 1px solid rgba(0,0,0,0.08);
        transition: background 0.3s;
      }
      .ph-indicator-name {
        font-size: 11px;
        font-weight: 600;
        color: #18181B;
      }
      .ph-indicator-range {
        font-size: 9px;
        color: #71717A;
        font-family: ui-monospace, monospace;
      }

      /* ---- Stat cards ---- */
      .ph-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 8px;
      }
      .ph-stat {
        padding: 12px 14px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ph-stat-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #71717A;
        font-weight: 600;
      }
      .ph-stat-value {
        font-size: 18px;
        font-weight: 700;
        color: #18181B;
        font-family: ui-monospace, monospace;
      }
      .ph-stat.acid .ph-stat-value { color: #DC2626; }
      .ph-stat.base .ph-stat-value { color: #2563EB; }
      .ph-stat.neutral .ph-stat-value { color: #15803D; }

      .ph-info {
        padding: 12px 14px;
        background: #fff;
        border-left: 3px solid #9333EA;
        border-radius: 4px;
        font-size: 12px;
        color: #3F3F46;
        line-height: 1.5;
      }

      /* ---- Flask(s) ---- */
      .ph-flask-row {
        display: flex;
        gap: 12px;
        align-items: flex-end;
        justify-content: center;
        padding: 14px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
        position: relative;
      }
      .ph-flask {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .ph-flask-tag {
        font-family: ui-monospace, monospace;
        font-size: 10px;
        color: #52525B;
        font-weight: 600;
      }
      .ph-flask-bottle {
        width: 100px;
        height: 180px;
        border-radius: 8px 8px 36px 36px;
        border: 2px solid #18181B;
        position: relative;
        overflow: hidden;
        background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1));
      }
      .ph-flask-liquid {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 78%;
        border-radius: 8px 8px 32px 32px;
        background: var(--liq-color, #9333EA);
        transition: all 0.4s;
      }
      .ph-flask-liquid::before {
        content: '';
        position: absolute;
        top: -2px;
        left: 4px;
        right: 4px;
        height: 6px;
        background: rgba(255,255,255,0.25);
        border-radius: 50%;
      }
      .ph-flask-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: ui-monospace, monospace;
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        text-shadow: 0 0 4px rgba(0,0,0,0.5);
        background: rgba(0,0,0,0.18);
        padding: 4px 10px;
        border-radius: 4px;
      }
      .ph-flask-meta {
        display: flex;
        gap: 4px;
      }
      .ph-flask-pill {
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 999px;
        letter-spacing: 0.04em;
      }
      .ph-flask-pill.strong {
        background: #DCFCE7;
        color: #15803D;
      }
      .ph-flask-pill.weak {
        background: #FEF3C7;
        color: #92400E;
      }
      .ph-flask-delta {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 0 8px;
      }
      .ph-flask-delta-label {
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        color: #71717A;
        letter-spacing: 0.06em;
      }
      .ph-flask-delta-value {
        font-family: ui-monospace, monospace;
        font-size: 22px;
        font-weight: 700;
        color: #9333EA;
      }

      /* ---- Concept footer ---- */
      .ph-concept {
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
      .ph-concept-icon {
        flex-shrink: 0;
        font-size: 14px;
      }
    `}</style>
  )
}
