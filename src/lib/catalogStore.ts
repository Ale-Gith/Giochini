import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
  type Firestore,
} from 'firebase/firestore'
import { getDb } from './firebase'
import type { CatalogItem } from '../types'

// Store del manifesto (catalogo premi/penalità).
// Real-time da Firestore. Fallback localStorage se offline.

const COL = 'catalog'
const LS_KEY = 'campioni.catalogCache'

function loadLocal(): CatalogItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocal(items: CatalogItem[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

class CatalogStore {
  private items: CatalogItem[] = loadLocal()
  private subs = new Set<() => void>()
  private db: Firestore | null = null
  private firestoreReady = false

  constructor() {
    void this.init()
  }

  private async init() {
    const db = await getDb()
    if (!db) {
      console.warn('[catalogStore] Firestore non disponibile — modalità localStorage')
      return
    }
    this.db = db

    const q = query(collection(db, COL), orderBy('createdAt', 'desc'))
    onSnapshot(
      q,
      snapshot => {
        this.items = snapshot.docs.map(d => {
          const data = d.data() as Omit<CatalogItem, 'id'>
          return {
            id: d.id,
            description: data.description,
            points: data.points,
            createdAt: data.createdAt,
          }
        })
        saveLocal(this.items)
        this.firestoreReady = true
        this.notify()
      },
      err => {
        console.warn('[catalogStore] onSnapshot error:', err)
      },
    )
  }

  getAll(): CatalogItem[] {
    return this.items
  }

  isOnline(): boolean {
    return this.firestoreReady
  }

  /**
   * Sostituisce l'intero catalog: cancella tutti gli item esistenti
   * e crea quelli nuovi. Usato dall'upload excel dell'owner.
   */
  async replace(newItems: Omit<CatalogItem, 'id'>[]): Promise<void> {
    if (!this.db) {
      // offline fallback
      this.items = newItems.map((i, idx) => ({ ...i, id: `local-${Date.now()}-${idx}` }))
      saveLocal(this.items)
      this.notify()
      return
    }
    const batch = writeBatch(this.db)
    this.items.forEach(item => {
      batch.delete(doc(this.db!, COL, item.id))
    })
    newItems.forEach(item => {
      const ref = doc(collection(this.db!, COL))
      batch.set(ref, item)
    })
    await batch.commit()
  }

  subscribe(fn: () => void): () => void {
    this.subs.add(fn)
    return () => this.subs.delete(fn)
  }

  private notify(): void {
    this.subs.forEach(fn => fn())
  }
}

export const catalogStore = new CatalogStore()

export function useCatalog(): CatalogItem[] {
  const [, tick] = useState(0)
  useEffect(() => catalogStore.subscribe(() => tick(t => t + 1)), [])
  return catalogStore.getAll()
}
