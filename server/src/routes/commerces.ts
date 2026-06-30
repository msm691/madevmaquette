import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/commerces — liste publique des commerces validés
router.get('/', async (_req, res) => {
  const commerces = await prisma.commerce.findMany({
    where: { estValide: true },
    include: {
      categorie: true,
      _count: { select: { offres: { where: { estActive: true } } } },
    },
    orderBy: { nom: 'asc' },
  })

  res.json(
    commerces.map(({ _count, ...c }) => ({
      ...c,
      offresActives: _count.offres,
    })),
  )
})

export default router
