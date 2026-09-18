// Styles for the Reaction Simulator scene.

export function ReactionSimulatorSceneStyles() {
  return (
    <style>{`
      .rx-root {
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
      .rx-header {
        display: flex;
        align-items: baseline;
        gap: 12px;
        flex-wrap: wrap;
      }
      .rx-title {
        font-size: 18px;
        font-weight: 700;
        color: #581C87;
      }
      .rx-eq {
        font-family: ui-monospace, monospace;
        background: rgba(147, 51, 234, 0.06);
        border: 1px solid rgba(147, 51, 234, 0.18);
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 14px;
        color: #581C87;
        font-weight: 600;
      }
      .rx-section-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #71717A;
        font-weight: 600;
        margin-bottom: 6px;
        display: block;
      }
      .rx-picker {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
      }
      .rx-picker select {
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
      .rx-picker select:focus {
        outline: 2px solid #9333EA;
        outline-offset: 1px;
      }
      .rx-picker label {
        font-size: 11px;
        color: #52525B;
        font-weight: 600;
      }
      .rx-eq-card {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
        padding: 22px;
        background: linear-gradient(180deg, #FAF5FF, #FFFFFF);
        border: 1px solid rgba(147, 51, 234, 0.18);
        border-radius: 12px;
        font-family: ui-monospace, monospace;
        font-size: 20px;
        flex-wrap: wrap;
      }
      .rx-eq-side {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .rx-eq-side.products { align-items: flex-start; }
      .rx-eq-side.reactants { align-items: flex-end; }
      .rx-eq-side .label {
        font-family: ui-sans-serif, system-ui;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #71717A;
      }
      .rx-eq-mol-list {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .rx-eq-mol {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
        margin: 2px;
      }
      .rx-eq-mol.products {
        background: #ECFCCB;
        border-color: #BBF7D0;
      }
      .rx-eq-coef {
        font-size: 13px;
        color: #9333EA;
        font-weight: 700;
      }
      .rx-eq-formula {
        font-weight: 600;
        color: #18181B;
        font-size: 18px;
      }
      .rx-eq-phase {
        font-size: 10px;
        color: #71717A;
        font-family: ui-sans-serif, system-ui;
      }
      .rx-eq-plus {
        font-size: 20px;
        color: #52525B;
        font-weight: 600;
      }
      .rx-eq-arrow {
        font-size: 32px;
        color: #9333EA;
        font-weight: 700;
        padding: 0 12px;
      }

      /* ---- Atom cartoon ---- */
      .rx-cartoon-card {
        padding: 14px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
      }
      .rx-cartoon-row {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 14px;
        align-items: center;
      }
      @media (max-width: 700px) {
        .rx-cartoon-row { grid-template-columns: 1fr; }
      }
      .rx-cartoon {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .rx-atom-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .rx-atom-label {
        font-family: ui-monospace, monospace;
        font-size: 11px;
        color: #52525B;
        font-weight: 600;
        width: 50px;
      }
      .rx-atom-dots {
        display: flex;
        align-items: center;
        gap: 3px;
        flex-wrap: wrap;
      }
      .rx-atom-dot {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: 700;
        border: 1px solid rgba(0,0,0,0.15);
        transition: transform 0.4s ease-out;
      }
      .rx-atom-more {
        font-family: ui-monospace, monospace;
        font-size: 10px;
        color: #71717A;
        font-weight: 600;
      }
      .rx-cartoon-arrow {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .rx-cartoon-pill {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(147, 51, 234, 0.10);
        color: #581C87;
        font-family: ui-monospace, monospace;
      }
      .rx-cartoon-arrow-line {
        font-size: 22px;
        color: #9333EA;
        font-weight: 700;
      }

      /* ---- Energy diagram ---- */
      .rx-energy-card {
        padding: 12px 14px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .rx-energy-svg {
        max-width: 100%;
        height: auto;
      }

      .rx-summary {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 8px;
      }
      .rx-stat {
        padding: 12px 14px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .rx-stat-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #71717A;
        font-weight: 600;
      }
      .rx-stat-value {
        font-size: 16px;
        font-weight: 700;
        color: #18181B;
        font-family: ui-monospace, monospace;
      }
      .rx-stat.exo .rx-stat-value { color: #DC2626; }
      .rx-stat.endo .rx-stat-value { color: #2563EB; }

      .rx-info {
        padding: 12px 14px;
        background: #fff;
        border-left: 3px solid #9333EA;
        border-radius: 4px;
        font-size: 12px;
        color: #3F3F46;
        line-height: 1.5;
      }
      .rx-info-head {
        margin-bottom: 8px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #71717A;
        font-weight: 600;
      }
      .rx-desc {
        margin-top: 10px;
      }

      .rx-balance {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      @media (max-width: 700px) {
        .rx-balance { grid-template-columns: 1fr; }
      }
      .rx-balance-block {
        padding: 12px;
        background: #fff;
        border: 1px solid #E4E4E7;
        border-radius: 8px;
      }
      .rx-balance-head {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #71717A;
        font-weight: 600;
        margin-bottom: 6px;
      }
      .rx-balance-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px 12px;
        font-family: ui-monospace, monospace;
        font-size: 12px;
      }
      .rx-balance-grid .el {
        color: #9333EA;
        font-weight: 700;
      }
      .rx-balance-grid .ct {
        color: #18181B;
        text-align: right;
      }
      .rx-conserved {
        color: #15803D;
        font-weight: 600;
      }

      .rx-obs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .rx-obs-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
        padding: 4px 10px;
        background: #F4F4F5;
        color: #52525B;
        border-radius: 999px;
      }
      .rx-obs-chip.color-change { background: #FCE7F3; color: #9D174D; }
      .rx-obs-chip.precipitate { background: #FEF3C7; color: #92400E; }
      .rx-obs-chip.gas-evolution { background: #DBEAFE; color: #1E40AF; }
      .rx-obs-chip.temperature-rise { background: #FEE2E2; color: #B91C1C; }
      .rx-obs-chip.temperature-fall { background: #DBEAFE; color: #1E3A8A; }
      .rx-obs-chip.flame { background: #FED7AA; color: #C2410C; }
      .rx-obs-chip.light { background: #FEF9C3; color: #A16207; }
      .rx-obs-chip.none { background: #F4F4F5; color: #71717A; }

      /* ---- Concept footer ---- */
      .rx-concept {
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
      .rx-concept-icon {
        flex-shrink: 0;
        font-size: 14px;
      }
    `}</style>
  )
}
