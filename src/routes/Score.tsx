import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Score.module.css'
import { CHARACTERS } from '../data/characters'
import { MOCK_EVENTS } from '../data/mockEvents'
import { buildSeries, getLastDelta, getRanking } from '../lib/scoring'
import { Avatar } from '../components/Avatar'
import { TrendChart } from '../components/TrendChart'
import { eventsStore, useLocalEvents } from '../lib/eventsStore'
import { useCatalog } from '../lib/catalogStore'
import type { AppSession } from '../App'
import type { CharacterId } from '../types'

interface Props {
  session: AppSession
}

export default function Score({ session }: Props) {
  const navigate = useNavigate()
  const localEvents = useLocalEvents()
  const catalog = useCatalog()
  const [modalOpen, setModalOpen] = useState(false)
  const [draftPlayer, setDraftPlayer] = useState<CharacterId | null>(null)
  const [draftCatalogId, setDraftCatalogId] = useState<string>('')

  const allEvents = [...MOCK_EVENTS, ...localEvents]

  const { ranking, series } = useMemo(() => {
    const s = buildSeries(CHARACTERS, allEvents)
    return { ranking: getRanking(s), series: s }
  }, [allEvents])

  function go(id: CharacterId) {
    navigate(`/character/${id}`)
  }

  function openModal() {
    setDraftPlayer(null)
    setDraftCatalogId('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!draftPlayer || !draftCatalogId) return
    const item = catalog.find(c => c.id === draftCatalogId)
    if (!item) return
    void eventsStore.add({
      playerId: draftPlayer,
      catalogItemId: item.id,
      description: item.description,
      points: item.points,
      assignedBy: session.email,
      timestamp: Date.now(),
    }).catch(err => console.error('Errore salvataggio evento:', err))
    closeModal()
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Compass watermark */}
        <CompassRose className={styles.compass} />

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.eyebrow}>Carta nautica · 31.07 — 14.08 · MMXXVI</div>
            <h1 className={styles.title}>
              Il <span className={styles.titleAccent}>Bottino</span>
            </h1>
            <p className={styles.tagline}>
              Chi più, chi meno, chi prende e chi paga. La verità sta nella tabella, la
              poesia nella curva.
            </p>
          </div>
          <div className={styles.heroMeta}>
            <span>Eventi registrati</span>
            <span className={styles.heroMetaNum}>{allEvents.length}</span>
            <span>aggiornamento in tempo reale</span>
          </div>
        </header>

        <div className={styles.ornament} aria-hidden>✦ · ✦ · ✦</div>

        {/* Leaderboard */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Rango della ciurma</h2>
            <span className={styles.sectionMeta}>{ranking.length} pirati in mare</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.headerCell}>Pos.</th>
                <th className={styles.headerCell} colSpan={2}>Pirata</th>
                <th className={`${styles.headerCell} ${styles.headerCellRight}`}>Ultimo</th>
                <th className={`${styles.headerCell} ${styles.headerCellRight}`}>Bottino</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((s, i) => {
                const delta = getLastDelta(allEvents, s.character.id)
                return (
                  <tr
                    key={s.character.id}
                    className={styles.tableRow}
                    onClick={() => go(s.character.id)}
                  >
                    <td className={`${styles.cell} ${styles.rank} ${i === 0 ? styles.rankTop : ''}`}>
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td className={`${styles.cell} ${styles.cellAvatar}`}>
                      <Avatar character={s.character} size={44} />
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.name}>{s.character.name}</span>
                      <span className={styles.nick}>· {s.character.nickname}</span>
                    </td>
                    <td className={`${styles.cell} ${styles.delta} ${
                      delta === null ? '' :
                      delta > 0 ? styles.deltaPositive : styles.deltaNegative
                    }`}>
                      {delta === null ? '—' : delta > 0 ? `+${delta}` : `${delta}`}
                    </td>
                    <td className={`${styles.cell} ${styles.score} ${i === 0 ? styles.scoreTop : ''}`}>
                      {s.total > 0 ? `+${s.total}` : s.total}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        <div className={styles.ornament} aria-hidden>✦ · ✦ · ✦</div>

        {/* Trend chart */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Rotta del bottino</h2>
            <span className={styles.sectionMeta}>asse x · tempo  ·  asse y · punteggio</span>
          </div>
          <div className={styles.chartCard}>
            <TrendChart series={series} onSelect={go} />
          </div>
        </section>
      </div>

      {/* FAB Annota (owner only) */}
      {session.isOwner && !modalOpen && (
        <button
          type="button"
          className={styles.fab}
          onClick={openModal}
        >
          Annota
        </button>
      )}

      {/* Modal Add Score */}
      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <form className={styles.modal} onClick={e => e.stopPropagation()} onSubmit={handleSave}>
            <div className={styles.modalHead}>
              <div>
                <span className={styles.modalEyebrow}>Incidente di bordo</span>
                <h3 className={styles.modalTitle}>Annota nel diario</h3>
                <p className={styles.modalSub}>
                  Scegli il pirata e cosa è successo dal manifesto.
                </p>
              </div>
              <button type="button" className={styles.modalClose} onClick={closeModal} aria-label="Chiudi">×</button>
            </div>

            <div className={styles.modalSection}>
              <span className={styles.modalLabel}>Pirata</span>
              <div className={styles.playerChips}>
                {CHARACTERS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.playerChip} ${draftPlayer === c.id ? styles.selected : ''}`}
                    onClick={() => setDraftPlayer(c.id)}
                  >
                    <Avatar character={c} size={22} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.modalSection}>
              <span className={styles.modalLabel}>Cosa è stato fatto</span>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={draftCatalogId}
                  onChange={e => setDraftCatalogId(e.target.value)}
                  disabled={catalog.length === 0}
                >
                  <option value="">
                    {catalog.length === 0
                      ? '— Manifesto vuoto · carica un excel dalla Cabina —'
                      : '— Seleziona una voce dal manifesto —'}
                  </option>
                  {catalog.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.points > 0 ? `+${item.points}` : item.points} · {item.description}
                    </option>
                  ))}
                </select>
                <span className={styles.selectArrow} aria-hidden>▾</span>
              </div>
              {catalog.length === 0 && (
                <p className={styles.selectHint}>
                  Le voci compariranno qui quando il capitano carica il rotolo (excel) dalla Cabina.
                </p>
              )}
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={closeModal}>Annulla</button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={!draftPlayer || !draftCatalogId}
              >
                Annota
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

interface CompassProps {
  className?: string
}

function CompassRose({ className }: CompassProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      aria-hidden
    >
      <circle cx="100" cy="100" r="90" />
      <circle cx="100" cy="100" r="60" />
      <circle cx="100" cy="100" r="4" fill="currentColor" />
      {/* 8 punte principali */}
      <g>
        <polygon points="100,10 95,95 100,100 105,95" fill="currentColor" />
        <polygon points="100,190 95,105 100,100 105,105" fill="currentColor" opacity="0.4" />
        <polygon points="10,100 95,95 100,100 95,105" fill="currentColor" opacity="0.6" />
        <polygon points="190,100 105,95 100,100 105,105" fill="currentColor" opacity="0.6" />
        {/* Diagonali */}
        <polygon points="36,36 96,96 100,100 96,96" fill="currentColor" opacity="0.3" />
        <polygon points="164,164 104,104 100,100 104,104" fill="currentColor" opacity="0.3" />
        <polygon points="164,36 104,96 100,100 100,96" fill="currentColor" opacity="0.3" />
        <polygon points="36,164 96,104 100,100 100,104" fill="currentColor" opacity="0.3" />
      </g>
      {/* N E S O */}
      <text x="100" y="30" textAnchor="middle" fontSize="14" fontFamily="Cinzel, serif" fontWeight="900" fill="currentColor" stroke="none">N</text>
      <text x="100" y="180" textAnchor="middle" fontSize="14" fontFamily="Cinzel, serif" fontWeight="900" fill="currentColor" stroke="none">S</text>
      <text x="30" y="105" textAnchor="middle" fontSize="14" fontFamily="Cinzel, serif" fontWeight="900" fill="currentColor" stroke="none">O</text>
      <text x="170" y="105" textAnchor="middle" fontSize="14" fontFamily="Cinzel, serif" fontWeight="900" fill="currentColor" stroke="none">E</text>
    </svg>
  )
}
