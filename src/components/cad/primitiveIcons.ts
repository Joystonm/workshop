// Map primitive type → icon component. Kept in a .ts (not .tsx) file so
// `react-refresh/only-export-components` doesn't flag the non-component
// default export sitting next to the icon components in icons.tsx.

import type { PrimitiveType } from '../../lib/cad/types'
import {
  BoxIcon,
  CuboidIcon,
  SphereIcon,
  CylinderIcon,
  ConeIcon,
  CapsuleIcon,
  TorusIcon,
  PlaneIcon,
  PrismIcon,
  PyramidIcon,
  WedgeIcon,
  PolyhedronIcon,
  BeamIcon,
  RodIcon,
  PipeIcon,
  TubeIcon,
  PlateIcon,
  IBeamIcon,
  LBeamIcon,
  TBeamIcon,
  UChannelIcon,
} from './icons'

export const PRIMITIVE_ICONS: Record<PrimitiveType, (p?: { size?: number }) => React.ReactElement> = {
  box: BoxIcon,
  cuboid: CuboidIcon,
  sphere: SphereIcon,
  cylinder: CylinderIcon,
  cone: ConeIcon,
  capsule: CapsuleIcon,
  torus: TorusIcon,
  plane: PlaneIcon,
  prism: PrismIcon,
  pyramid: PyramidIcon,
  wedge: WedgeIcon,
  polyhedron: PolyhedronIcon,
  beam: BeamIcon,
  rod: RodIcon,
  pipe: PipeIcon,
  tube: TubeIcon,
  plate: PlateIcon,
  iBeam: IBeamIcon,
  lBeam: LBeamIcon,
  tBeam: TBeamIcon,
  uChannel: UChannelIcon,
}
