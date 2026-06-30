export interface Categorie {
  id: number
  nom: string
  slug: string
  icone: string | null
  createdAt: string
}

export interface Commerce {
  id: string
  proprietaireId: string
  categorieId: number
  nom: string
  description: string | null
  adresse: string
  ville: string
  codePostal: string
  telephone: string | null
  emailContact: string | null
  siteWeb: string | null
  logoUrl: string | null
  estValide: boolean
  createdAt: string
  updatedAt: string
}

export interface CommerceWithDetails extends Commerce {
  categorie: Categorie
  offresActives: number
  distanceKm?: number
}
