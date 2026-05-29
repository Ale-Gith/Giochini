export type CharacterId =
  | 'pertega'
  | 'bronto'
  | 'maje'
  | 'forcio'
  | 'grosso'
  | 'denisio'
  | 'colosseo'

export interface Character {
  id: CharacterId
  name: string
  nickname: string
  motto: string
  color: string
  emoji: string
  photoURL?: string
  email?: string
}

export interface CatalogItem {
  id: string
  description: string
  points: number
  createdAt: number
}

export interface GameEvent {
  id: string
  playerId: CharacterId
  catalogItemId: string | null
  description: string
  points: number
  assignedBy: string
  timestamp: number
}

export interface Session {
  email: string
  characterId: CharacterId | null
  isOwner: boolean
}
