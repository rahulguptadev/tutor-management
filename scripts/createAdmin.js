const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('AnitaGupta', 10);
  const email = 'anitascholaracademy@gmail.com';
  const name = 'Anita Gupta';

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('User already exists:', email);
    return;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password,
      role: 'ADMIN',
    },
  });
  console.log('Admin created:', email);
}

main().catch(console.error).finally(() => prisma.$disconnect()); 