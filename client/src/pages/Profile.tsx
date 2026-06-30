import { useEffect, useState } from 'react'
import Navigation from '../components/Navigation/Navigation'
import api from '../api/client'
import type { User } from '../types/user'

interface ProfileUser extends User {
  documentAttestationUrl?: string | null
}

const ROLE_LABEL: Record<string, string> = {
  ETUDIANT: 'Étudiant',
  COMMERCANT: 'Commerçant',
  ADMIN: 'Administrateur',
}

async function openDocument(url: string) {
  const filename = url.split('/').pop()
  if (!filename) return
  try {
    const { data } = await api.get<{ token: string }>(`/documents/token/${filename}`)
    window.open(`/api/documents/${filename}?token=${data.token}`, '_blank')
  } catch {
    alert('Impossible d\'ouvrir le document')
  }
}

export default function Profile() {
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ProfileUser>('/auth/me')
      .then(res => setUser(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={s.center}>Chargement...</div>
  if (!user) return <div style={s.center}>Erreur de chargement</div>

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.headerLabel}>Informations</p>
          <h1 style={s.headerTitle}>{user.prenom} {user.nom}</h1>
        </div>
        <Navigation />
      </header>

      <main style={s.main}>
        <p style={s.sectionLabel}>MON COMPTE</p>
        <div style={s.card}>
          {([
            ['Prénom', user.prenom],
            ['Nom', user.nom],
            ['Email', user.email],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} style={s.row}>
              <span style={s.rowLabel}>{label}</span>
              <span style={s.rowValue}>{value}</span>
            </div>
          ))}
          <div style={s.row}>
            <span style={s.rowLabel}>Rôle</span>
            <span style={s.badge}>{ROLE_LABEL[user.role] ?? user.role}</span>
          </div>
          <div style={{ ...s.row, borderBottom: 'none' }}>
            <span style={s.rowLabel}>Statut</span>
            <span style={user.isActif ? s.badgeOk : s.badgePending}>
              {user.isActif ? 'Actif' : 'En attente'}
            </span>
          </div>
          {user.numeroCarte && (
            <div style={{ ...s.row, borderBottom: 'none', marginTop: 0 }}>
              <span style={s.rowLabel}>N° Carte</span>
              <span style={s.rowValue}>{user.numeroCarte}</span>
            </div>
          )}
        </div>

        {user.documentAttestationUrl && (
          <>
            <p style={{ ...s.sectionLabel, marginTop: 24 }}>DOCUMENTS</p>
            <div style={s.card}>
              <div style={{ ...s.row, borderBottom: 'none', justifyContent: 'space-between' }}>
                <span style={s.rowValue}>Attestation d'inscription</span>
                <button
                  style={s.docBtn}
                  onClick={() => openDocument(user.documentAttestationUrl!)}
                >
                  Voir
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    color: '#fff',
    padding: '48px 24px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLabel: {
    margin: 0,
    fontSize: 13,
    color: '#93c5fd',
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  headerTitle: {
    margin: '6px 0 0',
    fontSize: 26,
    fontWeight: 800,
    color: '#f8fafc',
    letterSpacing: '-0.5px',
  },
  main: {
    padding: '24px',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '2px',
    color: '#64748b',
    margin: '0 0 10px',
    textTransform: 'uppercase' as const,
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid #f1f5f9',
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#64748b',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: 500,
    color: '#1e293b',
  },
  badge: {
    fontSize: 12,
    fontWeight: 700,
    color: '#4338ca',
    background: '#eef2ff',
    borderRadius: 8,
    padding: '3px 10px',
  },
  badgeOk: {
    fontSize: 12,
    fontWeight: 700,
    color: '#16a34a',
    background: '#dcfce7',
    borderRadius: 8,
    padding: '3px 10px',
  },
  badgePending: {
    fontSize: 12,
    fontWeight: 700,
    color: '#d97706',
    background: '#fef3c7',
    borderRadius: 8,
    padding: '3px 10px',
  },
  docBtn: {
    padding: '6px 16px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}
