export type Role = 'ETUDIANT' | 'COMMERCANT' | 'ADMIN';
export type TypeRemise = 'POURCENTAGE' | 'MONTANT_FIXE' | 'ARTICLE_OFFERT' | 'AUTRE';

export interface JwtPayload {
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
