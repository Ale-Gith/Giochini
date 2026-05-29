// Inizializzazione Firebase. La config va in `firebaseConfig.ts` (vedi README).
// In modalità sviluppo, se la config non c'è, l'app gira lo stesso ma in "offline mode"
// (nessuna persistenza condivisa). Utile per lavorare sul design senza Firebase pronto.

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth'

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let initialized = false
let initError: string | null = null

async function init() {
  if (initialized) return
  initialized = true
  try {
    const { firebaseConfig } = await import('./firebaseConfig')
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    await signInAnonymously(auth)
  } catch (e) {
    initError = (e as Error).message
    console.warn('[firebase] init failed — running in offline mode:', initError)
  }
}

// Avvia init in background
void init()

export function getDb(): Firestore | null {
  return db
}

export function getAuthInstance(): Auth | null {
  return auth
}

export function isOnline(): boolean {
  return db !== null
}

export function getInitError(): string | null {
  return initError
}
