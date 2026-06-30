import { useEffect, useState, type FormEvent } from 'react'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'

interface Offre {
  id: string
  titre: string
  description: string
  typeRemise: 'POURCENTAGE' | 'MONTANT_FIXE'
  valeurRemise: number
  dateDebut: string
  dateFin: string | null
}

interface FormState {
  titre: string
  description: string
  typeRemise: 'POURCENTAGE' | 'MONTANT_FIXE'
  valeurRemise: string
  dateDebut: string
  dateFin: string
}

const EMPTY_FORM: FormState = {
  titre: '',
  description: '',
  typeRemise: 'POURCENTAGE',
  valeurRemise: '',
  dateDebut: new Date().toISOString().slice(0, 10),
  dateFin: '',
}

async function fetchOffers(): Promise<Offre[]> {
  const res = await api.get<{ offres: Offre[] }>('/commercant/dashboard')
  return res.data.offres
}

async function addOffer(form: FormState): Promise<Offre> {
  const payload = {
    titre: form.titre,
    description: form.description,
    typeRemise: form.typeRemise,
    valeurRemise: parseFloat(form.valeurRemise),
    dateDebut: form.dateDebut,
    dateFin: form.dateFin || null,
  }
  const res = await api.post<Offre>('/commercant/offres', payload)
  return res.data
}

async function deleteOffer(id: string): Promise<void> {
  await api.delete(`/commercant/offres/${id}`)
}

function formatRemise(type: string, valeur: number): string {
  if (type === 'POURCENTAGE') return `-${valeur}%`
  if (type === 'MONTANT_FIXE') return `-${valeur}€`
  return `${valeur}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MerchantOffers() {
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchOffers()
      .then(setOffres)
      .catch(() => setError('Impossible de charger les offres'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      const newOffre = await addOffer(form)
      setOffres(prev => [...prev, newOffre])
      setForm(EMPTY_FORM)
      setShowForm(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Erreur lors de l\'ajout de l\'offre')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteOffer(id)
      setOffres(prev => prev.filter(o => o.id !== id))
    } catch {
      setError('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div style={s.center}>Chargement...</div>

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.headerLabel}>Mon commerce</p>
          <h1 style={s.headerTitle}>Mes Offres</h1>
        </div>
        <Navigation />
      </header>

      <main style={s.main}>
        {/* Bouton ajouter */}
        <div style={s.topBar}>
          <p style={s.sectionLabel}>OFFRES ACTIVES ({offres.length})</p>
          <button style={s.addBtn} onClick={() => { setShowForm(f => !f); setError(null) }}>
            {showForm ? 'Annuler' : '+ Nouvelle offre'}
          </button>
        </div>

        {/* Feedback */}
        {error && <p style={s.error}>{error}</p>}
        {success && <p style={s.successMsg}>Offre ajoutée ✓</p>}

        {/* Formulaire d'ajout */}
        {showForm && (
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Titre</label>
              <input required style={s.input} value={form.titre} onChange={handleChange('titre')} placeholder="Ex: Café offert" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} value={form.description} onChange={handleChange('description')} rows={3} placeholder="Détails de l'offre…" />
            </div>
            <div style={s.row2}>
              <div style={{ ...s.field, flex: 1 }}>
                <label style={s.label}>Type de remise</label>
                <select style={s.input} value={form.typeRemise} onChange={handleChange('typeRemise')}>
                  <option value="POURCENTAGE">Pourcentage (%)</option>
                  <option value="MONTANT_FIXE">Montant fixe (€)</option>
                </select>
              </div>
              <div style={{ ...s.field, flex: 1 }}>
                <label style={s.label}>Valeur</label>
                <input required type="number" min="0" step="0.01" style={s.input} value={form.valeurRemise} onChange={handleChange('valeurRemise')} placeholder={form.typeRemise === 'POURCENTAGE' ? '10' : '5'} />
              </div>
            </div>
            <div style={s.row2}>
              <div style={{ ...s.field, flex: 1 }}>
                <label style={s.label}>Date début</label>
                <input required type="date" style={s.input} value={form.dateDebut} onChange={handleChange('dateDebut')} />
              </div>
              <div style={{ ...s.field, flex: 1 }}>
                <label style={s.label}>Date fin (optionnel)</label>
                <input type="date" style={s.input} value={form.dateFin} onChange={handleChange('dateFin')} />
              </div>
            </div>
            <button type="submit" style={{ ...s.btn, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
              {submitting ? 'Ajout en cours…' : 'Ajouter l\'offre'}
            </button>
          </form>
        )}

        {/* Liste des offres */}
        {offres.length === 0 ? (
          <div style={s.emptyState}>
            <p style={s.emptyText}>Aucune offre active. Créez votre première offre !</p>
          </div>
        ) : (
          <div style={s.offresList}>
            {offres.map(offre => (
              <div key={offre.id} style={s.offreCard}>
                <div style={s.offreTop}>
                  <span style={s.offreTitre}>{offre.titre}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={s.offreRemise}>{formatRemise(offre.typeRemise, offre.valeurRemise)}</span>
                    <button
                      style={{ ...s.deleteBtn, opacity: deletingId === offre.id ? 0.5 : 1 }}
                      onClick={() => handleDelete(offre.id)}
                      disabled={deletingId === offre.id}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {offre.description && <p style={s.offreDesc}>{offre.description}</p>}
                <div style={s.offreDates}>
                  <span>{formatDate(offre.dateDebut)}</span>
                  {offre.dateFin && <span> → {formatDate(offre.dateFin)}</span>}
                </div>
              </div>
            ))}
          </div>
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
    paddingBottom: 40,
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
    maxWidth: 600,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '2px',
    color: '#64748b',
    margin: 0,
    textTransform: 'uppercase' as const,
  },
  addBtn: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  error: {
    margin: '0 0 12px',
    fontSize: 13,
    color: '#ef4444',
    background: '#fef2f2',
    padding: '10px 14px',
    borderRadius: 8,
    fontWeight: 500,
  },
  successMsg: {
    margin: '0 0 12px',
    fontSize: 13,
    color: '#16a34a',
    background: '#dcfce7',
    padding: '10px 14px',
    borderRadius: 8,
    fontWeight: 600,
  },
  form: {
    background: '#fff',
    borderRadius: 16,
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
    marginBottom: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 5,
  },
  row2: {
    display: 'flex',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    fontSize: 14,
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fff',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    fontSize: 14,
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fff',
    resize: 'vertical' as const,
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  btn: {
    padding: '13px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
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
    flexDirection: 'column' as const,
    gap: 12,
  },
  offreCard: {
    background: '#fff',
    borderRadius: 14,
    padding: '16px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
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
    whiteSpace: 'nowrap' as const,
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
  deleteBtn: {
    background: '#fee2e2',
    color: '#ef4444',
    border: 'none',
    borderRadius: 6,
    padding: '3px 8px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    lineHeight: 1,
  },
}
