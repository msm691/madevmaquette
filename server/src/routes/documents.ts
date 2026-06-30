import { Router } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

function sanitizeFilename(filename: string): string | null {
  const f = Array.isArray(filename) ? filename[0] : filename;
  if (f.includes('/') || f.includes('\\') || f.includes('..')) return null;
  return f;
}

async function checkAccess(filename: string, userId: string, role: string): Promise<boolean> {
  if (role === 'ADMIN') return true;
  const owner = await prisma.user.findFirst({
    where: { documentAttestationUrl: `/uploads/${filename}` },
    select: { id: true },
  });
  return !!owner && owner.id === userId;
}

// GET /api/documents/token/:filename — émet un JWT éphémère (1 min) pour affichage inline
router.get('/token/:filename', authMiddleware, async (req, res) => {
  const rawParam = req.params.filename;
  const filename = sanitizeFilename(Array.isArray(rawParam) ? rawParam[0] : rawParam);
  if (!filename) { res.status(400).json({ error: 'Nom de fichier invalide' }); return; }

  const allowed = await checkAccess(filename, req.user!.sub, req.user!.role);
  if (!allowed) { res.status(403).json({ error: 'Accès refusé' }); return; }

  const token = jwt.sign(
    { filename, sub: req.user!.sub, type: 'DOC_VIEW' },
    process.env.JWT_SECRET!,
    { expiresIn: '1m' },
  );
  res.json({ token });
});

// GET /api/documents/:filename?token=<jwt_ephemere> — sert le fichier inline
router.get('/:filename', async (req, res) => {
  const rawParam2 = req.params.filename;
  const filename = sanitizeFilename(Array.isArray(rawParam2) ? rawParam2[0] : rawParam2);
  if (!filename) { res.status(400).json({ error: 'Nom de fichier invalide' }); return; }

  const raw = req.query.token;
  const tokenStr = Array.isArray(raw) ? raw[0] : raw;
  if (!tokenStr || typeof tokenStr !== 'string') {
    res.status(401).json({ error: 'Token manquant' });
    return;
  }

  let payload: { filename: string; type: string };
  try {
    payload = jwt.verify(tokenStr, process.env.JWT_SECRET!) as typeof payload;
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
    return;
  }

  if (payload.type !== 'DOC_VIEW' || payload.filename !== filename) {
    res.status(403).json({ error: 'Accès refusé' });
    return;
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_MAP[ext] ?? 'application/octet-stream';
  res.setHeader('Content-Type', contentType);

  const filePath = path.join(UPLOADS_DIR, filename);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ error: 'Fichier introuvable' });
  });
});

export default router;
