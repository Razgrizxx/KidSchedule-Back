import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('Admin@2026!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'christian@kidschedule.app' },
    update: {},
    create: {
      firstName: 'Christian Javier',
      lastName: 'Rizzo',
      email: 'christian@kidschedule.app',
      passwordHash,
      isVerified: true,
    },
  });

  // Create the family and link the user as a member
  const existingMembership = await prisma.familyMember.findFirst({
    where: { userId: user.id },
  });

  if (!existingMembership) {
    const family = await prisma.family.create({
      data: {
        name: 'Family Rizzo',
        members: {
          create: { userId: user.id, role: 'PARENT' },
        },
      },
    });
    console.log('Created family:', family.name);
  }

  console.log('Seed complete. Initial user:', {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
