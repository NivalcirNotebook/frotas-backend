require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('=== TESTE DE CONEXÃO COM BANCO DE DADOS ===\n');
console.log('DATABASE_URL do .env:', process.env.DATABASE_URL);
console.log('\nTentando conectar...\n');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    // Tenta fazer uma query simples
    await prisma.$connect();
    console.log('✅ CONECTADO COM SUCESSO!\n');
    
    // Testa uma query real
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('📊 Informações do Banco:');
    console.log(result);
    
    // Tenta contar usuários
    const userCount = await prisma.usuario.count();
    console.log(`\n👥 Total de usuários na tabela: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('\n✅ Desconectado com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO AO CONECTAR:');
    console.error('Mensagem:', error.message);
    console.error('Código:', error.code);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
