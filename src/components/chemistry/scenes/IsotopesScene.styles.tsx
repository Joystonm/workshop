// Styles for the Isotopes scene. Injected as a DOM <style> tag.

export function IsotopesSceneStyles() {
  return (
    <style>{`
      .iso-root {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 16px;
        gap: 14px;
        min-height: 100%;
        background: #FAFAFA;
        font-family: ui-sans-serif, system-ui;
        color: #18181B;
        overflow-y: auto;
      }
      .iso-header {
        display: flex;
        align-items: baseline;
        gap: 12px;
        flex-wrap: wrap;
      }
      .iso-title {
        font-size: 18px;
        font-weight: 700;
        color: #581C87;
      }
      .iso-sub {
        font-size: 12px;
        color: #71717A;
      }
      .iso-eq {
        font-family: ui-monospace, monospace;
        background: rgba(147, 51, 234, 0.06);
        border: 1px solid rgba(147, 51, 234, 0.18);
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 14px;
        color: #581C87;
        font-weight: 600;
      }
      .iso-section-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #71717A;
        font-weight: 600;
      }
      .iso-picker {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 8px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
      }
      .iso-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        background: #F4F4F5;
        border: 1px solid transparent;
        cursor: pointer;
        font-size: 12px;
        color: #3F3F46;
        font-weight: 500;
        transition: all 0.12s;
      }
      .iso-chip:hover {
        background: #E4E4E7;
      }
      .iso-chip.active {
        background: rgba(147, 51, 234, 0.10);
        border-color: #9333EA;
        color: #581C87;
        font-weight: 600;
      }
      .iso-chip .iso-chip-z {
        font-size: 10px;
        color: #A1A1AA;
        font-weight: 500;
      }

      /* ---- 3-zone grid: nucleus card (left) + stats column (right) ---- */
      .iso-grid-main {
        display: grid;
        grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr);
        gap: 14px;
      }
      @media (max-width: 700px) {
        .iso-grid-main { grid-template-columns: 1fr; }
      }
      .iso-nucleus-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 16px;
        background: linear-gradient(180deg, #FAF5FF, #FFFFFF);
        border: 1px solid rgba(147, 51, 234, 0.18);
        border-radius: 12px;
      }
      .iso-nucleus-pack {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .iso-nucleus-pack svg {
        display: block;
      }
      .iso-nucleus-pack circle {
        transition: r 0.25s ease-out, opacity 0.25s;
      }
      .iso-nucleus-glow {
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(147, 51, 234, 0.20), rgba(147, 51, 234, 0) 70%);
        pointer-events: none;
        z-index: 0;
      }
      .iso-nuc-overflow {
        font-size: 11px;
        color: #52525B;
        font-family: ui-monospace, monospace;
        font-weight: 600;
        padding: 4px 10px;
        background: #fff;
        border: 1px dashed #A1A1AA;
        border-radius: 999px;
      }
      .iso-nuc-legend {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #52525B;
        font-family: ui-monospace, monospace;
      }
      .iso-legend-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .iso-legend-dot.p { background: #DC2626; }
      .iso-legend-dot.n { background: #52525B; }
      .iso-legend-sep {
        color: #A1A1AA;
        margin: 0 4px;
      }
      .iso-decay-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .iso-decay-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        font-family: ui-monospace, monospace;
      }
      .iso-decay-symbol {
        font-weight: 700;
        font-size: 12px;
      }
      .iso-decay-daughter {
        font-size: 11px;
        color: #52525B;
        font-family: ui-monospace, monospace;
      }

      /* ---- Stat cards ---- */
      .iso-summary {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .iso-stat {
        padding: 10px 14px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
      }
      .iso-stat-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #71717A;
      }
      .iso-stat-value {
        font-size: 18px;
        font-weight: 700;
        color: #18181B;
        font-family: ui-monospace, monospace;
        margin-top: 2px;
      }

      /* ---- Isotope table ---- */
      .iso-table {
        display: grid;
        grid-template-columns: 90px 70px 1fr 1fr;
        gap: 1px;
        background: #E4E4E7;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
        overflow: hidden;
      }
      .iso-row {
        display: contents;
      }
      .iso-row > div {
        background: #fff;
        padding: 8px 12px;
        font-size: 12px;
      }
      .iso-row.head > div {
        background: #F4F4F5;
        font-weight: 600;
        color: #3F3F46;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .iso-row.active > div {
        background: rgba(147, 51, 234, 0.10);
      }
      .iso-row.active .iso-a {
        color: #581C87;
        font-weight: 700;
        border-left: 3px solid #9333EA;
        padding-left: 9px;
      }
      .iso-row-pin {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #9333EA;
        margin-right: 6px;
        vertical-align: middle;
      }
      .iso-a {
        font-family: ui-monospace, monospace;
        font-weight: 600;
        color: #18181B;
      }
      .iso-n {
        font-family: ui-monospace, monospace;
        color: #52525B;
      }
      .iso-hl {
        font-family: ui-monospace, monospace;
      }
      .iso-hl.stable {
        color: #15803D;
        font-weight: 600;
      }
      .iso-hl.radio {
        color: #B91C1C;
      }
      .iso-hl.syn {
        color: #6D28D9;
      }
      .iso-note {
        color: #52525B;
        font-size: 11px;
      }
      .iso-abundance {
        font-family: ui-monospace, monospace;
        color: #3F3F46;
      }

      /* ---- Stability band chart ---- */
      .iso-band-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
      }
      .iso-band-svg {
        max-width: 100%;
        height: auto;
      }
      .iso-band-legend {
        display: flex;
        gap: 12px;
        font-size: 10px;
        color: #71717A;
      }
      .iso-band-swatch {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 4px;
        vertical-align: middle;
      }
      .iso-band-swatch.stable { background: #15803D; }
      .iso-band-swatch.radio { background: #B91C1C; }
      .iso-band-swatch.band { background: #9333EA; opacity: 0.5; }

      /* ---- Concept footer ---- */
      .iso-concept {
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
      .iso-concept-icon {
        flex-shrink: 0;
        font-size: 14px;
      }
    `}</style>
  )
}
