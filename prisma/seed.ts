import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

  console.log('Seed complete. Initial user:', {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
