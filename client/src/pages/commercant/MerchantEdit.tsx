import { useEffect, useState, type FormEvent } from 'react'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'

interface Commerce {
  id: string
  nom: string
  description: string
  adresse: string
  telephone: string
  siteWeb: string
  estValide: boolean
}

export default function MerchantEdit() {
  const [commerce, setCommerce] = useState<Commerce | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [form, setForm] = useState({
    nom: '',
    description: '',
    adresse: '',
    telephone: '',
    siteWeb: '',
  })

  useEffect(() => {
    api.get<{ commerce: Commerce }>('/commercant/dashboard')
      .then(res => {
        const c = res.data.commerce
        setCommerce(c)
        setForm({
          nom: c.nom ?? '',
          description: c.description ?? '',
          adresse: c.adresse ?? '',
          telephone: c.telephone ?? '',
          siteWeb: c.siteWeb ?? '',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await api.patch('/commercant/commerce', form)
      setCommerce(prev => prev ? { ...prev, ...form } : prev)
      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleCancelEdit() {
    if (commerce) {
      setForm({
        nom: commerce.nom ?? '',
        description: commerce.description ?? '',
        adresse: commerce.adresse ?? '',
        telephone: commerce.telephone ?? '',
        siteWeb: commerce.siteWeb ?? '',
      })
    }
    setError(null)
    setIsEditing(false)
  }

  if (loading) return <div style={s.center}>Chargement...</div>
  if (!commerce) return <div style={s.center}>Erreur de chargement</div>

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.headerLabel}>Mon commerce</p>
          <h1 style={s.headerTitle}>{commerce.nom}</h1>
        </div>
        <Navigation />
      </header>

      <main style={s.main}>
        <div style={s.topBar}>
          <p style={s.sectionLabel}>INFORMATIONS</p>
          {!isEditing && (
            <button style={s.editBtn} onClick={() => setIsEditing(true)}>Modifier</button>
          )}
        </div>

        {success && <p style={s.successMsg}>Modifications enregistrées ✓</p>}

        {!isEditing ? (
          <div style={s.card}>
            {([
              ['Nom du commerce', commerce.nom],
              ['Adresse', commerce.adresse],
              ['Téléphone', commerce.telephone],
              ['Site web', commerce.siteWeb],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} style={s.row}>
                <span style={s.rowLabel}>{label}</span>
                <span style={s.rowValue}>{value || '—'}</span>
              </div>
            ))}
            <div style={{ ...s.row, borderBottom: 'none', alignItems: 'flex-start' }}>
              <span style={s.rowLabel}>Description</span>
              <span style={{ ...s.rowValue, maxWidth: '60%', textAlign: 'right' as const, lineHeight: 1.5 }}>
                {commerce.description || '—'}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            {([
              { field: 'nom', label: 'Nom du commerce', type: 'text' },
              { field: 'adresse', label: 'Adresse', type: 'text' },
              { field: 'telephone', label: 'Téléphone', type: 'tel' },
              { field: 'siteWeb', label: 'Site web', type: 'url' },
            ] as { field: keyof typeof form; label: string; type: string }[]).map(({ field, label, type }) => (
              <div key={field} style={s.field}>
                <label style={s.label} htmlFor={field}>{label}</label>
                <input
                  id={field}
                  type={type}
                  style={s.input}
                  value={form[field]}
                  onChange={handleChange(field)}
                />
              </div>
            ))}

            <div style={s.field}>
              <label style={s.label} htmlFor="description">Description</label>
              <textarea
                id="description"
                style={s.textarea}
                value={form.description}
                onChange={handleChange('description')}
                rows={4}
              />
            </div>

            {error && <p style={s.error}>{error}</p>}

            <div style={s.btnRow}>
              <button type="button" style={s.cancelBtn} onClick={handleCancelEdit}>
                Annuler
              </button>
              <button
                type="submit"
                style={{ ...s.btn, opacity: saving ? 0.7 : 1, flex: 1 }}
                disabled={saving}
              >
                {saving ? 'Enregistrement…' : 'Sauvegarder'}
              </button>
            </div>
          </form>
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
    maxWidth: 560,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '2px',
    color: '#64748b',
    margin: 0,
    textTransform: 'uppercase' as const,
  },
  editBtn: {
    padding: '7px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
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
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    fontSize: 14,
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fff',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    fontSize: 14,
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fff',
    resize: 'vertical' as const,
  },
  error: {
    margin: 0,
    fontSize: 13,
    color: '#ef4444',
    background: '#fef2f2',
    padding: '10px 14px',
    borderRadius: 8,
    fontWeight: 500,
  },
  successMsg: {
    margin: '0 0 14px',
    fontSize: 13,
    color: '#16a34a',
    background: '#dcfce7',
    padding: '10px 14px',
    borderRadius: 8,
    fontWeight: 600,
  },
  btnRow: {
    display: 'flex',
    gap: 10,
  },
  cancelBtn: {
    padding: '14px 20px',
    borderRadius: 12,
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    color: '#374151',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btn: {
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}
