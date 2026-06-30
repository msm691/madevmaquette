import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'
import type { User } from '../../types/user'

const ROLE_LABEL: Record<string, string> = {
  ETUDIANT: 'Étudiant',
  COMMERCANT: 'Commerçant',
  ADMIN: 'Admin',
}

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    api.get<User[]>('/admin/users')
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce compte ?')) return
    setDeleting(id)
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      alert('Erreur lors de la suppression')
    } finally {
      setDeleting(null)
    }
  }

  async function toggleActif(user: User) {
    try {
      await api.patch(`/admin/users/${user.id}`, { isActif: !user.isActif })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActif: !u.isActif } : u))
    } catch {
      alert('Erreur lors de la modification')
    }
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.headerLabel}>Espace administrateur</p>
          <h1 style={s.headerTitle}>Liste des comptes</h1>
        </div>
        <Navigation />
      </header>

      <main style={s.main}>
        {loading && <p style={s.hint}>Chargement…</p>}

        {!loading && users.length === 0 && (
          <p style={s.hint}>Aucun compte trouvé.</p>
        )}

        {!loading && users.length > 0 && (
          <p style={s.count}>{users.length} compte{users.length > 1 ? 's' : ''}</p>
        )}

        {users.map(u => (
          <div key={u.id} style={s.card}>
            <div style={s.avatar}>{u.prenom[0]}{u.nom[0]}</div>
            <div style={s.info}>
              <p style={s.name}>{u.prenom} {u.nom}</p>
              <p style={s.email}>{u.email}</p>
              <span style={s.roleBadge}>{ROLE_LABEL[u.role] ?? u.role}</span>
            </div>
            <div style={s.actions}>
              <button
                style={{ ...s.toggleBtn, opacity: u.isActif ? 1 : 0.6 }}
                onClick={() => toggleActif(u)}
                title={u.isActif ? 'Désactiver' : 'Activer'}
              >
                {u.isActif ? 'Actif' : 'Inactif'}
              </button>
              <button
                style={{ ...s.deleteBtn, opacity: deleting === u.id ? 0.5 : 1 }}
                disabled={deleting === u.id}
                onClick={() => handleDelete(u.id)}
              >
                {deleting === u.id ? '…' : 'Suppr.'}
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    padding: '48px 24px 28px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLabel: {
    margin: 0,
    fontSize: 12,
    fontWeight: 600,
    color: '#93c5fd',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  headerTitle: {
    margin: '4px 0 0',
    fontSize: 22,
    fontWeight: 800,
    color: '#f8fafc',
    letterSpacing: '-0.5px',
  },
  main: {
    maxWidth: 660,
    margin: '0 auto',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  hint: { color: '#64748b', textAlign: 'center' as const, padding: '40px 0' },
  count: { fontSize: 13, color: '#64748b', fontWeight: 500, margin: '0 0 4px' },
  card: {
    background: '#fff',
    borderRadius: 14,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
    color: '#fff',
    fontWeight: 800,
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    textTransform: 'uppercase' as const,
  },
  info: { flex: 1, minWidth: 0 },
  name: { margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a' },
  email: { margin: '3px 0 6px', fontSize: 13, color: '#64748b' },
  roleBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#4338ca',
    background: '#eef2ff',
    borderRadius: 6,
    padding: '2px 8px',
  },
  actions: { display: 'flex', gap: 8, flexShrink: 0 },
  toggleBtn: {
    padding: '8px 14px',
    borderRadius: 10,
    border: '1.5px solid #22c55e',
    background: 'transparent',
    color: '#16a34a',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  deleteBtn: {
    padding: '8px 14px',
    borderRadius: 10,
    border: '1.5px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}
