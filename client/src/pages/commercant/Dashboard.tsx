import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'

interface Offre {
  id: string
  titre: string
  description: string
  typeRemise: string
  valeurRemise: number
  dateDebut: string
  dateFin: string | null
}

interface DashboardData {
  commerce: { id: string; nom: string; estValide: boolean }
  offres: Offre[]
  totalPassages: number
}

function formatRemise(type: string, valeur: number): string {
  if (type === 'POURCENTAGE') return `-${valeur}%`
  if (type === 'MONTANT_FIXE') return `-${valeur}€`
  return `${valeur}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CommercantDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get<DashboardData>('/commercant/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status !== 401) {
          setError('Impossible de charger le tableau de bord')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={s.center}>Chargement...</div>

  if (error || !data) {
    return (
      <div style={s.center}>
        <p style={{ color: '#ef4444', fontSize: 15 }}>{error ?? 'Erreur de chargement'}</p>
      </div>
    )
  }

  const { commerce, offres, totalPassages } = data

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div>
          <p style={s.greeting}>Espace Commerçant</p>
          <h1 style={s.nom}>{commerce.nom}</h1>
        </div>
        <div style={s.headerRight}>
          <span style={commerce.estValide ? s.badgeOk : s.badgePending}>
            {commerce.estValide ? '✓ Validé' : '⏳ En attente'}
          </span>
          <Navigation />
        </div>
      </header>

      {/* ── Stats ── */}
      <section style={s.statsSection}>
        <p style={s.sectionLabel}>STATISTIQUES</p>
        <div style={s.statCard}>
          <div style={s.statGlass}>
            <span style={s.statValue}>{totalPassages}</span>
            <span style={s.statLabel}>Passages validés</span>
          </div>
        </div>
      </section>

      {/* ── Bouton Scanner ── */}
      <section style={s.scanSection}>
        <button style={s.scanBtn} onClick={() => navigate('/commercant/scanner')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 8 }}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h.01M14 17h3M17 14v3M20 20h.01" />
          </svg>
          Scanner un QR
        </button>
      </section>

      {/* ── Offres ── */}
      <section style={s.offresSection}>
        <p style={s.sectionLabel}>OFFRES ACTIVES ({offres.length})</p>
        {offres.length === 0 ? (
          <div style={s.emptyState}>
            <p style={s.emptyText}>Aucune offre active pour le moment.</p>
          </div>
        ) : (
          <div style={s.offresList}>
            {offres.map((offre) => (
              <div key={offre.id} style={s.offreCard}>
                <div style={s.offreTop}>
                  <span style={s.offreTitre}>{offre.titre}</span>
                  <span style={s.offreRemise}>{formatRemise(offre.typeRemise, offre.valeurRemise)}</span>
                </div>
                {offre.description && (
                  <p style={s.offreDesc}>{offre.description}</p>
                )}
                <div style={s.offreDates}>
                  <span>{formatDate(offre.dateDebut)}</span>
                  {offre.dateFin && <span> → {formatDate(offre.dateFin)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    paddingBottom: 40,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontSize: 16,
    color: '#64748b',
    flexDirection: 'column',
  },
  header: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    color: '#fff',
    padding: '48px 24px 36px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: 8,
  },
  greeting: {
    margin: 0,
    fontSize: 13,
    color: '#93c5fd',
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  nom: {
    margin: '6px 0 0',
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: '-0.5px',
    color: '#f8fafc',
  },
  badgeOk: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(34,197,94,0.2)',
    color: '#86efac',
    border: '1px solid rgba(34,197,94,0.4)',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    marginTop: 8,
  },
  badgePending: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(234,179,8,0.2)',
    color: '#fde047',
    border: '1px solid rgba(234,179,8,0.4)',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    marginTop: 8,
  },
  statsSection: {
    padding: '24px 24px 0',
    marginTop: -16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '2px',
    color: '#64748b',
    margin: '0 0 10px',
    textTransform: 'uppercase',
  },
  statCard: {
    background: '#fff',
    borderRadius: 16,
    padding: 4,
    boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(99,102,241,0.08)',
  },
  statGlass: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
    borderRadius: 12,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statValue: {
    fontSize: 40,
    fontWeight: 800,
    color: '#f8fafc',
    lineHeight: 1,
    letterSpacing: '-1px',
  },
  statLabel: {
    fontSize: 13,
    color: '#93c5fd',
    fontWeight: 500,
  },
  scanSection: {
    padding: '20px 24px',
  },
  scanBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    padding: '16px 24px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
    letterSpacing: '0.2px',
  },
  offresSection: {
    padding: '0 24px 24px',
  },
  emptyState: {
    background: '#fff',
    borderRadius: 14,
    padding: '32px 24px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    margin: 0,
  },
  offresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  offreCard: {
    background: '#fff',
    borderRadius: 14,
    padding: '16px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(99,102,241,0.06)',
    borderLeft: '3px solid #6366f1',
  },
  offreTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  offreTitre: {
    fontSize: 15,
    fontWeight: 700,
    color: '#1e293b',
  },
  offreRemise: {
    fontSize: 14,
    fontWeight: 800,
    color: '#6366f1',
    background: '#eef2ff',
    borderRadius: 8,
    padding: '2px 10px',
    whiteSpace: 'nowrap',
  },
  offreDesc: {
    fontSize: 13,
    color: '#64748b',
    margin: '6px 0 0',
    lineHeight: 1.5,
  },
  offreDates: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
    fontWeight: 500,
  },
}
