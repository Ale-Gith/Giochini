import type { CatalogItem } from '../types'

// Mock catalog (premi positivi + penalità negative).
// Verrà sostituito dal contenuto dell'excel caricato dall'owner.

export const MOCK_CATALOG: CatalogItem[] = [
  // ─── Premi ────────────────────────────────────────
  { id: 'p01', description: 'Apre le danze in pista', points: 10, createdAt: 0 },
  { id: 'p02', description: 'Tuffo da Pertega ben atterrato', points: 18, createdAt: 0 },
  { id: 'p03', description: 'Aforisma da Maje al tavolo', points: 8, createdAt: 0 },
  { id: 'p04', description: 'Riapparizione misteriosa con superalcolici', points: 15, createdAt: 0 },
  { id: 'p05', description: 'Sceneggiata romana credibile', points: 10, createdAt: 0 },
  { id: 'p06', description: 'Vince a carte senza sforzo', points: 9, createdAt: 0 },
  { id: 'p07', description: 'Brindisi in latino corretto', points: 14, createdAt: 0 },
  { id: 'p08', description: 'Trovata creativa che fa ridere tutti', points: 12, createdAt: 0 },
  { id: 'p09', description: 'Resiste fino all\'alba', points: 20, createdAt: 0 },
  { id: 'p10', description: 'Spallata vincente al barista', points: 12, createdAt: 0 },

  // ─── Penalità ─────────────────────────────────────
  { id: 'n01', description: 'Si addormenta sul divano', points: -5, createdAt: 0 },
  { id: 'n02', description: 'Sparisce per ore senza avvisare', points: -8, createdAt: 0 },
  { id: 'n03', description: 'Mangia l\'ultimo pezzo altrui', points: -4, createdAt: 0 },
  { id: 'n04', description: 'Cita Mario Brega male', points: -5, createdAt: 0 },
  { id: 'n05', description: 'Vola alto e atterra male', points: -7, createdAt: 0 },
  { id: 'n06', description: 'Si pianta dopo due birre', points: -6, createdAt: 0 },
  { id: 'n07', description: 'Russa al tavolo', points: -3, createdAt: 0 },
  { id: 'n08', description: 'Cazzata generica non meglio specificata', points: -2, createdAt: 0 },
  { id: 'n09', description: 'Polemica inutile sui sedili', points: -4, createdAt: 0 },
  { id: 'n10', description: 'Foto sbagliata al posto sbagliato', points: -6, createdAt: 0 },
]
