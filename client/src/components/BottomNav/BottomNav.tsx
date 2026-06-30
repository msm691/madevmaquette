import { useLocation, useNavigate } from 'react-router-dom'
import styles from './BottomNav.module.css'

const TABS = [
  {
    path: '/',
    label: 'Ma carte',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#1e3a8a' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    path: '/annuaire',
    label: 'Annuaire',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#1e3a8a' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    path: '/favoris',
    label: 'Favoris',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24"
        fill={active ? '#1e3a8a' : 'none'}
        stroke={active ? '#1e3a8a' : '#94a3b8'} strokeWidth="2" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className={styles.nav}>
      {TABS.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`${styles.item} ${active ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
          >
            <span className={styles.icon}>{tab.icon(active)}</span>
            <span className={styles.label}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
