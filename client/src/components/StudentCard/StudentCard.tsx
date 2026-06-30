import { QRCodeSVG } from 'qrcode.react'
import type { StudentUser } from '../../types/user'
import styles from './StudentCard.module.css'

interface Props {
  user: StudentUser
}

export default function StudentCard({ user }: Props) {
  const qrValue = JSON.stringify({
    id: user.id,
    carte: user.numeroCarte,
    ts: Math.floor(Date.now() / 60000), // rotation par minute
  })

  const initiales = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandName}>MADEV Pass</span>
          <span className={styles.brandSub}>Carte Étudiante · Vienne</span>
        </div>
        <div className={styles.chip} />
      </div>

      <div className={styles.body}>
        <div className={styles.info}>
          <div className={styles.avatar}>{initiales}</div>
          <div className={styles.nameBlock}>
            <span className={styles.name}>
              {user.prenom} {user.nom.toUpperCase()}
            </span>
            <span className={styles.cardNumber}>{user.numeroCarte}</span>
          </div>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} />
            Carte active
          </div>
        </div>

        <div className={styles.qrWrapper}>
          <QRCodeSVG value={qrValue} size={88} level="M" />
        </div>
      </div>
    </div>
  )
}
