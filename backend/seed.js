const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@docflow.edu' },
    update: {},
    create: {
      email: 'admin@docflow.edu',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created/verified:', admin);

  const preReg = await prisma.preRegisteredStudent.upsert({
    where: { rollNumber: '1001' },
    update: {},
    create: {
      rollNumber: '1001',
    }
  });
  console.log('Pre-registered student 1001 added');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
