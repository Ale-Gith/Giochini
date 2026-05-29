import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  type Firestore,
} from 'firebase/firestore'
import { getDb } from './firebase'
import type { CharacterId, GameEvent } from '../types'

// Store eventi: legge da Firestore in real-time se disponibile, altrimenti localStorage.
// Sottoscrittori React notificati ad ogni cambio.

const LS_KEY = 'campioni.localEvents'
const COL = 'events'

function loadLocal(): GameEvent[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocal(events: GameEvent[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(events))
}

interface FirestoreEventDoc {
  playerId: CharacterId
  catalogItemId: string | null
  description: string
  points: number
  assignedBy: string
  timestamp: Timestamp
}

class EventsStore {
  private events: GameEvent[] = loadLocal()
  private subs = new Set<() => void>()
  private db: Firestore | null = null
  private firestoreReady = false

  constructor() {
    void this.initFirestore()
  }

  private async initFirestore() {
    const db = await getDb()
    if (!db) {
      console.warn('[eventsStore] Firestore non disponibile — modalità localStorage')
      return
    }
    this.db = db

    const q = query(collection(db, COL), orderBy('timestamp', 'asc'))
    onSnapshot(
      q,
      snapshot => {
        const events: GameEvent[] = snapshot.docs.map(doc => {
          const data = doc.data() as FirestoreEventDoc
          return {
            id: doc.id,
            playerId: data.playerId,
            catalogItemId: data.catalogItemId,
            description: data.description,
            points: data.points,
            assignedBy: data.assignedBy,
            timestamp: data.timestamp.toMillis(),
          }
        })
        this.events = events
        saveLocal(events)
        this.firestoreReady = true
        this.notify()
      },
      err => {
        console.warn('[eventsStore] onSnapshot error:', err)
      },
    )
  }

  getAll(): GameEvent[] {
    return this.events
  }

  isOnline(): boolean {
    return this.firestoreReady
  }

  async add(event: Omit<GameEvent, 'id'>): Promise<void> {
    if (this.db) {
      // Scrivi su Firestore. Lo snapshot si aggiornerà da solo.
      await addDoc(collection(this.db, COL), {
        playerId: event.playerId,
        catalogItemId: event.catalogItemId,
        description: event.description,
        points: event.points,
        assignedBy: event.assignedBy,
        timestamp: Timestamp.fromMillis(event.timestamp),
      })
    } else {
      // Fallback offline
      const local: GameEvent = { ...event, id: `local-${Date.now()}` }
      this.events = [...this.events, local]
      saveLocal(this.events)
      this.notify()
    }
  }

  subscribe(fn: () => void): () => void {
    this.subs.add(fn)
    return () => this.subs.delete(fn)
  }

  private notify(): void {
    this.subs.forEach(fn => fn())
  }
}

export const eventsStore = new EventsStore()

export function useLocalEvents(): GameEvent[] {
  const [, tick] = useState(0)
  useEffect(() => eventsStore.subscribe(() => tick(t => t + 1)), [])
  return eventsStore.getAll()
}
