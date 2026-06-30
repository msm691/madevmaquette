import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

interface LoginResponse {
  token: string
  user: { role: string }
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post<LoginResponse>('/auth/login', { email, password })
      localStorage.setItem('access_token', res.data.token)
      const { role } = res.data.user
      if (role === 'COMMERCANT') navigate('/commercant', { replace: true })
      else if (role === 'ADMIN') navigate('/admin', { replace: true })
      else navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>MADEV Pass</h1>
        <p style={s.subtitle}>Carte étudiante numérique de Vienne</p>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label} htmlFor="email">Email</label>
            <input
              id="email"
              style={s.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label} htmlFor="password">Mot de passe</label>
            <input
              id="password"
              style={s.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={s.error}>{error}</p>}
          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
          <p style={s.registerLink}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={s.registerLinkA}>S'inscrire</Link>
          </p>
        </form>
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
    maxWidth: 380,
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
  field: {
    display: 'flex',
    flexDirection: 'column',
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
  registerLink: {
    margin: 0,
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  registerLinkA: {
    color: '#1e3a8a',
    fontWeight: 600,
    textDecoration: 'none',
  },
}
