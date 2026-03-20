const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');

const DATA_DIR = path.join(__dirname, '../data');
const BACKUP_DIR = path.join(__dirname, '../data/backup');

async function createBackup() {
  console.log('\n📦 Criando backup dos arquivos JSON...');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const files = ['frota.json', 'motoristas.json', 'viagens.json'];

  files.forEach(file => {
    const sourcePath = path.join(DATA_DIR, file);
    if (fs.existsSync(sourcePath)) {
      const backupPath = path.join(BACKUP_DIR, `${timestamp}_${file}`);
      fs.copyFileSync(sourcePath, backupPath);
      console.log(`   ✓ Backup criado: ${backupPath}`);
    }
  });

  console.log('✅ Backup concluído!\n');
}

async function loadJsonData() {
  console.log('📂 Carregando dados dos arquivos JSON...\n');

  const frotaPath = path.join(DATA_DIR, 'frota.json');
  const motoristasPath = path.join(DATA_DIR, 'motoristas.json');
  const viagensPath = path.join(DATA_DIR, 'viagens.json');

  const frota = fs.existsSync(frotaPath) 
    ? JSON.parse(fs.readFileSync(frotaPath, 'utf8'))
    : [];

  const motoristas = fs.existsSync(motoristasPath)
    ? JSON.parse(fs.readFileSync(motoristasPath, 'utf8'))
    : [];

  const viagensData = fs.existsSync(viagensPath)
    ? JSON.parse(fs.readFileSync(viagensPath, 'utf8'))
    : { viagens: [], proximoId: 1 };

  console.log(`   Veículos: ${frota.length}`);
  console.log(`   Motoristas: ${motoristas.length}`);
  console.log(`   Viagens: ${viagensData.viagens.length}\n`);

  return { frota, motoristas, viagens: viagensData.viagens };
}

async function migrateMotoristas(motoristas) {
  console.log('👤 Migrando motoristas...');

  const motoristaMap = new Map();

  for (const m of motoristas) {
    try {
      const motorista = await prisma.motorista.create({
        data: {
          nome: m.nome,
          cnh: m.cnh,
          telefone: m.telefone || null,
          email: m.email || null,
          ativo: m.ativo !== undefined ? m.ativo : true,
          dataCadastro: m.dataCadastro || new Date().toISOString().split('T')[0]
        }
      });

      motoristaMap.set(m.id, motorista.id);
      console.log(`   ✓ ${motorista.nome} (ID: ${m.id} → ${motorista.id})`);
    } catch (error) {
      console.error(`   ✗ Erro ao migrar motorista ${m.nome}:`, error.message);
    }
  }

  console.log(`✅ ${motoristaMap.size} motoristas migrados!\n`);
  return motoristaMap;
}

async function migrateVeiculos(frota, motoristaMap) {
  console.log('🚗 Migrando veículos e registros...');

  const veiculoMap = new Map();
  let totalAbastecimentos = 0;
  let totalManutencoes = 0;
  let totalTrocasPneus = 0;
  let totalTrocasOleo = 0;
  let totalRevisoes = 0;

  for (const v of frota) {
    try {
      const veiculo = await prisma.veiculo.create({
        data: {
          marca: v.marca,
          modelo: v.modelo,
          placa: v.placa,
          ano: v.ano,
          kmAtual: v.kmAtual || 0
        }
      });

      veiculoMap.set(v.id, veiculo.id);
      console.log(`   ✓ ${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa} (ID: ${v.id} → ${veiculo.id})`);

      if (v.registros) {
        if (v.registros.abastecimentos && v.registros.abastecimentos.length > 0) {
          for (const a of v.registros.abastecimentos) {
            await prisma.abastecimento.create({
              data: {
                veiculoId: veiculo.id,
                motoristaId: a.motoristaId ? motoristaMap.get(a.motoristaId) : null,
                data: a.data,
                km: a.km,
                litros: a.litros,
                valorTotal: a.valorTotal,
                valorPorLitro: a.valorPorLitro || (a.valorTotal / a.litros)
              }
            });
            totalAbastecimentos++;
          }
        }

        if (v.registros.manutencoes && v.registros.manutencoes.length > 0) {
          for (const m of v.registros.manutencoes) {
            await prisma.manutencao.create({
              data: {
                veiculoId: veiculo.id,
                motoristaId: m.motoristaId ? motoristaMap.get(m.motoristaId) : null,
                data: m.data,
                km: m.km,
                tipo: m.tipo,
                descricao: m.descricao,
                valorTotal: m.valorTotal
              }
            });
            totalManutencoes++;
          }
        }

        if (v.registros.trocaPneus && v.registros.trocaPneus.length > 0) {
          for (const p of v.registros.trocaPneus) {
            await prisma.trocaPneu.create({
              data: {
                veiculoId: veiculo.id,
                motoristaId: p.motoristaId ? motoristaMap.get(p.motoristaId) : null,
                data: p.data,
                km: p.km,
                eixo: p.eixo || '',
                posicao: p.posicao || '',
                quantidade: p.quantidade,
                valorTotal: p.valorTotal,
                tipo: p.tipo
              }
            });
            totalTrocasPneus++;
          }
        }

        if (v.registros.trocasOleo && v.registros.trocasOleo.length > 0) {
          for (const o of v.registros.trocasOleo) {
            await prisma.trocaOleo.create({
              data: {
                veiculoId: veiculo.id,
                motoristaId: o.motoristaId ? motoristaMap.get(o.motoristaId) : null,
                data: o.data,
                km: o.km,
                tipoOleo: o.tipoOleo,
                quantidade: o.quantidade,
                filtroOleo: o.filtroOleo || false,
                filtroAr: o.filtroAr || false,
                filtroCombustivel: o.filtroCombustivel || false,
                valorTotal: o.valorTotal,
                observacoes: o.observacoes || ''
              }
            });
            totalTrocasOleo++;
          }
        }

        if (v.registros.revisoes && v.registros.revisoes.length > 0) {
          for (const r of v.registros.revisoes) {
            await prisma.revisao.create({
              data: {
                veiculoId: veiculo.id,
                motoristaId: r.motoristaId ? motoristaMap.get(r.motoristaId) : null,
                data: r.data,
                km: r.km,
                tipoRevisao: r.tipoRevisao,
                itensRevisados: r.itensRevisados || {},
                observacoes: r.observacoes || '',
                valorTotal: r.valorTotal,
                proximaRevisao: r.proximaRevisao || null
              }
            });
            totalRevisoes++;
          }
        }
      }
    } catch (error) {
      console.error(`   ✗ Erro ao migrar veículo ${v.placa}:`, error.message);
    }
  }

  console.log(`✅ ${veiculoMap.size} veículos migrados!`);
  console.log(`   → ${totalAbastecimentos} abastecimentos`);
  console.log(`   → ${totalManutencoes} manutenções`);
  console.log(`   → ${totalTrocasPneus} trocas de pneus`);
  console.log(`   → ${totalTrocasOleo} trocas de óleo`);
  console.log(`   → ${totalRevisoes} revisões\n`);

  return veiculoMap;
}

async function migrateViagens(viagens, motoristaMap, veiculoMap) {
  console.log('🚀 Migrando viagens...');

  let count = 0;

  for (const v of viagens) {
    try {
      const motoristaId = motoristaMap.get(v.motoristaId);
      const veiculoId = veiculoMap.get(v.veiculoId);

      if (!motoristaId || !veiculoId) {
        console.log(`   ⚠️ Viagem ${v.id} ignorada (motorista ou veículo não encontrado)`);
        continue;
      }

      await prisma.viagem.create({
        data: {
          motoristaId,
          veiculoId,
          dataHoraSaida: v.dataHoraSaida,
          dataHoraChegada: v.dataHoraChegada,
          data: v.data,
          horarioSaida: v.horarioSaida,
          horarioChegada: v.horarioChegada,
          kmSaida: v.kmSaida,
          kmChegada: v.kmChegada,
          kmPercorridos: v.kmPercorridos
        }
      });

      count++;
    } catch (error) {
      console.error(`   ✗ Erro ao migrar viagem ${v.id}:`, error.message);
    }
  }

  console.log(`✅ ${count} viagens migradas!\n`);
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   MIGRAÇÃO JSON → PostgreSQL + Prisma     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    await createBackup();

    const { frota, motoristas, viagens } = await loadJsonData();

    console.log('🔄 Iniciando migração para PostgreSQL...\n');

    const motoristaMap = await migrateMotoristas(motoristas);
    const veiculoMap = await migrateVeiculos(frota, motoristaMap);
    await migrateViagens(viagens, motoristaMap, veiculoMap);

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║        MIGRAÇÃO CONCLUÍDA COM SUCESSO!    ║');
    console.log('╚════════════════════════════════════════════╝\n');

    console.log('📊 Resumo:');
    console.log(`   → ${motoristaMap.size} motoristas`);
    console.log(`   → ${veiculoMap.size} veículos`);
    console.log(`   → Todos os registros associados\n`);

    console.log('💡 Próximos passos:');
    console.log('   1. Verifique os dados no Prisma Studio: npx prisma studio');
    console.log('   2. Teste a API: npm start');
    console.log('   3. Os backups estão em: data/backup/\n');

  } catch (error) {
    console.error('\n❌ ERRO durante a migração:', error);
    console.error('\n💡 Os dados não foram alterados. Corrija o erro e tente novamente.\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
