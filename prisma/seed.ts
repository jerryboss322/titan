// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_ACCOUNTS = [
  {
    name: 'Jerry Adewole',
    email: 'jerryadewole2023@gmail.com',
    password: 'Jerry2005',
    role: 'SUPER_ADMIN' as const,
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
  },
  {
    name: 'Amara Okonkwo',
    email: 'admin@titan.com',
    password: 'Admin@12345',
    role: 'ADMIN' as const,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    name: 'Temi Adeyemi',
    email: 'editor@titan.com',
    password: 'Editor@1234',
    role: 'EDITOR' as const,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  },
  {
    name: 'Sally Green',
    email: 'customer@titan.com',
    password: 'Customer@123',
    role: 'CUSTOMER' as const,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const account of SEED_ACCOUNTS) {
    const hashedPassword = await bcrypt.hash(account.password, 12);

    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: {
        name: account.name,
        email: account.email,
        password: hashedPassword,
        role: account.role,
        image: account.image,
      },
    });

    console.log(`✅ Seeded: ${user.email} (${user.role})`);
  }

  console.log('\n📋 Test credentials:');
  for (const account of SEED_ACCOUNTS) {
    console.log(`  ${account.role.padEnd(12)} ${account.email}  /  ${account.password}`);
  }
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
