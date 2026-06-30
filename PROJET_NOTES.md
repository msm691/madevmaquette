Auto-revue — MADEV Pass (session 1)
1. Architecture & Stack
Frontend (client/)

React 18 + TypeScript 5.5 (strict mode activé — noUnusedLocals, noUnusedParameters)
Vite 5 (dev server :3000, proxy /api → :3001)
React Router DOM v6
qrcode.react v4.2.0 — QR code SVG
axios — client HTTP avec intercepteur Bearer token
CSS Modules natifs Vite (pas de Tailwind, pas d'UI lib externe)
Backend (server/)

Node.js + Express 5 + TypeScript
Prisma 5 (ORM) + SQLite (dev.db) — migration-ready vers PostgreSQL
bcryptjs — hash mots de passe
jsonwebtoken — auth JWT
zod — validation des entrées
ts-node-dev — hot reload
Arborescence actuelle


client/src/
  api/client.ts          ← axios + intercepteur JWT
  components/
    BottomNav/           ← nav fixe 3 onglets
    MerchantCard/        ← carte commerçant
    StudentCard/         ← carte numérique QR
  data/mockCommerces.ts  ← 8 commerçants + 6 catégories
  pages/etudiant/
    Dashboard.tsx        ← page Ma Carte
    Annuaire.tsx         ← page Annuaire
  types/
    user.ts              ← User + StudentUser (miroir Prisma)
    commerce.ts          ← Commerce + Categorie + CommerceWithDetails

server/src/
  index.ts               ← Express bootstrapé, routes commentées
  types/index.ts         ← JwtPayload + Express.Request augmenté
  prisma/schema.prisma   ← schéma complet (User, Commerce, Offre, Passage, Favori)
2. État fonctionnel des composants
Composant / Page	État	Notes
StudentCard	✅ Fonctionnel (mocké)	QR rotatif à la minute, initiales, badge actif
Dashboard	✅ Fonctionnel (mocké)	Fetch GET /api/me → fallback mock Marie Dupont
BottomNav	✅ Fonctionnel	useLocation pour état actif, 3 onglets
MerchantCard	✅ Fonctionnel	Distance, offres actives, toggle cœur favori (local)
Annuaire	✅ Fonctionnel (mocké)	Recherche + filtres catégories + tri proximité, fetch → fallback mock
Backend API	❌ Aucune route implémentée	Express démarré, routes TODO
Auth JWT	❌ Non implémenté	Structure prête (JwtPayload, intercepteur axios)
Base de données	❌ Non migrée	Schéma Prisma complet, prisma migrate non exécuté
3. Points de vigilance (dette technique)
Favoris non persistés — le toggle cœur dans MerchantCard est purement local (useState<Set<string>>). Il sera perdu au rechargement ; à brancher sur POST/DELETE /api/favoris à l'étape suivante.
Pas d'authentification — tous les fetches tombent sur le mock silencieusement. L'intercepteur axios dans api/client.ts est prêt (Bearer token depuis localStorage) mais aucun token n'est jamais émis.
SQLite en dev seulement — le schéma Prisma est sur SQLite (file:./dev.db). Les enums (Role, TypeRemise) ne sont pas supportés nativement par SQLite → Prisma les émule en String. À migrer vers PostgreSQL avant la prod.
@types/qrcode.react v1.0.5 inutile — qrcode.react v4 embarque ses propres types. Le package @types/qrcode.react installé est obsolète (types v1 ≠ API v4) ; il est ignoré grâce à skipLibCheck: true. À désinstaller pour éviter la confusion.
error state dans Dashboard — setError(null) dans le .catch est redondant (valeur initiale déjà null). Mineur, à nettoyer quand l'auth sera branchée.
Pas de gestion de session/token expiry — aucun refresh token, aucun redirect sur 401.
Pages commerçant et admin — encore des <div> placeholders dans App.tsx.
4. Roadmap — 3 prochaines étapes prioritaires
Étape A — Page Favoris (Interface 1, dernier écran)

Page Annuaire filtrée sur favoris.has(id) + persistance via POST/DELETE /api/favoris
Compléter l'Interface Étudiant
Étape B — Backend Auth + API core (débloque tout)

prisma migrate dev + seed de données
Routes : POST /api/auth/login, GET /api/me, GET /api/commerces, GET /api/categories, POST|DELETE /api/favoris
Middleware authMiddleware (vérif JWT + injection req.user)
Sans ça, toute l'Interface 2 (scan QR commerçant) est bloquée
Étape C — Interface 2 (Espace Commerçant)

Page Dashboard commerçant : liste de ses offres actives + stats de passages
Page Scanner QR : décode le payload {id, carte, ts}, valide le token côté serveur, enregistre un PassageHistorique
Page Gestion des offres (CRUD Offre)