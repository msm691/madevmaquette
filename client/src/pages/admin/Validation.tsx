import { useState, useEffect } from 'react'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'

interface Inscription {
  id: string
  prenom: string
  nom: string
  email: string
  documentAttestationUrl: string | null
  createdAt: string
}

export default function Validation() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState<string | null>(null)
  const [refusing, setRefusing] = useState<string | null>(null)

  useEffect(() => {
    api.get<Inscription[]>('/admin/inscriptions')
      .then(r => setInscriptions(r.data))
      .finally(() => setLoading(false))
  }, [])

  async function refuser(id: string) {
    setRefusing(id)
    try {
      await api.patch(`/admin/refuser/${id}`)
      setInscriptions(prev => prev.filter(i => i.id !== id))
    } catch {
      alert('Erreur lors du refus')
    } finally {
      setRefusing(null)
    }
  }

  async function openDocument(documentAttestationUrl: string) {
    const filename = documentAttestationUrl.split('/').pop()
    if (!filename) return
    try {
      const { data } = await api.get<{ token: string }>(`/documents/token/${filename}`)
      window.open(`/api/documents/${filename}?token=${data.token}`, '_blank')
    } catch {
      alert('Impossible d\'ouvrir le document')
    }
  }

  async function valider(id: string) {
    setValidating(id)
    try {
      await api.patch(`/admin/valider/${id}`)
      setInscriptions(prev => prev.filter(i => i.id !== id))
    } catch {
      alert('Erreur lors de la validation')
    } finally {
      setValidating(null)
    }
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.headerLabel}>Espace administrateur</p>
          <h1 style={s.headerTitle}>Inscriptions en attente</h1>
        </div>
        <Navigation />
      </header>

      <main style={s.main}>
        {loading && <p style={s.hint}>Chargement…</p>}

        {!loading && inscriptions.length === 0 && (
          <div style={s.emptyBox}>
            <p style={s.emptyIcon}>✓</p>
            <p style={s.emptyText}>Aucune inscription en attente.</p>
          </div>
        )}

        {!loading && inscriptions.length > 0 && (
          <p style={s.count}>{inscriptions.length} demande{inscriptions.length > 1 ? 's' : ''} à traiter</p>
        )}

        {inscriptions.map(u => (
          <div key={u.id} style={s.card}>
            <div style={s.avatar}>{u.prenom[0]}{u.nom[0]}</div>
            <div style={s.info}>
              <p style={s.name}>{u.prenom} {u.nom}</p>
              <p style={s.email}>{u.email}</p>
              <p style={s.date}>
                Inscrit le {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {u.documentAttestationUrl && (
                <button
                  style={s.docBadge}
                  onClick={(e) => { e.stopPropagation(); openDocument(u.documentAttestationUrl!) }}
                >
                  📄 Voir le document
                </button>
              )}
            </div>
            <div style={s.actions}>
              <button
                style={{ ...s.refuseBtn, opacity: refusing === u.id ? 0.6 : 1 }}
                disabled={refusing === u.id || validating === u.id}
                onClick={() => refuser(u.id)}
              >
                {refusing === u.id ? '…' : 'Refuser'}
              </button>
              <button
                style={{ ...s.validateBtn, opacity: validating === u.id ? 0.6 : 1 }}
                disabled={validating === u.id || refusing === u.id}
                onClick={() => valider(u.id)}
              >
                {validating === u.id ? '…' : 'Valider'}
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
    padding: '32px 24px 28px',
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
    textTransform: 'uppercase',
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
    flexDirection: 'column',
    gap: 12,
  },
  hint: { color: '#64748b', textAlign: 'center', padding: '40px 0' },
  emptyBox: {
    textAlign: 'center',
    padding: '60px 0',
  },
  emptyIcon: {
    fontSize: 40,
    margin: '0 0 12px',
    color: '#22c55e',
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    margin: 0,
  },
  count: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: 500,
    margin: '0 0 4px',
  },
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
    textTransform: 'uppercase',
  },
  info: { flex: 1, minWidth: 0 },
  name: { margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a' },
  email: { margin: '3px 0 0', fontSize: 13, color: '#64748b' },
  date: { margin: '2px 0 0', fontSize: 12, color: '#94a3b8' },
  docBadge: {
    display: 'inline-block',
    marginTop: 6,
    fontSize: 11,
    fontWeight: 600,
    color: '#4338ca',
    background: '#eef2ff',
    padding: '3px 8px',
    borderRadius: 6,
  },
  actions: {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
  },
  refuseBtn: {
    padding: '10px 18px',
    borderRadius: 10,
    border: '1.5px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    flexShrink: 0,
    fontFamily: 'inherit',
  },
  validateBtn: {
    padding: '10px 22px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    flexShrink: 0,
    fontFamily: 'inherit',
  },
}
