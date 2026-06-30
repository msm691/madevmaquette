import { useEffect, useMemo, useState } from 'react'
import type { Categorie, CommerceWithDetails } from '../../types/commerce'
import MerchantCard from '../../components/MerchantCard/MerchantCard'
import BottomNav from '../../components/BottomNav/BottomNav'
import { useFavoris } from '../../hooks/useFavoris'
import api from '../../api/client'

export default function Annuaire() {
  const [commerces, setCommerces] = useState<CommerceWithDetails[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState<number | null>(null)
  const [sortProximite, setSortProximite] = useState(false)
  const { favoris, toggleFavori } = useFavoris()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<CommerceWithDetails[]>('/commerces'),
      api.get<Categorie[]>('/categories'),
    ])
      .then(([resC, resCat]) => {
        setCommerces(resC.data)
        setCategories(resCat.data)
      })
      .catch((err) => {
        if (err.response?.status !== 401) {
          setError('Impossible de charger les commerces')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return commerces
      .filter(
        (c) =>
          (selectedCat === null || c.categorieId === selectedCat) &&
          (q === '' ||
            c.nom.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q)),
      )
      .sort((a, b) =>
        sortProximite ? (a.distanceKm ?? 99) - (b.distanceKm ?? 99) : 0,
      )
  }, [commerces, search, selectedCat, sortProximite])

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <h1 style={s.title}>Annuaire</h1>
        <p style={s.subtitle}>Partenaires étudiants à Vienne</p>

        {/* Barre de recherche */}
        <div style={s.searchWrap}>
          <svg style={s.searchIcon} width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            style={s.searchInput}
            placeholder="Rechercher un commerce…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button style={s.clearBtn} onClick={() => setSearch('')} aria-label="Effacer">
              ×
            </button>
          )}
        </div>
      </header>

      {/* Filtres catégories */}
      <div style={s.filterRow}>
        <div style={s.chipsScroll}>
          <button
            style={{ ...s.chip, ...(selectedCat === null ? s.chipActive : {}) }}
            onClick={() => setSelectedCat(null)}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              style={{ ...s.chip, ...(selectedCat === cat.id ? s.chipActive : {}) }}
              onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
            >
              {cat.icone ?? ''} {cat.nom}
            </button>
          ))}
        </div>

        <button
          style={{ ...s.proximiteBtn, ...(sortProximite ? s.proximiteBtnActive : {}) }}
          onClick={() => setSortProximite((v) => !v)}
          title="Trier par proximité"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Proximité
        </button>
      </div>

      {/* Résultats */}
      <div style={s.resultsBar}>
        <span style={s.count}>
          {loading ? 'Chargement…' : error ? error : `${filtered.length} commerce${filtered.length > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Liste */}
      <div style={s.list}>
        {!loading && filtered.length === 0 && (
          <div style={s.empty}>
            <span style={{ fontSize: 32 }}>🔍</span>
            <p style={{ color: '#64748b', fontSize: 14, margin: '8px 0 0' }}>Aucun résultat</p>
          </div>
        )}
        {filtered.map((commerce) => (
          <MerchantCard
            key={commerce.id}
            commerce={commerce}
            isFavori={favoris.has(commerce.id)}
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
    padding: '48px 20px 24px',
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
    margin: '4px 0 18px',
    fontSize: 13,
    color: '#93c5fd',
    fontWeight: 500,
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 40px',
    borderRadius: 14,
    border: 'none',
    fontSize: 14,
    background: '#ffffff',
    color: '#0f172a',
    outline: 'none',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    fontFamily: 'inherit',
  },
  clearBtn: {
    position: 'absolute',
    right: 14,
    background: 'none',
    border: 'none',
    fontSize: 18,
    color: '#94a3b8',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0 2px',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 20px',
    background: '#fff',
    borderBottom: '1px solid #f1f5f9',
  },
  chipsScroll: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto' as const,
    flex: 1,
    scrollbarWidth: 'none' as const,
    paddingBottom: 2,
  },
  chip: {
    flexShrink: 0,
    padding: '6px 14px',
    borderRadius: 20,
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc',
    color: '#64748b',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.15s',
  },
  chipActive: {
    background: '#1e3a8a',
    borderColor: '#1e3a8a',
    color: '#ffffff',
  },
  proximiteBtn: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 12px',
    borderRadius: 20,
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc',
    color: '#64748b',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  proximiteBtnActive: {
    background: '#eef2ff',
    borderColor: '#6366f1',
    color: '#4338ca',
  },
  resultsBar: {
    padding: '10px 20px 4px',
  },
  count: {
    fontSize: 12,
    fontWeight: 600,
    color: '#94a3b8',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  list: {
    padding: '8px 20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  empty: {
    textAlign: 'center' as const,
    padding: '60px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}
