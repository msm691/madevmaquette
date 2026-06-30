import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', password: '' })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('prenom', form.prenom)
      formData.append('nom', form.nom)
      formData.append('email', form.email)
      formData.append('password', form.password)
      if (file) formData.append('attestation', file)
      await api.post('/auth/register', formData, { headers: { 'Content-Type': undefined } })
      setSuccess(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.checkIcon}>✓</div>
          <h2 style={s.successTitle}>Inscription reçue !</h2>
          <p style={s.successText}>
            Votre demande est en attente de validation par un administrateur.
            Vous pourrez vous connecter une fois votre dossier validé.
          </p>
          <button style={s.btn} onClick={() => navigate('/login')}>
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>MADEV Pass</h1>
        <p style={s.subtitle}>Créer un compte étudiant</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label} htmlFor="prenom">Prénom</label>
              <input id="prenom" style={s.input} name="prenom" value={form.prenom} onChange={handleChange} required />
            </div>
            <div style={s.field}>
              <label style={s.label} htmlFor="nom">Nom</label>
              <input id="nom" style={s.input} name="nom" value={form.nom} onChange={handleChange} required />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label} htmlFor="email">Email</label>
            <input id="email" style={s.input} name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
          </div>
          <div style={s.field}>
            <label style={s.label} htmlFor="password">Mot de passe</label>
            <input id="password" style={s.input} name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} required minLength={8} />
            <span style={s.hint}>8 caractères minimum</span>
          </div>
          <div style={s.field}>
            <label style={s.label}>Attestation de scolarité</label>
            <label style={s.fileBtn} htmlFor="attestation">
              {file ? `📄 ${file.name}` : '📎 Choisir un document'}
            </label>
            <input id="attestation" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFile} />
            <span style={s.hint}>PDF, JPG ou PNG — 5 Mo max</span>
          </div>
          {error && <p style={s.error}>{error}</p>}
          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Envoi en cours…' : 'Envoyer ma demande'}
          </button>
        </form>
        <p style={s.loginLink}>
          Déjà un compte ? <Link to="/login" style={s.link}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: '40px 32px',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: '6px 0 28px',
    fontSize: 13,
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  row: {
    display: 'flex',
    gap: 12,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
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
    width: '100%',
    boxSizing: 'border-box',
  },
  fileBtn: {
    display: 'block',
    padding: '11px 16px',
    borderRadius: 10,
    border: '1.5px dashed #c7d2fe',
    background: '#eef2ff',
    color: '#4338ca',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
  },
  hint: {
    fontSize: 11,
    color: '#94a3b8',
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
  btn: {
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 4,
    fontFamily: 'inherit',
  },
  checkIcon: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    fontSize: 28,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  successTitle: {
    margin: '0 0 12px',
    fontSize: 22,
    fontWeight: 800,
    color: '#0f172a',
    textAlign: 'center',
  },
  successText: {
    margin: '0 0 28px',
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.6,
  },
  loginLink: {
    margin: '20px 0 0',
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  link: {
    color: '#3b82f6',
    fontWeight: 600,
    textDecoration: 'none',
  },
}
