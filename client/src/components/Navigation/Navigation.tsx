import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Navigation.module.css'
import type { Role } from '../../types/user'

const MENU_ITEMS: { name: string; path: string; roles: Role[] }[] = [
  { name: 'QR Code',            path: '/dashboard',       roles: ['ADMIN', 'ETUDIANT', 'COMMERCANT'] },
  { name: 'Informations',       path: '/profile',         roles: ['ADMIN', 'ETUDIANT', 'COMMERCANT'] },
  { name: 'Liste des comptes',  path: '/admin/users',     roles: ['ADMIN'] },
  { name: 'Offres',             path: '/merchant/offers', roles: ['COMMERCANT'] },
  { name: 'Mon commerce',       path: '/merchant/edit',   roles: ['COMMERCANT'] },
]

function decodeRole(token: string): Role | null {
  try {
    return JSON.parse(atob(token.split('.')[1])).role ?? null
  } catch {
    return null
  }
}

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) setRole(decodeRole(token))
  }, [])

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function logout() {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  const visibleItems = role ? MENU_ITEMS.filter(item => item.roles.includes(role)) : []

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.hamburger}
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
        aria-expanded={open}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          {visibleItems.map(item => (
            <button
              key={item.path}
              className={styles.link}
              onClick={() => { navigate(item.path); setOpen(false) }}
            >
              {item.name}
            </button>
          ))}
          <button className={styles.logout} onClick={logout}>
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}
