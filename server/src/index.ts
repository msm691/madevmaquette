import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import commercesRoutes from './routes/commerces';
import categoriesRoutes from './routes/categories';
import passagesRoutes from './routes/passages';
import documentsRoutes from './routes/documents';
import { authMiddleware, requireRole } from './middleware/authMiddleware';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentsRoutes);

const adminGuard = [authMiddleware, requireRole('ADMIN')] as const;
app.use('/api/admin', ...adminGuard, adminRoutes);
app.use('/api/commerces', commercesRoutes);
app.use('/api/categories', categoriesRoutes);

// Espace commerçant : authMiddleware + COMMERCANT requis
const commercantGuard = [authMiddleware, requireRole('COMMERCANT')] as const;
app.use('/api/commercant', ...commercantGuard, passagesRoutes);  // GET /api/commercant/dashboard
app.use('/api/passages', ...commercantGuard, passagesRoutes);    // POST /api/passages/scan

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
