// Styles for the Electron Configuration scene.

export function ElectronConfigSceneStyles() {
  return (
    <style>{`
      .ec-root {
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
      .ec-header {
        display: flex;
        align-items: baseline;
        gap: 12px;
        flex-wrap: wrap;
      }
      .ec-title {
        font-size: 18px;
        font-weight: 700;
        color: #581C87;
      }
      .ec-eq {
        font-family: ui-monospace, monospace;
        background: rgba(147, 51, 234, 0.06);
        border: 1px solid rgba(147, 51, 234, 0.18);
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 14px;
        color: #581C87;
        font-weight: 600;
      }
      .ec-z-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 16px;
        background: linear-gradient(180deg, #FAF5FF, #FFFFFF);
        border: 1px solid rgba(147, 51, 234, 0.18);
        border-radius: 12px;
      }
      .ec-tile {
        width: 64px;
        height: 64px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #fff;
        border: 2px solid #9333EA;
        flex-shrink: 0;
      }
      .ec-tile .ec-tile-z {
        font-size: 10px;
        color: #71717A;
        font-weight: 600;
        letter-spacing: 0.05em;
      }
      .ec-tile .ec-tile-sym {
        font-size: 26px;
        font-weight: 700;
        color: #581C87;
        font-family: ui-monospace, monospace;
      }
      .ec-tile .ec-tile-name {
        font-size: 10px;
        color: #52525B;
        font-family: ui-sans-serif, system-ui;
      }
      .ec-z-meta {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px 12px;
      }
      .ec-z-meta-row {
        display: flex;
        gap: 6px;
        font-size: 12px;
      }
      .ec-z-meta-row .k {
        color: #71717A;
      }
      .ec-z-meta-row .v {
        color: #18181B;
        font-weight: 600;
        font-family: ui-monospace, monospace;
      }

      /* ---- Two-column layout: config + Bohr rings ---- */
      .ec-two-col {
        display: grid;
        grid-template-columns: minmax(280px, 1fr) 220px;
        gap: 14px;
      }
      @media (max-width: 700px) {
        .ec-two-col { grid-template-columns: 1fr; }
      }

      .ec-config {
        padding: 14px 16px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
      }
      .ec-config-head {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #71717A;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .ec-config-line {
        font-family: ui-monospace, monospace;
        font-size: 16px;
        color: #18181B;
        line-height: 1.6;
        word-break: break-word;
      }
      .ec-config-line .ec-tok {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 4px;
        margin: 0 1px;
      }
      .ec-config-line .ec-tok.core {
        background: rgba(147, 51, 234, 0.08);
        color: #6B21A8;
        font-weight: 600;
      }
      .ec-config-line .ec-tok.full {
        background: #ECFCCB;
        color: #3F6212;
      }
      .ec-config-line .ec-tok.partial {
        background: #FEF3C7;
        color: #92400E;
      }
      .ec-config-line .ec-tok.empty {
        background: transparent;
        color: #A1A1AA;
      }

      .ec-anomaly {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin-top: 10px;
        padding: 8px 10px;
        background: #FEF3C7;
        border: 1px solid #FCD34D;
        border-radius: 6px;
        font-size: 11px;
        color: #78350F;
        line-height: 1.4;
      }
      .ec-anomaly-icon {
        font-size: 13px;
        line-height: 1;
      }

      .ec-arrow-legend {
        display: flex;
        gap: 12px;
        font-size: 11px;
        color: #52525B;
        align-items: center;
        margin-top: 10px;
      }
      .ec-arrow-legend .up::before {
        content: '↑';
        color: #B45309;
        font-family: ui-monospace, monospace;
        font-weight: 700;
        margin-right: 4px;
      }
      .ec-arrow-legend .paired::before {
        content: '↑↓';
        color: #581C87;
        font-family: ui-monospace, monospace;
        font-weight: 700;
        margin-right: 4px;
      }

      /* ---- Bohr rings ---- */
      .ec-bohr-card {
        padding: 10px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .ec-bohr-svg {
        max-width: 100%;
        height: auto;
      }

      /* ---- Subshell grid ---- */
      .ec-subshells {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 8px;
      }
      .ec-sub {
        padding: 10px 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
        border-left: 4px solid #E4E4E7;
        transition: all 0.15s;
      }
        .ec-sub.filled {
          border-left-color: #15803D;
          background: linear-gradient(90deg, rgba(34, 197, 94, 0.06), #fff 30%);
        }
        .ec-sub.partial {
          border-left-color: #CA8A04;
          background: linear-gradient(90deg, rgba(234, 179, 8, 0.06), #fff 30%);
        }
        .ec-sub.empty {
          border-left-color: #E4E4E7;
          opacity: 0.55;
        }
        .ec-sub.filling {
          border: 1.5px solid #9333EA;
          animation: ec-pulse 1.4s ease-in-out infinite;
        }
        @keyframes ec-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.5); }
          50% { box-shadow: 0 0 0 6px rgba(147, 51, 234, 0); }
        }
      .ec-sub-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .ec-sub-label {
        font-family: ui-monospace, monospace;
        font-weight: 700;
        color: #18181B;
        font-size: 14px;
      }
      .ec-sub-cap {
        font-size: 10px;
        color: #71717A;
        font-family: ui-monospace, monospace;
      }
      .ec-sub-body {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ec-sub-fillorder {
        margin-left: auto;
        font-family: ui-monospace, monospace;
        font-size: 10px;
        color: #9333EA;
        background: rgba(147, 51, 234, 0.08);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
      }
      .ec-orbitals {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        flex: 1;
      }

      /* ---- Concept footer ---- */
      .ec-concept {
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
      .ec-concept-icon {
        flex-shrink: 0;
        font-size: 14px;
      }
    `}</style>
  )
}
