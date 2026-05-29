import { useState } from 'react'
import styles from './TrendChart.module.css'
import { Avatar } from './Avatar'
import type { CharacterId } from '../types'
import type { PlayerSeries } from '../lib/scoring'

interface Props {
  series: PlayerSeries[]
  onSelect?: (id: CharacterId) => void
  height?: number
}

const W = 1000
const PAD = { top: 30, right: 130, bottom: 44, left: 28 }

export function TrendChart({ series, onSelect, height = 480 }: Props) {
  const [hoverId, setHoverId] = useState<CharacterId | null>(null)
  const H = height

  // Domini
  const allTs = series.flatMap(s => s.points.map(p => p.t))
  const allScores = series.flatMap(s => s.points.map(p => p.score))
  const tMin = Math.min(...allTs)
  const tMax = Math.max(...allTs)
  const sMin = Math.min(0, ...allScores)
  const sMax = Math.max(0, ...allScores)
  const sPad = Math.max(2, (sMax - sMin) * 0.08)
  const yMin = sMin - sPad
  const yMax = sMax + sPad

  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  function x(t: number): number {
    if (tMax === tMin) return PAD.left + plotW / 2
    return PAD.left + ((t - tMin) / (tMax - tMin)) * plotW
  }
  function y(s: number): number {
    return PAD.top + ((yMax - s) / (yMax - yMin)) * plotH
  }

  // Grid orizzontale (5 livelli)
  const ticks = niceTicks(yMin, yMax, 5)
  const dateTicks = niceDateTicks(tMin, tMax, 4)

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Andamento punteggi nel tempo"
      >
        {/* Grid orizzontale + label Y */}
        {ticks.map(v => (
          <g key={`y-${v}`}>
            <line
              className={styles.grid}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(v)}
              y2={y(v)}
            />
            <text
              className={styles.axisLabel}
              x={W - PAD.right + 8}
              y={y(v) + 3}
            >{v}</text>
          </g>
        ))}

        {/* Linea zero più visibile */}
        {yMin <= 0 && yMax >= 0 && (
          <>
            <line
              className={styles.zeroLine}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(0)}
              y2={y(0)}
            />
          </>
        )}

        {/* Label X (date) */}
        {dateTicks.map((t) => (
          <text
            key={`x-${t}`}
            className={styles.axisLabel}
            x={x(t)}
            y={H - PAD.bottom + 18}
            textAnchor="middle"
          >{formatDate(t)}</text>
        ))}

        {/* Linee — curve morbide Catmull-Rom */}
        {series.map(s => {
          const isActive = hoverId === s.character.id
          const isDimmed = hoverId !== null && hoverId !== s.character.id
          const pixelPoints = s.points.map(p => ({ x: x(p.t), y: y(p.score) }))
          const d = buildSmoothPath(pixelPoints)
          return (
            <path
              key={s.character.id}
              d={d}
              className={`${styles.line} ${isDimmed ? styles.lineDim : ''} ${isActive ? styles.lineActive : ''}`}
              stroke={s.character.color}
              onMouseEnter={() => setHoverId(s.character.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => onSelect?.(s.character.id)}
            />
          )
        })}

        {/* Cerchi di terminazione con avatar (via foreignObject) */}
        {series.map(s => {
          if (s.points.length === 0) return null
          const last = s.points[s.points.length - 1]
          const cx = x(last.t)
          const cy = y(last.score)
          const r = 22
          const isDimmed = hoverId !== null && hoverId !== s.character.id

          return (
            <g
              key={`end-${s.character.id}`}
              className={`${styles.endPoint} ${isDimmed ? styles.endPointDim : ''}`}
              onMouseEnter={() => setHoverId(s.character.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => onSelect?.(s.character.id)}
            >
              <foreignObject
                x={cx - r}
                y={cy - r}
                width={r * 2}
                height={r * 2}
              >
                <div style={{ width: r * 2, height: r * 2 }}>
                  <Avatar character={s.character} size={r * 2} ring />
                </div>
              </foreignObject>
              {/* Numero a fianco */}
              <text
                className={`${styles.endLabel} ${isDimmed ? styles.endLabelDim : ''}`}
                x={cx + r + 8}
                y={cy + 4}
              >
                {s.total > 0 ? `+${s.total}` : s.total}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/**
 * Catmull-Rom → cubic Bézier interpolation.
 * Produce un path "d" SVG con curve morbide passanti per tutti i punti.
 * Tension 0..1: più alta = curve più morbide; 0.7 dà l'effetto "scorrevole" senza overshoot.
 */
function buildSmoothPath(points: { x: number; y: number }[], tension = 0.7): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension

    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

function niceTicks(min: number, max: number, count: number): number[] {
  const range = max - min
  const rough = range / count
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / mag
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max; v += step) {
    ticks.push(Math.round(v))
  }
  return ticks
}

function niceDateTicks(tMin: number, tMax: number, count: number): number[] {
  const step = (tMax - tMin) / (count - 1)
  const ticks: number[] = []
  for (let i = 0; i < count; i++) {
    ticks.push(tMin + step * i)
  }
  return ticks
}

function formatDate(t: number): string {
  const d = new Date(t)
  const day = d.getDate().toString().padStart(2, '0')
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${day}/${(d.getMonth() + 1).toString().padStart(2, '0')} · ${hour}:${min}`
}
