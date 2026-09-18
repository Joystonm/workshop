// Climate workshop page. Thin wrapper around the lab shell so the
// routing layer can mount it at /workshop/climate.

import { ClimateLabShell } from '../../components/climate/ClimateLabShell'

export function ClimateWorkshop() {
  return <ClimateLabShell />
}