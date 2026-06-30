-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "numeroCarte" TEXT,
    "isActif" BOOLEAN NOT NULL DEFAULT true,
    "statutInscription" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "documentAttestationUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "id", "isActif", "nom", "numeroCarte", "passwordHash", "prenom", "role", "updatedAt") SELECT "createdAt", "email", "id", "isActif", "nom", "numeroCarte", "passwordHash", "prenom", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_numeroCarte_key" ON "users"("numeroCarte");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
