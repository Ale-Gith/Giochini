import type { Character, CharacterId, GameEvent } from '../types'

export interface ScorePoint {
  t: number
  score: number
}

export interface PlayerSeries {
  character: Character
  total: number
  points: ScorePoint[]
}

/**
 * Calcola, per ogni personaggio, la serie cumulativa di punteggio nel tempo.
 * Tutte le serie partono dal primo evento globale (score = 0) e proseguono
 * con i propri eventi cumulati.
 */
export function buildSeries(
  characters: Character[],
  events: GameEvent[],
): PlayerSeries[] {
  if (events.length === 0) {
    return characters.map(c => ({ character: c, total: 0, points: [] }))
  }

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp)
  const t0 = sorted[0].timestamp
  const tEnd = sorted[sorted.length - 1].timestamp

  return characters.map(character => {
    const own = sorted.filter(e => e.playerId === character.id)
    const points: ScorePoint[] = [{ t: t0, score: 0 }]
    let acc = 0
    for (const e of own) {
      acc += e.points
      points.push({ t: e.timestamp, score: acc })
    }
    // Estendi sempre fino alla fine del tempo "di gioco" per allineare i culmini
    if (points[points.length - 1].t < tEnd) {
      points.push({ t: tEnd, score: acc })
    }
    return { character, total: acc, points }
  })
}

export function getRanking(series: PlayerSeries[]): PlayerSeries[] {
  return [...series].sort((a, b) => b.total - a.total)
}

export function getLastDelta(
  events: GameEvent[],
  playerId: CharacterId,
): number | null {
  const own = events.filter(e => e.playerId === playerId)
  if (own.length === 0) return null
  return own[own.length - 1].points
}
