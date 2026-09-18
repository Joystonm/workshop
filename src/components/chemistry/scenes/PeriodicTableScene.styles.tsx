// Styles for the Periodic Table scene. Injected as a DOM <style> tag in
// the parent React tree (NOT inside the R3F Canvas, which rejects
// <style> as a scene-graph child).

export function PeriodicTableSceneStyles() {
  return (
    <style>{`
      .pt-root {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        gap: 12px;
        min-height: 100%;
        background: #FAFAFA;
        font-family: ui-sans-serif, system-ui;
      }
      .pt-table-wrap {
        overflow: auto;
        max-width: 100%;
        padding: 4px;
      }
      .pt-table {
        display: grid;
        grid-template-columns: repeat(18, 36px);
        grid-template-rows: repeat(9, 40px);
        gap: 2px;
      }
      .pt-tile.lanthact.lanthanide { grid-row: 8; }
      .pt-tile.lanthact.actinide { grid-row: 9; }
      .pt-tile {
        width: 36px; height: 40px;
        border: 1.5px solid;
        border-radius: 3px;
        background: rgba(255, 255, 255, 0.92);
        padding: 1px 2px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: ui-sans-serif, system-ui;
        cursor: pointer;
        user-select: none;
        transition: transform 0.1s, box-shadow 0.1s;
        position: relative;
        overflow: hidden;
      }
      .pt-tile:hover { transform: scale(1.12); box-shadow: 0 4px 10px rgba(0,0,0,0.18); z-index: 10; }
      .pt-tile.selected { background: rgba(147, 51, 234, 0.15) !important; border-width: 2.5px; transform: scale(1.08); box-shadow: 0 0 0 2px var(--ws-chemistry); }
      .pt-z { font-size: 9px; color: var(--text-muted); line-height: 1; }
      .pt-sym { font-size: 14px; font-weight: 700; line-height: 1.1; }
      .pt-mass { font-size: 7px; color: var(--text-muted); line-height: 1; margin-top: 1px; }
      .pt-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 14px;
        padding: 8px 12px;
        background: rgba(255,255,255,0.95);
        border-radius: 6px;
        font-size: 11px;
        color: var(--text-secondary);
        max-width: 720px;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .pt-legend-item { display: flex; align-items: center; gap: 4px; }
      .pt-legend-swatch { width: 10px; height: 10px; border-radius: 2px; }
      .pt-detail {
        width: 100%;
        max-width: 720px;
        background: white;
        border-radius: 8px;
        padding: 14px 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        border: 1px solid var(--border-default);
      }
      .pt-detail-head { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
      .pt-detail-sym {
        width: 56px; height: 56px;
        display: flex; align-items: center; justify-content: center;
        font-size: 26px; font-weight: 800;
        border-radius: 8px;
        color: #fff !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }
      .pt-detail-name { font-size: 18px; font-weight: 700; color: var(--text-primary); }
      .pt-detail-z { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
      .pt-detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px 18px;
        font-size: 12px;
        color: var(--text-secondary);
      }
      .pt-detail-grid > div { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed rgba(0,0,0,0.06); }
      .pt-detail-grid span { color: var(--text-muted); }
      .pt-detail-grid b { color: var(--text-primary); font-weight: 600; }
      .pt-detail-desc { font-size: 12px; line-height: 1.5; color: var(--text-secondary); margin: 12px 0 0; }
    `}</style>
  )
}
