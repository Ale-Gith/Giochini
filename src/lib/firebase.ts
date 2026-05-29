// Inizializzazione Firebase + Anonymous Auth.
// Le funzioni qui sotto restituiscono Promise che si risolvono quando l'auth è pronta,
// così gli store (eventsStore, catalogStore) possono aspettare prima di leggere/scrivere.

import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  type Firestore,
} from 'firebase/firestore'
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth'
import { firebaseConfig } from './firebaseConfig'

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let initError: string | null = null

let readyPromise: Promise<{ db: Firestore; auth: Auth; user: User } | null> | null = null

function getReady(): Promise<{ db: Firestore; auth: Auth; user: User } | null> {
  if (readyPromise) return readyPromise

  readyPromise = (async () => {
    try {
      app = initializeApp(firebaseConfig)
      db = getFirestore(app)
      auth = getAuth(app)

      // Aspetta che l'auth sia pronta (anonima)
      const user = await new Promise<User>((resolve, reject) => {
        const unsub = onAuthStateChanged(auth!, async u => {
          if (u) {
            unsub()
            resolve(u)
          } else {
            try {
              const cred = await signInAnonymously(auth!)
              resolve(cred.user)
            } catch (e) {
              reject(e)
            }
          }
        }, reject)
      })

      return { db, auth, user }
    } catch (e) {
      initError = (e as Error).message
      console.warn('[firebase] init failed — running in offline mode:', initError)
      return null
    }
  })()

  return readyPromise
}

export async function getDb(): Promise<Firestore | null> {
  const r = await getReady()
  return r?.db ?? null
}

export async function getUser(): Promise<User | null> {
  const r = await getReady()
  return r?.user ?? null
}

export function isOnline(): boolean {
  return db !== null && initError === null
}

export function getInitError(): string | null {
  return initError
}

// Avvia init in background
void getReady()
