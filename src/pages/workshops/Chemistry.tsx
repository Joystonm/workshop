// Chemistry workshop page. The actual lab is in
// `components/chemistry/ChemistryLabShell.tsx`; this file is a thin
// wrapper so the page can be wired into the routing system.

import { ChemistryLabShell } from '../../components/chemistry/ChemistryLabShell'

export function ChemistryWorkshop() {
  return <ChemistryLabShell />
}
