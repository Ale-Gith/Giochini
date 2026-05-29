import { useEffect, useState } from 'react'
import type { GameEvent } from '../types'

// Store condiviso di eventi "locali" (assegnati durante questa sessione).
// Persistito in localStorage. Subscribers notificati ad ogni cambio.
// Quando Firebase sarà collegato, lo store passerà a Firestore.

const LS_KEY = 'campioni.localEvents'

function loadFromLS(): GameEvent[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveToLS(events: GameEvent[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(events))
}

class EventsStore {
  private events: GameEvent[] = loadFromLS()
  private subs = new Set<() => void>()

  getAll(): GameEvent[] {
    return this.events
  }

  add(event: GameEvent): void {
    this.events = [...this.events, event]
    saveToLS(this.events)
    this.notify()
  }

  remove(id: string): void {
    this.events = this.events.filter(e => e.id !== id)
    saveToLS(this.events)
    this.notify()
  }

  clear(): void {
    this.events = []
    saveToLS(this.events)
    this.notify()
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
