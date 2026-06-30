export type Role = 'ETUDIANT' | 'COMMERCANT' | 'ADMIN'

export interface User {
  id: string
  email: string
  role: Role
  prenom: string
  nom: string
  numeroCarte: string | null
  isActif: boolean
  createdAt: string
  updatedAt: string
}

export type StudentUser = User & {
  role: 'ETUDIANT'
  numeroCarte: string
}
