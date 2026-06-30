-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "numeroCarte" TEXT,
    "isActif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "commerces" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proprietaireId" TEXT NOT NULL,
    "categorieId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "codePostal" TEXT NOT NULL,
    "telephone" TEXT,
    "emailContact" TEXT,
    "siteWeb" TEXT,
    "logoUrl" TEXT,
    "estValide" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "commerces_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "commerces_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "offres" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commerceId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "typeRemise" TEXT NOT NULL,
    "valeurRemise" REAL,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME,
    "estActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "offres_commerceId_fkey" FOREIGN KEY ("commerceId") REFERENCES "commerces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "passages_historique" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "etudiantId" TEXT NOT NULL,
    "commerceId" TEXT NOT NULL,
    "offreId" TEXT,
    "valideParId" TEXT NOT NULL,
    "scanneLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "passages_historique_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "passages_historique_commerceId_fkey" FOREIGN KEY ("commerceId") REFERENCES "commerces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "passages_historique_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "offres" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "passages_historique_valideParId_fkey" FOREIGN KEY ("valideParId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "favoris" (
    "etudiantId" TEXT NOT NULL,
    "commerceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("etudiantId", "commerceId"),
    CONSTRAINT "favoris_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "favoris_commerceId_fkey" FOREIGN KEY ("commerceId") REFERENCES "commerces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_numeroCarte_key" ON "users"("numeroCarte");

-- CreateIndex
CREATE UNIQUE INDEX "categories_nom_key" ON "categories"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "commerces_proprietaireId_key" ON "commerces"("proprietaireId");
