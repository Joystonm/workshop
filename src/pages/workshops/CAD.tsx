// CAD workshop page — thin wrapper. The actual lab (3-zone layout, tool
// rail, scene tree, primitive picker, viewport, properties, status bar)
// lives in `components/cad/CADShell.tsx`.

import { CADShell } from '../../components/cad/CADShell'

export function CADWorkshop() {
  return <CADShell />
}
