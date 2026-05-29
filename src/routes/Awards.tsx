import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Awards.module.css'
import { CHARACTERS, CHARACTERS_BY_ID } from '../data/characters'
import { MOCK_CATALOG } from '../data/mockCatalog'
import { MOCK_EVENTS } from '../data/mockEvents'
import { Avatar } from '../components/Avatar'
import { eventsStore, useLocalEvents } from '../lib/eventsStore'
import type { AppSession } from '../App'
import type { CatalogItem, CharacterId, GameEvent } from '../types'

interface Props {
  session: AppSession
}

type Filter = 'all' | 'premi' | 'penalita'

export default function Awards({ session }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [chosen, setChosen] = useState<CatalogItem | null>(null)
  const [chosenPlayer, setChosenPlayer] = useState<CharacterId | null>(null)
  const localEvents = useLocalEvents()
  const navigate = useNavigate()

  const allEvents = [...MOCK_EVENTS, ...localEvents]
  const feed = [...allEvents].sort((a, b) => b.timestamp - a.timestamp)

  const stats = useMemo(() => ({
    total: MOCK_CATALOG.length,
    premi: MOCK_CATALOG.filter(c => c.points > 0).length,
    penalita: MOCK_CATALOG.filter(c => c.points < 0).length,
  }), [])

  const filtered = MOCK_CATALOG.filter(item => {
    if (filter === 'premi') return item.points > 0
    if (filter === 'penalita') return item.points < 0
    return true
  })

  function openAssign(item: CatalogItem) {
    if (!session.isOwner) return
    setChosen(item)
    setChosenPlayer(null)
  }

  function confirmAssign() {
    if (!chosen || !chosenPlayer) return
    const newEvent: GameEvent = {
      id: `local-${Date.now()}`,
      playerId: chosenPlayer,
      catalogItemId: chosen.id,
      description: chosen.description,
      points: chosen.points,
      assignedBy: session.email,
      timestamp: Date.now(),
    }
    eventsStore.add(newEvent)
    setChosen(null)
    setChosenPlayer(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.eyebrow}>Manifesto del capitano · MMXXVI</div>
            <h1 className={styles.title}>
              Onori<span className={styles.titleSlash}>&</span>Castighi
            </h1>
            <p className={styles.tagline}>
              Le bravate da premiare e le cazzate da bollare. Il capitano sceglie,
              il diario registra.
            </p>
          </div>
          <div className={styles.heroMeta}>
            <span>Voci a manifesto</span>
            <span className={styles.heroMetaNum}>{stats.total}</span>
            <span>{stats.premi} onori · {stats.penalita} castighi</span>
          </div>
        </header>

        {/* Filters */}
        <div className={styles.filters}>
          {([
            ['all', 'Tutti', stats.total],
            ['premi', 'Onori', stats.premi],
            ['penalita', 'Castighi', stats.penalita],
          ] as const).map(([k, label, count]) => (
            <button
              key={k}
              className={`${styles.filterBtn} ${filter === k ? styles.active : ''}`}
              onClick={() => setFilter(k)}
            >
              {label}<span className={styles.filterCount}>{count}</span>
            </button>
          ))}
        </div>

        <div className={styles.ornament} aria-hidden>✦ · ✦ · ✦</div>

        {/* Catalog grid */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Manifesto</h2>
            <span className={styles.sectionMeta}>
              {session.isOwner ? 'Click su una voce per assegnarla' : 'Solo lettura · spettatori a bordo'}
            </span>
          </div>
          <div className={styles.grid}>
            {filtered.map(item => {
              const pos = item.points > 0
              return (
                <button
                  key={item.id}
                  className={styles.card}
                  onClick={() => openAssign(item)}
                  disabled={!session.isOwner}
                  style={{ cursor: session.isOwner ? 'pointer' : 'default' }}
                >
                  <div className={styles.cardTop}>
                    <span className={`${styles.cardPoints} ${pos ? styles.cardPointsPositive : styles.cardPointsNegative}`}>
                      {pos ? `+${item.points}` : item.points}
                    </span>
                    <span className={`${styles.cardKind} ${pos ? styles.cardKindPositive : styles.cardKindNegative}`}>
                      {pos ? 'Onore' : 'Castigo'}
                    </span>
                  </div>
                  <div className={styles.cardText}>{item.description}</div>
                </button>
              )
            })}
          </div>
        </section>

        <div className={styles.ornament} aria-hidden>✦ · ✦ · ✦</div>

        {/* Feed cronologico */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Diario di bordo</h2>
            <span className={styles.sectionMeta}>{feed.length} voci · ordine cronologico inverso</span>
          </div>
          <div className={styles.feed}>
            {feed.length === 0 ? (
              <div className={styles.empty}>Diario ancora vergine. Ogni storia comincia da qua.</div>
            ) : feed.map(ev => {
              const c = CHARACTERS_BY_ID[ev.playerId]
              const pos = ev.points > 0
              return (
                <div
                  key={ev.id}
                  className={styles.feedRow}
                  onClick={() => navigate(`/character/${ev.playerId}`)}
                >
                  <span className={styles.feedTime}>{formatTime(ev.timestamp)}</span>
                  <div className={styles.feedBody}>
                    <Avatar character={c} size={36} />
                    <div className={styles.feedNames}>
                      <span className={styles.feedPlayer}>{c.name}</span>
                      <span className={styles.feedDesc}>{ev.description}</span>
                    </div>
                  </div>
                  <span className={`${styles.feedPoints} ${pos ? styles.feedPointsPositive : styles.feedPointsNegative}`}>
                    {pos ? `+${ev.points}` : ev.points}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Modal assign */}
      {chosen && (
        <div className={styles.modalBackdrop} onClick={() => setChosen(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <span className={styles.modalSub}>{chosen.points > 0 ? 'Onore' : 'Castigo'} · assegna</span>
                <h3 className={styles.modalTitle}>A quale pirata?</h3>
              </div>
              <button className={styles.modalClose} onClick={() => setChosen(null)} aria-label="Chiudi">×</button>
            </div>

            <div className={styles.modalSection}>
              <span className={styles.modalLabel}>Voce a manifesto</span>
              <div className={styles.modalChosenItem}>
                <span className={`${styles.modalChosenPoints} ${chosen.points > 0 ? styles.cardPointsPositive : styles.cardPointsNegative}`}>
                  {chosen.points > 0 ? `+${chosen.points}` : chosen.points}
                </span>
                <span className={styles.modalChosenDesc}>{chosen.description}</span>
              </div>
            </div>

            <div className={styles.modalSection}>
              <span className={styles.modalLabel}>Pirata</span>
              <div className={styles.playerChips}>
                {CHARACTERS.map(c => (
                  <button
                    key={c.id}
                    className={`${styles.playerChip} ${chosenPlayer === c.id ? styles.selected : ''}`}
                    onClick={() => setChosenPlayer(c.id)}
                  >
                    <Avatar character={c} size={22} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => setChosen(null)}>Annulla</button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={confirmAssign}
                disabled={!chosenPlayer}
              >
                Annota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
