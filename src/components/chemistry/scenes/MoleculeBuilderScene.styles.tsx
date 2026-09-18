export function MoleculeBuilderSceneStyles() {
  return (
    <style>{`
      .mb-label {
        font-family: ui-monospace, monospace;
        font-size: 10px;
        font-weight: 700;
        color: rgba(0,0,0,0.55);
        text-shadow: 0 0 4px white;
      }
      .mb-info {
        background: rgba(255,255,255,0.94);
        padding: 8px 14px;
        border-radius: 6px;
        text-align: center;
        max-width: 380px;
        font-family: ui-sans-serif, system-ui;
      }
      .mb-name { font-size: 12px; color: var(--ws-chemistry); font-weight: 600; }
      .mb-formula { font-size: 18px; font-weight: 700; color: var(--text-primary); }
      .mb-cat { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
      .mb-desc { font-size: 10px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4; }

      .mb-vsepr {
        display: flex;
        gap: 6px;
        justify-content: center;
        align-items: center;
        margin-top: 6px;
        flex-wrap: wrap;
      }
      .mb-vsepr-shape {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(147, 51, 234, 0.10);
        color: #581C87;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .mb-vsepr-angle {
        font-family: ui-monospace, monospace;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        background: #0EA5E9;
        color: white;
      }
      .mb-polar-pill {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .mb-polar-pill.polar {
        background: #FEE2E2;
        color: #B91C1C;
      }
      .mb-polar-pill.nonpolar {
        background: #DCFCE7;
        color: #15803D;
      }
      .mb-bond-length {
        font-family: ui-monospace, monospace;
        font-size: 9px;
        font-weight: 700;
        padding: 2px 6px;
        background: rgba(255,255,255,0.85);
        border: 1px solid rgba(147, 51, 234, 0.30);
        border-radius: 4px;
        color: #581C87;
      }
      .mb-angle-label {
        font-family: ui-monospace, monospace;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        background: rgba(147, 51, 234, 0.92);
        color: white;
        border-radius: 4px;
      }
      .mb-dipole {
        font-family: ui-monospace, monospace;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        background: rgba(220, 38, 38, 0.92);
        color: white;
        border-radius: 4px;
      }
    `}</style>
  )
}
