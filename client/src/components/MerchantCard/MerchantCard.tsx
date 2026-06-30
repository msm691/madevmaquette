import type { CommerceWithDetails } from '../../types/commerce'
import styles from './MerchantCard.module.css'

interface Props {
  commerce: CommerceWithDetails
  isFavori?: boolean
  onToggleFavori?: (id: string) => void
}

export default function MerchantCard({ commerce, isFavori = false, onToggleFavori }: Props) {
  const icone = commerce.categorie.icone ?? '🏪'

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.iconWrap}>{icone}</div>

        <div className={styles.meta}>
          <p className={styles.nom}>{commerce.nom}</p>
          <p className={styles.adresse}>{commerce.adresse}, {commerce.ville}</p>
        </div>

        <div className={styles.right}>
          {commerce.distanceKm !== undefined && (
            <span className={styles.distance}>
              {commerce.distanceKm < 1
                ? `${(commerce.distanceKm * 1000).toFixed(0)} m`
                : `${commerce.distanceKm.toFixed(1)} km`}
            </span>
          )}
          <button
            className={`${styles.heart} ${isFavori ? styles.active : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavori?.(commerce.id) }}
            aria-label={isFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"
              fill={isFavori ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>

      {commerce.description && (
        <p className={styles.description}>{commerce.description}</p>
      )}

      <div className={styles.footer}>
        <span className={styles.categoryChip}>{commerce.categorie.nom}</span>
        {commerce.offresActives > 0 && (
          <span className={styles.offerBadge}>
            {commerce.offresActives} offre{commerce.offresActives > 1 ? 's' : ''} active{commerce.offresActives > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
