import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/categories
router.get('/', async (_req, res) => {
  const categories = await prisma.categorie.findMany({ orderBy: { nom: 'asc' } })
  res.json(categories)
})

export default router
