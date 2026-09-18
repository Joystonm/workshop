export function ElementExplorerSceneStyles() {
  return (
    <style>{`
      .atom-hud {
        background: rgba(255,255,255,0.92);
        padding: 8px 14px;
        border-radius: 6px;
        text-align: center;
        font-family: ui-sans-serif, system-ui;
        color: var(--text-primary);
      }
      .atom-z { font-size: 11px; color: var(--text-muted); }
      .atom-symbol { font-size: 26px; font-weight: 700; color: var(--ws-chemistry); }
      .atom-name { font-size: 11px; color: var(--text-secondary); }
      .atom-config { font-size: 9px; color: var(--text-muted); font-family: ui-monospace, monospace; }
      .atom-shells { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
      .atom-data {
        background: rgba(255,255,255,0.92);
        padding: 6px 10px;
        border-radius: 4px;
        font-family: ui-monospace, monospace;
        font-size: 10px;
        color: var(--text-secondary);
        line-height: 1.5;
      }
    `}</style>
  )
}
