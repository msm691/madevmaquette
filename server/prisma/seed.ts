import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pwd: string) => bcrypt.hash(pwd, 10);

  // Categories
  const catResto = await prisma.categorie.upsert({
    where: { slug: 'restauration' },
    update: {},
    create: { nom: 'Restauration', slug: 'restauration', icone: '🍽️' },
  });
  const catCulture = await prisma.categorie.upsert({
    where: { slug: 'culture' },
    update: {},
    create: { nom: 'Culture & Loisirs', slug: 'culture', icone: '🎭' },
  });

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@madevpass.fr' },
    update: {},
    create: {
      email: 'admin@madevpass.fr',
      passwordHash: await hash('Admin1234!'),
      role: 'ADMIN',
      prenom: 'Super',
      nom: 'Admin',
    },
  });

  // Étudiant
  const etudiant = await prisma.user.upsert({
    where: { email: 'etudiant@madevpass.fr' },
    update: {},
    create: {
      email: 'etudiant@madevpass.fr',
      passwordHash: await hash('Etudiant1234!'),
      role: 'ETUDIANT',
      prenom: 'Marie',
      nom: 'Dupont',
      numeroCarte: 'ETU-2024-001',
    },
  });

  // Commerçant
  const commercant = await prisma.user.upsert({
    where: { email: 'commercant@madevpass.fr' },
    update: {},
    create: {
      email: 'commercant@madevpass.fr',
      passwordHash: await hash('Commercant1234!'),
      role: 'COMMERCANT',
      prenom: 'Pierre',
      nom: 'Martin',
    },
  });

  // Commerce
  await prisma.commerce.upsert({
    where: { proprietaireId: commercant.id },
    update: {},
    create: {
      proprietaireId: commercant.id,
      categorieId: catResto.id,
      nom: 'Le Bistrot Viennois',
      description: 'Cuisine traditionnelle avec réduction étudiante',
      adresse: '12 rue des Étudiants',
      ville: 'Vienne',
      codePostal: '38200',
      telephone: '04 74 00 00 01',
      emailContact: 'bistrot@example.fr',
      estValide: true,
    },
  });

  console.log('✅ Seed terminé');
  console.log('  admin@madevpass.fr       / Admin1234!');
  console.log('  etudiant@madevpass.fr    / Etudiant1234!');
  console.log('  commercant@madevpass.fr  / Commercant1234!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
