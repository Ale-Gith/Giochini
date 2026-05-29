import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'
import {
  getCharacterIdForEmail,
  isAllowed,
  normalizeEmail,
  saveSession,
  type StoredSession,
} from '../lib/auth'

interface Props {
  onLogin: (s: StoredSession) => void
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'rejected'>('idle')
  const navigate = useNavigate()

  const serial = useMemo(() => generateSerial(email), [email])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (status !== 'idle') return
    const normalized = normalizeEmail(email)
    if (!normalized) return

    if (isAllowed(normalized)) {
      setStatus('submitting')
      const characterId = getCharacterIdForEmail(normalized)
      const session: StoredSession = { email: normalized, characterId }
      saveSession(session)
      setTimeout(() => {
        onLogin(session)
        navigate(characterId ? '/score' : '/select')
      }, 700)
    } else {
      setStatus('rejected')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.frame} aria-hidden />

      <div className={styles.content}>
        {/* Top */}
        <div className={styles.top}>
          <div className={styles.topLeft}>
            <span><span className={styles.topAccent}>●</span> Edizione MMXXVI</span>
            <span>Tour iberico-francese · Estate</span>
          </div>
          <div className={styles.topRight}>
            <span>N° {serial}</span>
            <span><span className={styles.dot} aria-hidden />Lista chiusa</span>
          </div>
        </div>

        {/* Main */}
        <form
          onSubmit={handleSubmit}
          className={`${styles.main} ${status === 'rejected' ? styles.shake : ''}`}
        >
          {/* Hero col */}
          <div className={styles.hero}>
            <div className={styles.eyebrow}>Campionato · accesso ai soci</div>

            <h1 className={styles.titleStack}>
              <span className={styles.titleLine}>Ma allora</span>
              <span className={styles.titleLine}>lo sborriamo</span>
              <span className={styles.titleLine}>il cuscino</span>
              <span className={styles.titleLine}>
                al Genes<span className={styles.titleQ}>?</span>
              </span>
            </h1>

            <div className={styles.divider} />

            <div className={styles.dateRow}>
              <span className={styles.dateBig}>31.07 — 14.08</span>
              <span>Anno · 2026</span>
            </div>

            <ol className={styles.route}>
              <li className={styles.routeStop}><span className={styles.routeNum}>01</span> Barcelona</li>
              <li className={styles.routeStop}><span className={styles.routeNum}>02</span> Valencia</li>
              <li className={styles.routeStop}><span className={styles.routeNum}>03</span> Montpellier</li>
              <li className={styles.routeStop}><span className={styles.routeNum}>04</span> Gorges du Verdon</li>
            </ol>
          </div>

          {/* Form col */}
          <div className={styles.formCol}>
            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="email">
                Credenziali · indirizzo email
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  autoCapitalize="off"
                  required
                  placeholder="tua.email@..."
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.input}
                  disabled={status === 'submitting'}
                />
              </div>
              {status === 'rejected' && (
                <div className={styles.error}>Non sei in lista</div>
              )}
            </div>

            <div className={styles.actions}>
              <span className={styles.disclaimer}>Solo su invito</span>
              <button
                type="submit"
                className={`${styles.submit} ${status === 'submitting' ? styles.submitting : ''}`}
                disabled={!email || status !== 'idle'}
              >
                {status === 'submitting' ? 'Verifica' : 'Entra'}
              </button>
            </div>
          </div>
        </form>

        {/* Bottom */}
        <div className={styles.bottom}>
          <span>Top secret · Riservato</span>
          <span>Niente neutralità</span>
        </div>
      </div>
    </div>
  )
}

function generateSerial(email: string): string {
  let h = 0
  for (let i = 0; i < email.length; i++) {
    h = (h * 31 + email.charCodeAt(i)) | 0
  }
  const n = Math.abs(h % 99999).toString().padStart(5, '0')
  return n || '00000'
}
