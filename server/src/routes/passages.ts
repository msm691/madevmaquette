import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const router = Router();

// ─── GET /dashboard ───────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const commerce = await prisma.commerce.findUnique({
      where: { proprietaireId: req.user!.sub },
      select: {
        id: true,
        nom: true,
        estValide: true,
        offres: {
          where: { estActive: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            titre: true,
            description: true,
            typeRemise: true,
            valeurRemise: true,
            dateDebut: true,
            dateFin: true,
          },
        },
        _count: { select: { passages: true } },
      },
    });

    if (!commerce) {
      res.status(404).json({ error: 'Commerce introuvable' });
      return;
    }

    res.json({
      commerce: { id: commerce.id, nom: commerce.nom, estValide: commerce.estValide },
      offres: commerce.offres,
      totalPassages: commerce._count.passages,
    });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /scan ───────────────────────────────────────────────────────────────
const scanSchema = z.object({
  qrToken: z.string().min(1),
  offreId: z.string().uuid().optional(),
});

interface QrPayload {
  sub: string;
  carte: string;
  type: string;
}

const ERROR_STATUS: Record<string, number> = {
  COMMERCE_NOT_FOUND: 403,
  COMMERCE_NOT_VALIDATED: 403,
  ETUDIANT_INVALIDE: 400,
  CARTE_MISMATCH: 400,
  OFFRE_INVALIDE: 400,
};

const ERROR_MSG: Record<string, string> = {
  COMMERCE_NOT_FOUND: 'Commerce introuvable',
  COMMERCE_NOT_VALIDATED: 'Commerce non validé par l\'admin',
  ETUDIANT_INVALIDE: 'Étudiant invalide ou inactif',
  CARTE_MISMATCH: 'Numéro de carte non concordant',
  OFFRE_INVALIDE: 'Offre invalide ou non rattachée à ce commerce',
};

router.post('/scan', async (req, res) => {
  const parsed = scanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { qrToken, offreId } = parsed.data;

  // Anti-rejeu : vérification signature JWT + expiration intégrée
  let qrPayload: QrPayload;
  try {
    qrPayload = jwt.verify(qrToken, process.env.JWT_SECRET!) as QrPayload;
    if (qrPayload.type !== 'QR') throw new Error('type_mismatch');
  } catch {
    res.status(400).json({ error: 'QR invalide ou expiré' });
    return;
  }

  try {
    const passage = await prisma.$transaction(async (tx) => {
      // Vérification commerce rattaché au commercant connecté
      const commerce = await tx.commerce.findUnique({
        where: { proprietaireId: req.user!.sub },
      });
      if (!commerce) throw new Error('COMMERCE_NOT_FOUND');
      if (!commerce.estValide) throw new Error('COMMERCE_NOT_VALIDATED');

      // Vérification étudiant valide
      const etudiant = await tx.user.findUnique({ where: { id: qrPayload.sub } });
      if (!etudiant || etudiant.role !== 'ETUDIANT' || !etudiant.isActif) {
        throw new Error('ETUDIANT_INVALIDE');
      }
      if (etudiant.numeroCarte !== qrPayload.carte) throw new Error('CARTE_MISMATCH');

      // Vérification ownership offre ↔ commerce du commercant
      if (offreId) {
        const offre = await tx.offre.findUnique({ where: { id: offreId } });
        if (!offre || offre.commerceId !== commerce.id || !offre.estActive) {
          throw new Error('OFFRE_INVALIDE');
        }
      }

      return tx.passageHistorique.create({
        data: {
          etudiantId: etudiant.id,
          commerceId: commerce.id,
          offreId: offreId ?? null,
          valideParId: req.user!.sub,
        },
        include: {
          etudiant: { select: { prenom: true, nom: true, numeroCarte: true } },
        },
      });
    });

    // Journalisation audit transactionnelle
    console.info('[AUDIT][SCAN]', JSON.stringify({
      passageId: passage.id,
      etudiantId: passage.etudiantId,
      commerceId: passage.commerceId,
      offreId: passage.offreId,
      valideParId: passage.valideParId,
      scanneLe: passage.scanneLe.toISOString(),
    }));

    res.status(201).json({
      passage: { id: passage.id, scanneLe: passage.scanneLe, offreId: passage.offreId },
      etudiant: passage.etudiant,
    });
  } catch (err: unknown) {
    const code = (err as Error).message;
    const status = ERROR_STATUS[code] ?? 500;
    res.status(status).json({ error: ERROR_MSG[code] ?? 'Erreur serveur' });
  }
});

export default router;
