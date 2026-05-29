import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Login from './routes/Login'
import Score from './routes/Score'
import Awards from './routes/Awards'
import CharacterPage from './routes/Character'
import Owner from './routes/Owner'
import { isOwner, loadSession, type StoredSession } from './lib/auth'
import { Placeholder } from './routes/Placeholder'
import { Layout } from './components/Layout'

export type AppSession = StoredSession & { isOwner: boolean }

export default function App() {
  const [session, setSession] = useState<AppSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = loadSession()
    if (stored) {
      setSession({ ...stored, isOwner: isOwner(stored.email) })
    }
    setReady(true)
  }, [])

  if (!ready) return null

  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={
            session
              ? <Navigate to={session.characterId ? '/score' : '/select'} replace />
              : <Login onLogin={s => setSession({ ...s, isOwner: isOwner(s.email) })} />
          }
        />
        <Route path="/select" element={
          <RequireAuth session={session}>
            {session && (
              <Layout session={session}>
                <Placeholder title="Selezione personaggio" subtitle="(la tua email non risulta mappata a un personaggio — contatta l'arbitro)" />
              </Layout>
            )}
          </RequireAuth>
        } />
        <Route path="/score" element={
          <RequireAuth session={session}>
            {session && (
              <Layout session={session}>
                <Score session={session} />
              </Layout>
            )}
          </RequireAuth>
        } />
        <Route path="/character/:id" element={
          <RequireAuth session={session}>
            {session && (
              <Layout session={session}>
                <CharacterPage session={session} />
              </Layout>
            )}
          </RequireAuth>
        } />
        <Route path="/awards" element={
          <RequireAuth session={session}>
            {session && (
              <Layout session={session}>
                <Awards session={session} />
              </Layout>
            )}
          </RequireAuth>
        } />
        <Route path="/owner" element={
          <RequireAuth session={session} ownerOnly>
            {session && (
              <Layout session={session}>
                <Owner />
              </Layout>
            )}
          </RequireAuth>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function RequireAuth({
  session,
  ownerOnly,
  children,
}: {
  session: AppSession | null
  ownerOnly?: boolean
  children: React.ReactNode
}) {
  const location = useLocation()
  if (!session) return <Navigate to="/" state={{ from: location }} replace />
  if (ownerOnly && !session.isOwner) return <Navigate to="/score" replace />
  return <>{children}</>
}
