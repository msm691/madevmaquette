import { useEffect, useState } from 'react'
import StudentCard from '../../components/StudentCard/StudentCard'
import BottomNav from '../../components/BottomNav/BottomNav'
import Navigation from '../../components/Navigation/Navigation'
import type { StudentUser } from '../../types/user'
import api from '../../api/client'

export default function Dashboard() {
  const [user, setUser] = useState<StudentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<StudentUser>('/auth/me')
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err.response?.status !== 401) {
          setError('Impossible de charger votre profil')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={styles.center}>Chargement...</div>
  if (!user) return <div style={styles.center}>Erreur de chargement</div>

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.greeting}>Bonjour,</p>
          <h1 style={styles.name}>{user.prenom} {user.nom}</h1>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.notifBtn} title="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <Navigation />
        </div>
      </header>

      <section style={styles.cardSection}>
        <p style={styles.sectionLabel}>MA CARTE</p>
        <StudentCard user={user} />
        <p style={styles.hint}>Présentez ce QR code chez nos partenaires</p>
      </section>

      {error && <p style={styles.errorBanner}>{error}</p>}
      <BottomNav />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    padding: '0 0 88px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    color: '#fff',
    padding: '48px 24px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    margin: 0,
    fontSize: 14,
    color: '#93c5fd',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  name: {
    margin: '4px 0 0',
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: '-0.5px',
    color: '#f8fafc',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#e0e7ff',
  },
  cardSection: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    marginTop: '-20px',
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '2px',
    color: '#64748b',
    margin: '0 0 4px',
    textTransform: 'uppercase' as const,
  },
  hint: {
    fontSize: 13,
    color: '#94a3b8',
    margin: '4px 0 0',
    textAlign: 'center' as const,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontSize: 16,
    color: '#64748b',
  },
  errorBanner: {
    textAlign: 'center' as const,
    color: '#ef4444',
    fontSize: 13,
    padding: '8px',
  },
}
