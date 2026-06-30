import { useEffect, useState } from 'react'
import type { CommerceWithDetails } from '../../types/commerce'
import MerchantCard from '../../components/MerchantCard/MerchantCard'
import BottomNav from '../../components/BottomNav/BottomNav'
import { MOCK_COMMERCES } from '../../data/mockCommerces'
import { useFavoris } from '../../hooks/useFavoris'
import api from '../../api/client'

export default function Favoris() {
  const [commerces, setCommerces] = useState<CommerceWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const { favoris, toggleFavori } = useFavoris()

  useEffect(() => {
    api.get<CommerceWithDetails[]>('/commerces')
      .then((res) => setCommerces(res.data))
      .catch(() => setCommerces(MOCK_COMMERCES))
      .finally(() => setLoading(false))
  }, [])

  const favorisListe = commerces.filter((c) => favoris.has(c.id))

  return (
    <div style={s.page}>
      <header style={s.header}>
        <h1 style={s.title}>Favoris</h1>
        <p style={s.subtitle}>
          {loading ? 'Chargement…' : `${favorisListe.length} commerce${favorisListe.length > 1 ? 's' : ''} sauvegardé${favorisListe.length > 1 ? 's' : ''}`}
        </p>
      </header>

      <div style={s.list}>
        {!loading && favorisListe.length === 0 && (
          <div style={s.empty}>
            <span style={{ fontSize: 48 }}>🤍</span>
            <p style={s.emptyTitle}>Aucun favori</p>
            <p style={s.emptyHint}>Appuie sur le cœur d'un commerce dans l'Annuaire pour l'ajouter ici.</p>
          </div>
        )}
        {favorisListe.map((commerce) => (
          <MerchantCard
            key={commerce.id}
            commerce={commerce}
            isFavori={true}
            onToggleFavori={toggleFavori}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    paddingBottom: 88,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    padding: '48px 20px 28px',
    color: '#fff',
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: '#f8fafc',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: 13,
    color: '#93c5fd',
    fontWeight: 500,
  },
  list: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    padding: '80px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    color: '#334155',
  },
  emptyHint: {
    margin: 0,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
}
