export function CombineSceneStyles() {
  return (
    <style>{`
      .comb-formula {
        background: rgba(255,255,255,0.92);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: ui-monospace, monospace;
        font-size: 12px;
        color: var(--text-primary);
        font-weight: 600;
      }
      .comb-card {
        background: rgba(255,255,255,0.95);
        padding: 8px 14px;
        border-radius: 6px;
        max-width: 320px;
        text-align: center;
        font-family: ui-sans-serif, system-ui;
        color: var(--text-primary);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }
      .comb-eq { font-size: 12px; font-weight: 600; color: var(--text-primary); }
      .comb-dh { font-size: 11px; margin-top: 2px; }
      .comb-type { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
      .comb-progress { font-size: 10px; color: var(--text-muted); margin-top: 4px; }
      .comb-obs { font-size: 10px; color: var(--ws-chemistry); margin-top: 4px; }
      .comb-desc { font-size: 10px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4; }
    `}</style>
  )
}
