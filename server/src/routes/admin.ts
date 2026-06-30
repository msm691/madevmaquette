import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/admin/inscriptions
router.get('/inscriptions', async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { statutInscription: 'EN_ATTENTE' },
    select: {
      id: true,
      email: true,
      prenom: true,
      nom: true,
      documentAttestationUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json(users);
});

// PATCH /api/admin/valider/:userId
router.patch('/valider/:userId', async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
    return;
  }

  const numeroCarte = `MADEV-${Date.now().toString(36).toUpperCase()}`;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActif: true, statutInscription: 'VALIDE', numeroCarte },
    select: { id: true, prenom: true, nom: true, isActif: true, statutInscription: true, numeroCarte: true },
  });

  res.json(updated);
});

// PATCH /api/admin/refuser/:userId
router.patch('/refuser/:userId', async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActif: false, statutInscription: 'REJETÉ' },
    select: { id: true, prenom: true, nom: true, isActif: true, statutInscription: true },
  });

  res.json(updated);
});

export default router;
