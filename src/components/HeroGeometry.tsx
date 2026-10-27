type Point = [number, number, number]
type Surface = { points: Point[]; tone: number; depth: number }

// Square architectural plates, projected as a solid stack rather than a flat pattern.
const surfaces: Surface[] = []
const camera = ([x, y, z]: Point): Point => {
  const yaw = -.58
  const pitch = .38
  const horizontal = x * Math.cos(yaw) + z * Math.sin(yaw)
  const depth = z * Math.cos(yaw) - x * Math.sin(yaw)
  return [horizontal, y * Math.cos(pitch) - depth * Math.sin(pitch), y * Math.sin(pitch) + depth * Math.cos(pitch)]
}
const project = ([x, y]: Point) => `${400 + x * 145},${410 - y * 145}`
const square = (size: number, height: number, angle: number): Point[] =>
  [[-size, -size], [size, -size], [size, size], [-size, size]].map(([x, z]) =>
    [x * Math.cos(angle) - z * Math.sin(angle), height, x * Math.sin(angle) + z * Math.cos(angle)] as Point)
const add = (points: Point[], tone: number) => {
  const transformed = points.map(camera)
  surfaces.push({ points: transformed, tone, depth: points.reduce((sum, p) => sum + p[1] * 100, 0) / points.length + transformed.reduce((sum, p) => sum + p[2], 0) / points.length })
}
for (let layer = 0; layer < 14; layer++) {
  const height = -1.7 + layer * .25
  const angle = (layer - 6.5) * .065
  const outer = square(1.22, height, angle)
  const inner = square(.92, height, angle)
  const lowerOuter = square(1.22, height - .045, angle)
  const lowerInner = square(.92, height - .045, angle)
  for (let edge = 0; edge < 4; edge++) {
    const next = (edge + 1) % 4
    add([outer[edge], outer[next], inner[next], inner[edge]], 95 + layer * 3)
    add([outer[edge], lowerOuter[edge], lowerOuter[next], outer[next]], [39, 57, 27, 69][edge])
    add([inner[edge], inner[next], lowerInner[next], lowerInner[edge]], [24, 34, 20, 40][edge])
  }
}
surfaces.sort((a, b) => a.depth - b.depth)

export function HeroGeometry() {
  return <svg viewBox="0 0 800 800" fill="none" focusable="false">
    {surfaces.map(({ points, tone }, index) => <polygon
      key={index}
      points={points.map(project).join(' ')}
      fill={`rgb(${tone},${tone + 1},${tone - 4})`}
      stroke={tone > 90 ? '#c7c9bf' : '#73776c'}
      strokeOpacity={tone > 90 ? .42 : .18}
      strokeWidth=".65"
      strokeLinejoin="round"
    />)}
  </svg>
}
