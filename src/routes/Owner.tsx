import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import * as XLSX from 'xlsx'
import styles from './Owner.module.css'
import { CHARACTERS } from '../data/characters'
import allowlistData from '../data/allowlist.json'
import { Avatar } from '../components/Avatar'
import { normalizeEmail } from '../lib/auth'
import { catalogStore, useCatalog } from '../lib/catalogStore'
import type { CatalogItem } from '../types'

interface ParsedRow {
  description: string
  points: number
  valid: boolean
  error?: string
}

export default function Owner() {
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [savedCount, setSavedCount] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentCatalog = useCatalog()

  function handleFile(file: File | undefined) {
    if (!file) return
    setFileName(file.name)
    setSavedCount(null)
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
        setParsed(parseRows(rows))
      } catch (err) {
        console.error(err)
        setParsed([{ description: '(file non leggibile)', points: 0, valid: false, error: String(err) }])
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  function onSelect(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0])
  }

  const validRows = useMemo(() => parsed?.filter(r => r.valid) ?? [], [parsed])
  const invalidRows = useMemo(() => parsed?.filter(r => !r.valid) ?? [], [parsed])

  async function save() {
    setSaving(true)
    setSaveError(null)
    try {
      const newItems: Omit<CatalogItem, 'id'>[] = validRows.map(r => ({
        description: r.description,
        points: r.points,
        createdAt: Date.now(),
      }))
      await catalogStore.replace(newItems)
      setSavedCount(newItems.length)
    } catch (err) {
      console.error('[Owner] save failed:', err)
      setSaveError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setParsed(null)
    setFileName(null)
    setSavedCount(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const allowMapping = (allowlistData as { mapping: Record<string, string> }).mapping
  const allowAssignments = CHARACTERS.map(c => {
    const email = Object.entries(allowMapping)
      .find(([, v]) => v === c.id)?.[0]
    return { character: c, email: email ?? null }
  })

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.eyebrow}>Riservato al capitano</div>
            <h1 className={styles.title}>
              Cabina del <span className={styles.titleAccent}>Capitano</span>
            </h1>
            <p className={styles.tagline}>
              Da qui carichi il manifesto delle bravate e tieni la ciurma in lista.
              Sigillo sotto chiave.
            </p>
          </div>
          <span className={styles.heroBadge}>● Solo te</span>
        </header>

        <div className={styles.ornament} aria-hidden>✦ · ✦ · ✦</div>

        {/* Upload catalogo */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Carica il manifesto</h2>
            <span className={styles.sectionMeta}>
              {currentCatalog.length > 0
                ? `${currentCatalog.length} voci attualmente sigillate · .xlsx · .xls · .csv`
                : '.xlsx · .xls · .csv'}
            </span>
          </div>

          <label
            className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <span className={styles.dropIcon}>↑</span>
            <span className={styles.dropTitle}>
              {fileName ? fileName : 'Trascina qui il rotolo (excel)'}
            </span>
            <span className={styles.dropHint}>oppure clicca per pescarlo dal forziere</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className={styles.dropFileInput}
              onChange={onSelect}
            />
          </label>

          <div className={styles.requirements}>
            <strong>Formato richiesto</strong> — Colonna A: descrizione della cazzata
            (testo). Colonna B: punteggio (numero, <code>+</code> per gli onori,
            <code>−</code> per i castighi). L'intestazione viene ignorata in automatico.
          </div>

          {parsed && (
            <div className={styles.preview}>
              <div className={styles.previewHead}>
                <span className={styles.previewName}>
                  <b>Anteprima</b>
                  {fileName ?? 'file caricato'}
                </span>
                <span className={`${styles.previewStats} ${invalidRows.length > 0 ? styles.previewStatsErr : styles.previewStatsOk}`}>
                  {validRows.length} valide · {invalidRows.length} scartate
                </span>
              </div>

              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.thCell}>Descrizione</th>
                    <th className={styles.thCell}>Tipo</th>
                    <th className={`${styles.thCell} ${styles.thCellRight}`}>Punti</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((r, i) => {
                    const pos = r.points > 0
                    return (
                      <tr key={i} style={r.valid ? undefined : { opacity: 0.45 }}>
                        <td className={styles.tdCell}>
                          {r.description || <em style={{ color: 'var(--oxblood)' }}>{r.error ?? 'riga vuota'}</em>}
                        </td>
                        <td className={`${styles.tdCell} ${styles.tdKind}`}>
                          {r.valid ? (pos ? 'Premio' : 'Penalità') : 'Scarto'}
                        </td>
                        <td className={`${styles.tdCell} ${styles.tdCellNum} ${pos ? styles.tdPos : styles.tdNeg}`}>
                          {r.valid ? (pos ? `+${r.points}` : r.points) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className={styles.previewActions}>
                <button type="button" className={styles.btn} onClick={reset}>Scarta</button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={save}
                  disabled={validRows.length === 0 || saving}
                >
                  {saving
                    ? 'Sigillo in corso…'
                    : savedCount !== null
                      ? `✓ ${savedCount} voci in cassaforte`
                      : `Sigilla ${validRows.length} voci`}
                </button>
              </div>
              {savedCount !== null && (
                <div className={styles.requirements} style={{ marginTop: '1rem' }}>
                  Catalogo salvato su Firestore. Tutta la ciurma lo vede in tempo reale —
                  ora la voce è disponibile nel menu a tendina di "Annota" su Il Bottino.
                </div>
              )}
              {saveError && (
                <div className={styles.requirements} style={{
                  marginTop: '1rem',
                  borderLeftColor: 'var(--terracotta)',
                }}>
                  <strong>Errore</strong> · {saveError}
                </div>
              )}
            </div>
          )}
        </section>

        <div className={styles.ornament} aria-hidden>✦ · ✦ · ✦</div>

        {/* Allowlist */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Ciurma · Mappatura email</h2>
            <span className={styles.sectionMeta}>{Object.keys(allowMapping).length} su {CHARACTERS.length} a bordo</span>
          </div>

          <div className={styles.allowGrid}>
            {allowAssignments.map(({ character, email }) => (
              <div key={character.id} className={email ? styles.allowRow : styles.allowEmpty}>
                <Avatar character={character} size={36} />
                <div className={styles.allowText}>
                  <span className={styles.allowName}>{character.name}</span>
                  {email
                    ? <span className={styles.allowEmail}>{email}</span>
                    : <span className={styles.allowMissing}>· da arruolare</span>}
                </div>
              </div>
            ))}
          </div>

          <p className={styles.allowNote}>
            La mappatura vive in <code>src/data/allowlist.json</code>. In v1 si arruola
            via codice. L'editor a bordo arriva dopo il deploy.
          </p>
        </section>
      </div>
    </div>
  )
}

function parseRows(rows: unknown[][]): ParsedRow[] {
  return rows
    .map(row => {
      const a = row[0]
      const b = row[1]
      const description = typeof a === 'string' ? a.trim() : String(a ?? '').trim()
      const pointsRaw = typeof b === 'number' ? b : Number(String(b ?? '').replace(',', '.'))
      const valid = description.length > 0
        && Number.isFinite(pointsRaw)
        && pointsRaw !== 0
      return {
        description,
        points: Number.isFinite(pointsRaw) ? pointsRaw : 0,
        valid,
        error: !valid
          ? (description.length === 0 ? 'descrizione mancante' : 'punteggio non valido')
          : undefined,
      }
    })
    // Scarta righe completamente vuote
    .filter(r => r.description.length > 0 || r.points !== 0)
}

// usato indirettamente per validazione: questo placeholder evita warning su normalizeEmail
void normalizeEmail
