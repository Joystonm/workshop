// Renders the active experiment's canvas. The experiment itself is selected
// via the store; Canvas2DView's rAF loop reads the current experiment and
// calls its `draw` function every frame.

import { Canvas2DView } from './Canvas2DView'

export function ActiveExperiment() {
  return <Canvas2DView />
}
