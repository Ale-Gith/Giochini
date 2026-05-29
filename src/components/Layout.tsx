import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styles from './Layout.module.css'
import { Avatar } from './Avatar'
import { CHARACTERS_BY_ID } from '../data/characters'
import { clearSession } from '../lib/auth'
import type { AppSession } from '../App'

interface Props {
  session: AppSession
  children: ReactNode
}

interface NavItem {
  to: string
  label: string
  sub: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/score', label: 'Il Bottino', sub: 'Classifica della ciurma' },
  { to: '/awards', label: 'Onori & Castighi', sub: 'Manifesto e diario di bordo' },
]

const AnchorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={styles.brandIcon}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v14" />
    <path d="M8 10h8" />
    <path d="M4 16c0 4 3 6 8 6s8-2 8-6" />
  </svg>
)

export function Layout({ session, children }: Props) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const me = session.characterId ? CHARACTERS_BY_ID[session.characterId] : null

  function logout() {
    clearSession()
    navigate('/')
    window.location.reload()
  }

  return (
    <>
      <button
        type="button"
        className={styles.menuTrigger}
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
      >
        <span className={styles.menuIcon} aria-hidden>
          <span /><span /><span />
        </span>
        Carta
      </button>

      <div
        className={`${styles.backdrop} ${open ? styles.open : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        className={`${styles.drawer} ${open ? styles.open : ''}`}
        aria-hidden={!open}
        role="dialog"
        aria-label="Menu di navigazione"
      >
        <div className={styles.drawerInner}>
          <header className={styles.drawerHeader}>
            <div className={styles.drawerBrand}>
              <span className={styles.brandRow}>
                <AnchorIcon />
                Lo Sborriamo
              </span>
              <span>Carta Nautica · MMXXVI</span>
              <span className={styles.drawerTitle}>I Pirati</span>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Chiudi menu"
            >
              ×
            </button>
          </header>

          {me && (
            <div className={styles.userSection}>
              <Avatar character={me} size={54} ring />
              <div className={styles.userNames}>
                <span className={styles.userRole}>{session.isOwner ? 'Capitano' : 'Marinaio'}</span>
                <span className={styles.userName}>{me.name}</span>
                <span className={styles.userNick}>· {me.nickname}</span>
              </div>
            </div>
          )}

          <nav className={styles.nav}>
            {NAV_ITEMS.map(item => {
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <span className={styles.navLinkText}>
                    <span>{item.label}</span>
                    <span className={styles.navLinkSub}>{item.sub}</span>
                  </span>
                  <span className={styles.navArrow} aria-hidden>→</span>
                </Link>
              )
            })}

            {me && (
              <Link
                to={`/character/${me.id}`}
                className={`${styles.navLink} ${location.pathname.startsWith('/character/') ? styles.active : ''}`}
              >
                <span className={styles.navLinkText}>
                  <span>La tua scheda</span>
                  <span className={styles.navLinkSub}>Storia personale</span>
                </span>
                <span className={styles.navArrow} aria-hidden>→</span>
              </Link>
            )}

            {session.isOwner && (
              <>
                <div className={styles.navSeparator} aria-hidden>✦ · ✦</div>
                <Link
                  to="/owner"
                  className={`${styles.navLink} ${location.pathname === '/owner' ? styles.active : ''}`}
                >
                  <span className={styles.navLinkText}>
                    <span>
                      Cabina del Capitano <span className={styles.ownerBadge}>Solo te</span>
                    </span>
                    <span className={styles.navLinkSub}>Catalogo e ciurma</span>
                  </span>
                  <span className={styles.navArrow} aria-hidden>→</span>
                </Link>
              </>
            )}
          </nav>

          <footer className={styles.drawerFooter}>
            <span className={styles.footerDates}>31.07 — 14.08 · 2026</span>
            <span className={styles.footerRoute}>
              Barcelona → Valencia → Montpellier → Gorges du Verdon
            </span>
            <button type="button" className={styles.logout} onClick={logout}>
              Sbarca (esci)
            </button>
          </footer>
        </div>
      </aside>

      {children}
    </>
  )
}
