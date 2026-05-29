import type { CharacterId, GameEvent } from '../types'

// Dati di esempio per progettare la pagina Score senza Firebase pronto.
// Quando Firestore sarà collegato, sostituire con i dati reali.

const day = 24 * 60 * 60 * 1000
const start = new Date('2026-08-10T20:00:00').getTime()

function ev(
  offsetH: number,
  playerId: CharacterId,
  points: number,
  description: string,
): GameEvent {
  return {
    id: `mock-${playerId}-${offsetH}`,
    playerId,
    catalogItemId: null,
    description,
    points,
    assignedBy: 'mock',
    timestamp: start + offsetH * 60 * 60 * 1000,
  }
}

export const MOCK_EVENTS: GameEvent[] = [
  ev(0, 'pertega', 10, 'Ha aperto le danze'),
  ev(1, 'bronto', -5, 'Già addormentato sul divano'),
  ev(2, 'maje', 8, 'Aforisma vincente al tavolo'),
  ev(3, 'forcio', 12, 'Spallata al barista, gratis le birre'),
  ev(4, 'grosso', -3, 'Mangia l\'ultimo pezzo di pizza altrui'),
  ev(5, 'denisio', 15, 'Appare dal nulla con i superalcolici'),
  ev(6, 'colosseo', 7, 'Racconta una storia romana credibile'),
  ev(7, 'pertega', -4, 'Vola alto, atterra male'),
  ev(day / 3600000 + 1, 'maje', 5, 'Indovina la canzone'),
  ev(day / 3600000 + 3, 'forcio', -6, 'Si pianta dopo due birre'),
  ev(day / 3600000 + 5, 'bronto', 9, 'Si sveglia e vince a carte'),
  ev(day / 3600000 + 7, 'grosso', 11, 'Mangia per quattro'),
  ev(day / 3600000 + 9, 'denisio', -8, 'Sparisce per ore'),
  ev(day / 3600000 + 11, 'colosseo', 14, 'Brindisi in latino, vincente'),
  ev((day * 2) / 3600000 + 2, 'pertega', 18, 'Volo dell\'aquila, ben atterrato'),
  ev((day * 2) / 3600000 + 4, 'maje', -2, 'Aforisma scivolato in cliché'),
  ev((day * 2) / 3600000 + 6, 'forcio', 9, 'Forza bruta utile'),
  ev((day * 2) / 3600000 + 8, 'denisio', 13, 'Riappare con i dolci'),
  ev((day * 2) / 3600000 + 10, 'grosso', -4, 'Russa al tavolo'),
  ev((day * 2) / 3600000 + 12, 'bronto', 6, 'Tonante negli applausi'),
  ev((day * 2) / 3600000 + 14, 'colosseo', -5, 'Cita Mario Brega male'),
]
