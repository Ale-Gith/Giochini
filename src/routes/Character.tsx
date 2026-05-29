import { useMemo, useState, type FormEvent } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import styles from './Character.module.css'
import { CHARACTERS, CHARACTERS_BY_ID } from '../data/characters'
import { MOCK_EVENTS } from '../data/mockEvents'
import { buildSeries, getRanking } from '../lib/scoring'
import { Avatar } from '../components/Avatar'
import { useLocalEvents } from '../lib/eventsStore'
import type { AppSession } from '../App'
import type { Character, CharacterId } from '../types'

interface Props {
  session: AppSession
}

interface DraftChar {
  name: string
  nickname: string
  motto: string
  color: string
  emoji: string
}

const OVERRIDES_KEY = 'campioni.characterOverrides'

function loadOverrides(): Record<string, Partial<DraftChar>> {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveOverrides(overrides: Record<string, Partial<DraftChar>>): void {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
}

export default function CharacterPage({ session }: Props) {
  const { id } = useParams<{ id: CharacterId }>()
  const baseChar = id ? CHARACTERS_BY_ID[id] : null

  const [overrides, setOverrides] = useState(loadOverrides())

  // Applica gli override (se presenti) al personaggio
  const character: Character | null = useMemo(() => {
    if (!baseChar) return null
    const ov = overrides[baseChar.id] || {}
    return { ...baseChar, ...ov } as Character
  }, [baseChar, overrides])

  const localEvents = useLocalEvents()
  const events = [...MOCK_EVENTS, ...localEvents]
  const ranking = useMemo(() => getRanking(buildSeries(CHARACTERS, events)), [events])

  if (!id || !character) return <Navigate to="/score" replace />

  const myRank = ranking.findIndex(s => s.character.id === character.id) + 1
  const myEvents = events.filter(e => e.playerId === character.id).sort((a, b) => b.timestamp - a.timestamp)
  const total = myEvents.reduce((s, e) => s + e.points, 0)
  const premiCount = myEvents.filter(e => e.points > 0).length
  const penalitaCount = myEvents.filter(e => e.points < 0).length
  const best = myEvents.reduce((a, b) => (b.points > (a?.points ?? -Infinity) ? b : a), myEvents[0])
  const worst = myEvents.reduce((a, b) => (b.points < (a?.points ?? Infinity) ? b : a), myEvents[0])

  const isMine = session.characterId === character.id

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroAvatar}>
            <Avatar character={character} size={140} ring />
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.eyebrow}>
              {isMine ? 'La tua scheda pirata' : 'Scheda pirata'}
            </div>
            <h1 className={styles.name}>{character.name}</h1>
            <p className={styles.nick}>· {character.nickname}</p>
            <blockquote className={styles.motto}>{character.motto}</blockquote>
          </div>
          <div className={styles.heroRank}>
            <span>Rango</span>
            <span className={styles.rankNum}>{myRank > 0 ? String(myRank).padStart(2, '0') : '—'}</span>
            <span className={styles.rankTotal}>su {CHARACTERS.length}</span>
          </div>
        </header>

        {/* Stats */}
        <section className={styles.statsGrid}>
          <Stat label="Bottino" value={total > 0 ? `+${total}` : `${total}`}
            variant={total > 0 ? 'positive' : total < 0 ? 'negative' : 'neutral'} />
          <Stat label="Eventi" value={myEvents.length} />
          <Stat label="Onori" value={premiCount} variant="positive" />
          <Stat label="Castighi" value={penalitaCount} variant="negative" />
          <Stat
            label="Picco di gloria"
            value={best ? (best.points > 0 ? `+${best.points}` : `${best.points}`) : '—'}
            hint={best?.description}
          />
          <Stat
            label="Sciagura"
            value={worst ? (worst.points > 0 ? `+${worst.points}` : `${worst.points}`) : '—'}
            hint={worst?.description}
          />
        </section>

        <div className={styles.ornament} aria-hidden>✦ · ✦ · ✦</div>

        {/* History */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Diario di bordo</h2>
            <span className={styles.sectionMeta}>
              {myEvents.length} eventi · ordine inverso
            </span>
          </div>
          <div className={styles.history}>
            {myEvents.length === 0 ? (
              <div className={styles.empty}>Nessuna voce nel diario. La storia è ancora da scrivere.</div>
            ) : myEvents.map(ev => {
              const pos = ev.points > 0
              return (
                <div key={ev.id} className={styles.historyRow}>
                  <span className={styles.historyTime}>{formatTime(ev.timestamp)}</span>
                  <span className={styles.historyDesc}>{ev.description}</span>
                  <span className={`${styles.historyPoints} ${pos ? styles.historyPointsPositive : styles.historyPointsNegative}`}>
                    {pos ? `+${ev.points}` : ev.points}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Settings — solo se è il proprio personaggio */}
        {isMine && (
          <SettingsForm
            character={character}
            onSave={partial => {
              const next = {
                ...overrides,
                [character.id]: { ...(overrides[character.id] || {}), ...partial },
              }
              setOverrides(next)
              saveOverrides(next)
            }}
            onReset={() => {
              const next = { ...overrides }
              delete next[character.id]
              setOverrides(next)
              saveOverrides(next)
            }}
            modified={Boolean(overrides[character.id])}
          />
        )}
      </div>
    </div>
  )
}

interface StatProps {
  label: string
  value: string | number
  hint?: string
  variant?: 'positive' | 'negative' | 'neutral'
}

function Stat({ label, value, hint, variant = 'neutral' }: StatProps) {
  const cls = variant === 'positive'
    ? styles.statValuePositive
    : variant === 'negative' ? styles.statValueNegative : ''
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} ${cls}`}>{value}</span>
      {hint && <span className={styles.statHint}>{hint}</span>}
    </div>
  )
}

interface SettingsProps {
  character: Character
  onSave: (partial: Partial<DraftChar>) => void
  onReset: () => void
  modified: boolean
}

function SettingsForm({ character, onSave, onReset, modified }: SettingsProps) {
  const [draft, setDraft] = useState<DraftChar>({
    name: character.name,
    nickname: character.nickname,
    motto: character.motto,
    color: character.color,
    emoji: character.emoji,
  })
  const [showOk, setShowOk] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSave(draft)
    setShowOk(true)
    setTimeout(() => setShowOk(false), 1500)
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Cabina personale</h2>
        <span className={styles.sectionMeta}>
          {modified ? 'modifiche attive' : 'preset di fabbrica'}
        </span>
      </div>
      <form className={styles.settingsForm} onSubmit={handleSubmit}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Nome di bandiera</label>
          <input
            className={styles.formInput}
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Soprannome</label>
          <input
            className={styles.formInput}
            value={draft.nickname}
            onChange={e => setDraft({ ...draft, nickname: e.target.value })}
          />
        </div>

        <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
          <label className={styles.formLabel}>Motto del pirata</label>
          <input
            className={styles.formInput}
            value={draft.motto}
            onChange={e => setDraft({ ...draft, motto: e.target.value })}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Colore sulla rotta</label>
          <div className={styles.formColor}>
            <input
              type="color"
              className={styles.colorSwatch}
              value={draft.color}
              onChange={e => setDraft({ ...draft, color: e.target.value })}
            />
            <span className={styles.colorHex}>{draft.color}</span>
          </div>
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Emoji rappresentativa</label>
          <input
            className={styles.formEmoji}
            value={draft.emoji}
            onChange={e => setDraft({ ...draft, emoji: e.target.value })}
            maxLength={4}
          />
        </div>

        <div className={styles.settingsActions} style={{ gridColumn: '1 / -1' }}>
          {showOk && <span className={styles.saveOk}>✓ Salvato</span>}
          {modified && (
            <button type="button" className={styles.btn} onClick={() => {
              onReset()
              setDraft({
                name: character.name, nickname: character.nickname, motto: character.motto,
                color: character.color, emoji: character.emoji,
              })
            }}>Ripristina</button>
          )}
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Salva</button>
        </div>
      </form>
    </section>
  )
}

function formatTime(t: number): string {
  const d = new Date(t)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${day}/${month} ${hour}:${min}`
}
