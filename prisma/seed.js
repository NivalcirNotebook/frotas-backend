const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  const adminUsername = 'admin';
  const existingAdmin = await prisma.usuario.findUnique({
    where: { username: adminUsername }
  });

  if (existingAdmin) {
    console.log('✅ Usuário admin já existe. Seed não necessário.');
    return;
  }

  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.create({
    data: {
      username: 'admin',
      password: passwordHash,
      nome: 'Administrador',
      email: 'admin@casalinda.com',
      role: 'ADMIN',
      ativo: true
    }
  });

  console.log('✅ Usuário admin criado com sucesso!');
  console.log('   Username: admin');
  console.log('   Senha: admin123');
  console.log('   ⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
