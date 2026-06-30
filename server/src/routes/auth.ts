import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';

const router = Router();

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `attestation_${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Type de fichier non autorisé (PDF, JPG, PNG uniquement)'));
  },
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Minimum 8 caractères'),
  prenom: z.string().min(1),
  nom: z.string().min(1),
});

// POST /api/auth/register
router.post('/register', upload.single('attestation'), async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password, prenom, nom } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Cet email est déjà utilisé' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const documentAttestationUrl = req.file ? `/uploads/${req.file.filename}` : null;

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      prenom,
      nom,
      role: 'ETUDIANT',
      isActif: false,
      statutInscription: 'EN_ATTENTE',
      documentAttestationUrl,
    },
  });

  res.status(201).json({ message: 'Inscription reçue, en attente de validation admin' });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    return;
  }

  if (!user.isActif) {
    res.status(403).json({ error: 'Compte en attente de validation par un administrateur' });
    return;
  }

  const payload = { sub: user.id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      role: user.role,
      numeroCarte: user.numeroCarte,
    },
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { id: true, email: true, prenom: true, nom: true, role: true, numeroCarte: true, isActif: true },
  });
  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
    return;
  }
  res.json(user);
});

// GET /api/auth/qr-token — JWT éphémère 5 min pour QR étudiant
router.get('/qr-token', authMiddleware, requireRole('ETUDIANT'), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: { numeroCarte: true, isActif: true },
  });
  if (!user?.isActif || !user.numeroCarte) {
    res.status(403).json({ error: 'Carte inactive ou introuvable' });
    return;
  }
  const token = jwt.sign(
    { sub: req.user!.sub, carte: user.numeroCarte, type: 'QR' },
    process.env.JWT_SECRET!,
    { expiresIn: '5m' },
  );
  res.json({ token, expiresIn: 300 });
});

export default router;
