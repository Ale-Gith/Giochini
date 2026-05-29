import allowlistData from '../data/allowlist.json'
import type { CharacterId } from '../types'

export const OWNER_EMAIL = 'franceschi.ale4@gmail.com'

const SESSION_KEY = 'campioni.session'

export interface StoredSession {
  email: string
  characterId: CharacterId | null
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

function getMapping(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [email, charId] of Object.entries(allowlistData.mapping)) {
    out[normalizeEmail(email)] = charId
  }
  return out
}

export function isAllowed(email: string): boolean {
  return normalizeEmail(email) in getMapping()
}

export function isOwner(email: string): boolean {
  return normalizeEmail(email) === normalizeEmail(OWNER_EMAIL)
}

export function getCharacterIdForEmail(email: string): CharacterId | null {
  const mapping = getMapping()
  const charId = mapping[normalizeEmail(email)]
  return (charId as CharacterId) ?? null
}

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

export function saveSession(session: StoredSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}
