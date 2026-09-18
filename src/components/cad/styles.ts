// Shared CSS for the CAD workshop. One string, imported by every CAD component.
// Uses only design tokens from src/index.css — no hardcoded colors or pixel values.

export const CAD_STYLES = `
/* ─── Shell: 4-zone layout (tool shelf / rail / stage / panel) ────────── */
.cad-shell {
  flex: 1;
  height: 100%;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: row;
  background: var(--bg-primary);
  overflow: hidden;
}

/* ─── Tool shelf: 56px vertical column of tool icons ──────────────────── */
.cad-tool-shelf {
  width: 56px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-3) 0;
  gap: var(--space-1);
  min-height: 0;
}

.cad-tool-shelf .rail-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
  position: relative;
}

.cad-tool-shelf .rail-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.cad-tool-shelf .rail-btn.active {
  background: var(--accent-dim);
  color: var(--accent);
  border-color: var(--accent);
}

.cad-tool-shelf .rail-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.cad-tool-shelf .rail-btn.danger:hover:not(:disabled) {
  background: var(--danger-dim);
  color: var(--danger);
}

.cad-tool-shelf .rail-divider {
  width: 24px;
  height: 1px;
  background: var(--border-default);
  margin: var(--space-1) 0;
}

.cad-tool-shelf .rail-spacer {
  flex: 1;
}

/* ─── Content rail: 240px wide, scene tree + primitive picker ────────── */
.cad-rail {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* ─── View selector (5 chips: 3D / Top / Right / Front / Iso) ────────── */
.cad-view-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.cad-view-selector-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.cad-view-chips {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
}

.cad-view-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: var(--space-1) 0;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
  cursor: pointer;
  min-height: 38px;
}
.cad-view-chip:hover {
  background: var(--bg-elevated);
  border-color: var(--border-default);
  color: var(--text-primary);
}
.cad-view-chip.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}
.cad-view-chip-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.cad-view-chip-key {
  font-size: 9px;
  font-family: ui-monospace, 'Geist Mono', monospace;
  color: var(--text-muted);
  opacity: 0.7;
}
.cad-view-chip.active .cad-view-chip-key {
  color: var(--accent);
  opacity: 0.8;
}

/* ─── Panel tabs ──────────────────────────────────────────────────────── */
.cad-panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
  padding: 0 var(--space-2);
  gap: var(--space-1);
  background: var(--bg-secondary);
}

.cad-panel-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-2);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
  margin-bottom: -1px;
}

.cad-panel-tab:hover {
  color: var(--text-secondary);
}

.cad-panel-tab.active {
  color: var(--text-primary);
  border-bottom-color: var(--accent);
}

/* ─── Scene tree ─────────────────────────────────────────────────────── */
.cad-tree {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.cad-tree-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4) var(--space-2);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  flex-shrink: 0;
}

.cad-tree-header .count {
  margin-left: auto;
  padding: 1px var(--space-2);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
}

.cad-tree-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-1) var(--space-2);
}

.cad-tree-empty {
  padding: var(--space-8) var(--space-4);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--text-xs);
  line-height: 1.6;
}

.cad-tree-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  position: relative;
}

.cad-tree-row:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.cad-tree-row.selected {
  background: var(--accent-dim);
  color: var(--accent);
}

.cad-tree-row.selected .row-icon {
  color: var(--accent);
}

.cad-tree-row .row-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  background: var(--bg-tertiary);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.cad-tree-row:hover .row-icon {
  color: var(--text-primary);
  background: var(--bg-elevated);
}

.cad-tree-row.selected .row-icon {
  background: var(--bg-secondary);
}

.cad-tree-row .row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.cad-tree-row .row-name input {
  width: 100%;
  padding: 2px var(--space-1);
  background: var(--bg-primary);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: inherit;
}

.cad-tree-row .row-name input:focus {
  outline: none;
}

.cad-tree-row .row-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.cad-tree-row:hover .row-actions,
.cad-tree-row.selected .row-actions {
  opacity: 1;
}

.cad-tree-row .row-actions button {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.cad-tree-row .row-actions button:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

/* ─── Primitive picker (list layout, professional CAD palette) ────────── */
.cad-picker {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.cad-picker-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4) var(--space-2);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  flex-shrink: 0;
}

.cad-picker-categories {
  display: flex;
  gap: 1px;
  padding: 0 var(--space-2);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
  background: var(--bg-secondary);
}

.cad-picker-category {
  flex: 1;
  padding: var(--space-2);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all var(--transition-fast);
}

.cad-picker-category:hover {
  color: var(--text-secondary);
}

.cad-picker-category.active {
  color: var(--text-primary);
  border-bottom-color: var(--accent);
}

.cad-picker-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
}

.cad-picker-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  text-align: left;
  font-size: var(--text-sm);
  font-weight: 500;
}

.cad-picker-row:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-subtle);
  color: var(--text-primary);
}

.cad-picker-row:active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

.cad-picker-row .picker-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.cad-picker-row:hover .picker-icon {
  background: var(--bg-secondary);
  color: var(--accent);
}

.cad-picker-row .picker-label {
  flex: 1;
  min-width: 0;
}

.cad-picker-row .picker-key {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  padding: 2px var(--space-2);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.cad-picker-row:hover .picker-key {
  opacity: 1;
}

/* ─── Center stage ───────────────────────────────────────────────────── */
.cad-stage {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.cad-viewport {
  flex: 1;
  position: relative;
  min-height: 0;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.cad-viewport canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

/* ─── Status bar ─────────────────────────────────────────────────────── */
.cad-status-bar {
  flex-shrink: 0;
  height: 28px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-3);
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-family: ui-monospace, 'Geist Mono', monospace;
}

.cad-status-left,
.cad-status-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.cad-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
}

.cad-status-dot.testing {
  background: var(--warning);
  animation: pulse-dot 1.2s ease-in-out infinite;
}

.cad-status-dot.success {
  background: var(--success);
}

.cad-status-dot.failure {
  background: var(--danger);
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.cad-status-sep {
  opacity: 0.4;
}

.cad-status-fit-view {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  margin-left: var(--space-1);
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-family: ui-monospace, 'Geist Mono', monospace;
  font-size: var(--text-xs);
  letter-spacing: 0.02em;
  transition: all var(--transition-fast);
}

.cad-status-fit-view:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--border-default);
  color: var(--accent);
}

.cad-status-fit-view:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ─── Right panel: properties ─────────────────────────────────────────── */
.cad-panel {
  width: 300px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.cad-properties {
  flex: 1;
  overflow-y: auto;
}

.cad-panel-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.cad-panel-empty {
  padding: var(--space-8) var(--space-4);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--text-xs);
}

.cad-property-section {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.cad-property-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cad-property-label .unit {
  font-weight: 400;
  color: var(--text-muted);
  text-transform: none;
  letter-spacing: 0;
}

.cad-property-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cad-property-name-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.cad-property-name .type-tag {
  display: inline-block;
  margin-left: var(--space-2);
  padding: 2px var(--space-2);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.03em;
}

.cad-label-action {
  font-size: 10px;
  font-weight: 500;
  color: var(--accent);
  background: transparent;
  border: none;
  padding: 0;
  letter-spacing: 0.02em;
  text-transform: none;
  cursor: pointer;
}
.cad-label-action:hover {
  text-decoration: underline;
}

.cad-lock-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
.cad-lock-btn:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-color: var(--border-default);
}
.cad-lock-btn.locked {
  background: var(--warning-dim, rgba(245, 158, 11, 0.12));
  border-color: var(--warning, #f59e0b);
  color: var(--warning, #f59e0b);
}

/* Quick actions row */
.cad-quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-1);
}
.cad-quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-2);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all var(--transition-fast);
}
.cad-quick-btn:hover {
  background: var(--bg-elevated);
  border-color: var(--border-default);
  color: var(--text-primary);
}
.cad-quick-btn.danger:hover {
  background: var(--danger-dim, rgba(239, 68, 68, 0.12));
  border-color: var(--danger, #ef4444);
  color: var(--danger, #ef4444);
}

.cad-input-grid {
  display: grid;
  gap: var(--space-2);
}

.cad-input-grid.cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.cad-input-grid.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.cad-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.cad-input-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cad-input input[type='number'],
.cad-input input[type='text'] {
  width: 100%;
  padding: var(--space-2);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-family: ui-monospace, 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
}

.cad-input input:focus {
  outline: none;
  border-color: var(--accent);
}

.cad-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.cad-input-wrap input {
  padding-right: 18px !important;
}

.cad-input-steps {
  position: absolute;
  right: 1px;
  top: 1px;
  bottom: 1px;
  width: 16px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border-subtle);
  pointer-events: none;
}

.cad-input-steps button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-muted);
  pointer-events: auto;
  padding: 0;
  transition: all var(--transition-fast);
}
.cad-input-steps button:hover {
  background: var(--bg-elevated);
  color: var(--accent);
}
.cad-input-steps button:first-child {
  border-bottom: 1px solid var(--border-subtle);
}

/* Segmented control — used for Display (visible/hidden/transparent/wireframe) */
.cad-segmented {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  padding: 2px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}
.cad-segmented-btn {
  padding: var(--space-1) 0;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}
.cad-segmented-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-elevated);
}
.cad-segmented-btn.active {
  background: var(--bg-elevated);
  color: var(--accent);
  box-shadow: 0 1px 0 0 var(--accent) inset;
}

/* Material advanced — sliders */
.cad-material-advanced {
  margin-top: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.cad-slider {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cad-slider-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}
.cad-slider-label {
  font-weight: 600;
  text-transform: uppercase;
}
.cad-slider-value {
  font-family: ui-monospace, 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
}
.cad-slider input[type='range'] {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  height: 16px;
  margin: 0;
  padding: 0;
}
.cad-slider input[type='range']::-webkit-slider-runnable-track {
  height: 3px;
  background: var(--border-default);
  border-radius: var(--radius-sm);
}
.cad-slider input[type='range']::-moz-range-track {
  height: 3px;
  background: var(--border-default);
  border-radius: var(--radius-sm);
}
.cad-slider input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: -4.5px;
  border: 2px solid var(--bg-elevated);
  box-shadow: 0 0 0 1px var(--accent);
  cursor: pointer;
}
.cad-slider input[type='range']::-moz-range-thumb {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--bg-elevated);
  cursor: pointer;
}

/* Info — read-only metadata */
.cad-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}
.cad-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
  gap: var(--space-2);
}
.cad-info-row > span:first-child {
  color: var(--text-muted);
}
.cad-info-value {
  font-family: ui-monospace, 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary);
  text-align: right;
}

/* Material picker — button with swatch + popover */
.cad-material-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--text-primary);
  text-align: left;
  transition: all var(--transition-fast);
}

.cad-material-button:hover {
  border-color: var(--border-default);
  background: var(--bg-elevated);
}

.cad-material-swatch {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--border-default);
  flex-shrink: 0;
}

.cad-material-popover {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-1);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
}

.cad-material-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: left;
  transition: background var(--transition-fast);
}

.cad-material-row:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.cad-material-row.active {
  color: var(--accent);
}

.cad-input input[type='number']::-webkit-outer-spin-button,
.cad-input input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.cad-input input[type='number'] {
  -moz-appearance: textfield;
}

.cad-input-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-1);
}

.cad-input-reset {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border: none;
  padding: 0 var(--space-1);
  line-height: 1;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  opacity: 0;
}
.cad-input:hover .cad-input-reset,
.cad-input-reset:focus-visible {
  opacity: 1;
}
.cad-input-reset:hover {
  color: var(--accent);
  background: var(--bg-elevated);
}

/* Axis-color labels — X red, Y green, Z blue (convention from the world axes) */
.cad-axis-label {
  display: inline-block;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.cad-axis-x { color: #ef4444; }
.cad-axis-y { color: #22c55e; }
.cad-axis-z { color: #3b82f6; }

/* Sub-control grouping inside a property section (snap chips, nudge buttons) */
.cad-control-sub {
  margin-top: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.cad-control-sub-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.cad-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

/* Chip — small inline action button (snap angles, scale presets, etc.) */
.cad-chip {
  padding: 3px var(--space-2);
  font-size: 11px;
  font-weight: 600;
  font-family: ui-monospace, 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  letter-spacing: 0.02em;
  transition: all var(--transition-fast);
}
.cad-chip:hover {
  background: var(--bg-elevated);
  border-color: var(--border-default);
  color: var(--text-primary);
}
.cad-chip:active {
  transform: translateY(1px);
}
.cad-chip.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}
.cad-chip.cad-chip-toggle {
  margin-left: auto;
  font-family: inherit;
  font-size: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Uniform slider — single control driving all 3 axes */
.cad-uniform {
  margin-bottom: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.cad-uniform-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: var(--text-xs);
}
.cad-uniform-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.cad-uniform-value {
  font-family: ui-monospace, 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
  font-weight: 600;
}
.cad-uniform-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  height: 16px;
  margin: 0;
  padding: 0;
}
.cad-uniform-slider::-webkit-slider-runnable-track {
  height: 4px;
  background: linear-gradient(
    to right,
    var(--accent) 0%,
    var(--accent) 20%,
    var(--border-default) 20%,
    var(--border-default) 100%
  );
  border-radius: var(--radius-sm);
}
.cad-uniform-slider::-moz-range-track {
  height: 4px;
  background: var(--border-default);
  border-radius: var(--radius-sm);
}
.cad-uniform-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 14px;
  width: 14px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: -5px;
  border: 2px solid var(--bg-elevated);
  box-shadow: 0 0 0 1px var(--accent);
  cursor: pointer;
}
.cad-uniform-slider::-moz-range-thumb {
  height: 14px;
  width: 14px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--bg-elevated);
  cursor: pointer;
}
.cad-uniform-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  font-family: ui-monospace, 'Geist Mono', monospace;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

/* Scale section — segmented mode toggle, exact-value input, axis badges,
   per-axis sliders, mirror button, viewport tip. */
.cad-segmented {
  display: flex;
  gap: 0;
  margin-bottom: var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 2px;
}
.cad-segmented-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 120ms;
}
.cad-segmented-btn:hover { color: var(--text-primary); }
.cad-segmented-btn.active {
  background: var(--bg-secondary);
  color: var(--accent);
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}

.cad-scale-exact {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: var(--space-2);
  padding: 6px 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
}
.cad-scale-exact-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.cad-scale-exact-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: ui-monospace, 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  padding: 2px 0;
  text-align: right;
  outline: none;
  min-width: 0;
}
.cad-scale-exact-input::-webkit-outer-spin-button,
.cad-scale-exact-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.cad-scale-exact-input[type=number] {
  -moz-appearance: textfield;
}
.cad-scale-exact-unit {
  color: var(--text-muted);
  font-family: ui-monospace, 'Geist Mono', monospace;
  font-size: 12px;
}

.cad-axis-badges {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-top: var(--space-2);
}
.cad-axis-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 6px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
}
.cad-axis-badge-letter {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.cad-axis-badge-value {
  font-family: ui-monospace, 'Geist Mono', monospace;
  font-size: 11px;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}
.cad-axis-badge.cad-axis-x .cad-axis-badge-letter { color: #EF4444; }
.cad-axis-badge.cad-axis-y .cad-axis-badge-letter { color: #22C55E; }
.cad-axis-badge.cad-axis-z .cad-axis-badge-letter { color: #3B82F6; }

.cad-scale-per-axis {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: var(--space-3);
  padding: var(--space-2);
  background: var(--bg-tertiary);
  border-radius: 6px;
}
.cad-scale-axis-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cad-scale-axis-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.cad-scale-axis-value {
  flex: 1;
  font-family: ui-monospace, 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  color: var(--text-secondary);
  text-align: right;
}
.cad-mirror-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 120ms;
}
.cad-mirror-btn:hover { color: var(--accent); border-color: var(--accent); }
.cad-mirror-btn.flipped {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

.cad-axis-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--border-default);
  outline: none;
}
.cad-axis-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-secondary);
  border: 2px solid var(--bg-tertiary);
  cursor: pointer;
}
.cad-axis-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-secondary);
  border: 2px solid var(--bg-tertiary);
  cursor: pointer;
}
.cad-axis-slider-x::-webkit-slider-thumb { background: #EF4444; }
.cad-axis-slider-y::-webkit-slider-thumb { background: #22C55E; }
.cad-axis-slider-z::-webkit-slider-thumb { background: #3B82F6; }
.cad-axis-slider-x::-moz-range-thumb { background: #EF4444; }
.cad-axis-slider-y::-moz-range-thumb { background: #22C55E; }
.cad-axis-slider-z::-moz-range-thumb { background: #3B82F6; }

.cad-tip {
  margin-top: var(--space-3);
  padding: 8px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-secondary);
}
.cad-tip strong { color: var(--text-primary); }
.cad-tip kbd {
  display: inline-block;
  padding: 1px 5px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: 3px;
  font-family: ui-monospace, 'Geist Mono', monospace;
  font-size: 10px;
  color: var(--text-primary);
}

/* Responsive — collapse the tool shelf on narrow screens */
@media (max-width: 1100px) {
  .cad-panel { width: 260px; }
  .cad-rail { width: 220px; }
}
@media (max-width: 900px) {
  .cad-tool-shelf { width: 48px; }
  .cad-rail { width: 200px; }
}
`
