// Geometry generators for CAD primitives
import * as THREE from 'three'
import { CADObject, CADParameters } from './types'

export function createGeometry(obj: CADObject): THREE.BufferGeometry {
  const p = obj.parameters

  switch (obj.type) {
    case 'box':
    case 'cuboid':
      return new THREE.BoxGeometry(
        p.width || 1,
        p.height || 1,
        p.depth || 1
      )

    case 'sphere':
      return new THREE.SphereGeometry(
        p.radius || 1,
        p.segments || 32,
        p.segments || 32
      )

    case 'cylinder':
      return new THREE.CylinderGeometry(
        p.radius || 1,
        p.radius || 1,
        p.height || 1,
        p.segments || 32
      )

    case 'cone':
      return new THREE.ConeGeometry(
        p.radiusBottom || 1,
        p.height || 1,
        p.segments || 32
      )

    case 'capsule':
      return new THREE.CapsuleGeometry(
        p.radius || 0.5,
        p.height || 1,
        p.segments || 16,
        p.segments || 16
      )

    case 'torus':
      return new THREE.TorusGeometry(
        p.innerRadius || 0.5,
        p.outerRadius || 1,
        p.segments || 24,
        p.segments || 24
      )

    case 'plane':
      return new THREE.PlaneGeometry(
        p.width || 10,
        p.height || 10
      )

    case 'prism':
      return new THREE.CylinderGeometry(
        p.radius || 1,
        p.radius || 1,
        p.height || 1,
        p.sides || 6
      )

    case 'pyramid':
      return new THREE.ConeGeometry(
        p.radius || 1,
        p.height || 1,
        p.sides || 4
      )

    case 'wedge':
      // Create a wedge using custom geometry
      return createWedgeGeometry(p.width || 1, p.height || 1, p.depth || 1)

    case 'beam':
      return new THREE.BoxGeometry(
        p.width || 0.5,
        p.height || 1,
        p.depth || 5
      )

    case 'rod':
      return new THREE.CylinderGeometry(
        p.radius || 0.25,
        p.radius || 0.25,
        p.length || 5,
        16
      )

    case 'pipe':
    case 'tube':
      const inner = p.innerRadius || 0.4
      const outer = p.outerRadius || 0.5
      const length = p.length || 2
      return new THREE.CylinderGeometry(
        outer,
        outer,
        length,
        32,
        1,
        true // openEnded
      )

    case 'plate':
      return new THREE.BoxGeometry(
        p.width || 5,
        p.height || 5,
        p.depth || 0.2
      )

    case 'iBeam':
      // Simplified I-beam approximation using box
      return new THREE.BoxGeometry(
        p.width || 1,
        p.height || 2,
        p.depth || 4
      )

    case 'lBeam':
      return new THREE.BoxGeometry(
        p.width || 0.75,
        p.height || 1.5,
        p.depth || 3
      )

    case 'tBeam':
      return new THREE.BoxGeometry(
        p.width || 1,
        p.height || 1.75,
        p.depth || 3.5
      )

    case 'uChannel':
      return new THREE.BoxGeometry(
        p.width || 1.25,
        p.height || 2,
        p.depth || 3
      )

    default:
      return new THREE.BoxGeometry(1, 1, 1)
  }
}

function createWedgeGeometry(width: number, height: number, depth: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()

  // Wedge vertices - right triangle profile extruded
  const vertices = new Float32Array([
    // Front face (right triangle)
    -width/2, 0, depth/2,    // 0
    -width/2, 0, -depth/2,   // 1
    width/2, 0, -depth/2,     // 2
    // Back face (right triangle)
    -width/2, 0, depth/2,    // 3
    width/2, 0, -depth/2,     // 4
    width/2, height, -depth/2, // 5
    // Slope face
    -width/2, 0, depth/2,     // 6
    width/2, height, -depth/2, // 7
    -width/2, 0, -depth/2,    // 8
    // Bottom
    -width/2, 0, depth/2,     // 9
    width/2, 0, -depth/2,     // 10
    -width/2, 0, -depth/2,    // 11
  ])

  const indices = [
    0, 1, 2,  // front bottom
    3, 4, 5,  // back slope
    6, 7, 8,  // slope
    9, 10, 11, // bottom
  ]

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return geometry
}

export function getBoundingBox(obj: CADObject): THREE.Vector3 {
  const p = obj.parameters

  switch (obj.type) {
    case 'box':
    case 'cuboid':
    case 'beam':
    case 'plate':
    case 'iBeam':
    case 'lBeam':
    case 'tBeam':
    case 'uChannel':
      return new THREE.Vector3(
        (p.width || p.depth || 1) * obj.scale.x,
        (p.height || 1) * obj.scale.y,
        (p.depth || p.width || 1) * obj.scale.z
      )
    case 'sphere':
    case 'cylinder':
    case 'cone':
    case 'capsule':
    case 'prism':
    case 'pyramid':
      const r = p.radius || 1
      const h = p.height || 1
      return new THREE.Vector3(
        r * 2 * obj.scale.x,
        h * obj.scale.y,
        r * 2 * obj.scale.z
      )
    case 'torus':
      const outer = p.outerRadius || 1
      return new THREE.Vector3(
        outer * 2 * obj.scale.x,
        outer * obj.scale.y,
        outer * 2 * obj.scale.z
      )
    case 'plane':
      return new THREE.Vector3(
        (p.width || 10) * obj.scale.x,
        0.01 * obj.scale.y,
        (p.height || 10) * obj.scale.z
      )
    default:
      return new THREE.Vector3(1, 1, 1)
  }
}

export function getObjectVolume(obj: CADObject): number {
  const p = obj.parameters

  switch (obj.type) {
    case 'box':
    case 'cuboid':
    case 'beam':
    case 'plate':
    case 'iBeam':
    case 'lBeam':
    case 'tBeam':
    case 'uChannel':
      return (p.width || 1) * (p.height || 1) * (p.depth || 1)
    case 'sphere':
      return (4/3) * Math.PI * Math.pow(p.radius || 1, 3)
    case 'cylinder':
      return Math.PI * Math.pow(p.radius || 1, 2) * (p.height || 1)
    case 'cone':
      return (1/3) * Math.PI * Math.pow(p.radiusBottom || 1, 2) * (p.height || 1)
    case 'capsule':
      const r = p.radius || 0.5
      const h = p.height || 1
      return Math.PI * r * r * h + (4/3) * Math.PI * r * r * r
    case 'torus':
      const inner = p.innerRadius || 0.5
      const outer = p.outerRadius || 1
      return (Math.PI * inner * inner) * (2 * Math.PI * outer)
    default:
      return 1
  }
}
