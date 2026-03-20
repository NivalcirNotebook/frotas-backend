const prisma = require('./prisma');

async function adicionarAbastecimento(veiculoId, data, km, litros, valorTotal, motoristaId) {
  const abastecimento = await prisma.abastecimento.create({
    data: {
      veiculoId,
      data,
      km,
      litros,
      valorTotal,
      valorPorLitro: valorTotal / litros,
      motoristaId: motoristaId || null
    }
  });

  await prisma.veiculo.update({
    where: { id: veiculoId },
    data: { kmAtual: km }
  });

  return abastecimento;
}

async function removerAbastecimento(abastecimentoId) {
  await prisma.abastecimento.delete({
    where: { id: abastecimentoId }
  });
}

async function adicionarManutencao(veiculoId, data, km, tipo, descricao, valorTotal, motoristaId) {
  const manutencao = await prisma.manutencao.create({
    data: {
      veiculoId,
      data,
      km,
      tipo,
      descricao,
      valorTotal,
      motoristaId: motoristaId || null
    }
  });

  await prisma.veiculo.update({
    where: { id: veiculoId },
    data: { kmAtual: km }
  });

  return manutencao;
}

async function removerManutencao(manutencaoId) {
  await prisma.manutencao.delete({
    where: { id: manutencaoId }
  });
}

async function adicionarTrocaPneu(veiculoId, data, km, eixo, posicao, quantidade, valorTotal, tipo, motoristaId) {
  const trocaPneu = await prisma.trocaPneu.create({
    data: {
      veiculoId,
      data,
      km,
      eixo: eixo || '',
      posicao: posicao || '',
      quantidade,
      valorTotal,
      tipo,
      motoristaId: motoristaId || null
    }
  });

  await prisma.veiculo.update({
    where: { id: veiculoId },
    data: { kmAtual: km }
  });

  return trocaPneu;
}

async function removerTrocaPneu(trocaPneuId) {
  await prisma.trocaPneu.delete({
    where: { id: trocaPneuId }
  });
}

async function adicionarTrocaOleo(veiculoId, data, km, tipoOleo, quantidade, filtroOleo, filtroAr, filtroCombustivel, valorTotal, observacoes, motoristaId) {
  const trocaOleo = await prisma.trocaOleo.create({
    data: {
      veiculoId,
      data,
      km,
      tipoOleo,
      quantidade,
      filtroOleo: filtroOleo || false,
      filtroAr: filtroAr || false,
      filtroCombustivel: filtroCombustivel || false,
      valorTotal,
      observacoes: observacoes || '',
      motoristaId: motoristaId || null
    }
  });

  await prisma.veiculo.update({
    where: { id: veiculoId },
    data: { kmAtual: km }
  });

  return trocaOleo;
}

async function removerTrocaOleo(trocaOleoId) {
  await prisma.trocaOleo.delete({
    where: { id: trocaOleoId }
  });
}

async function adicionarRevisao(veiculoId, data, km, tipoRevisao, itensRevisados, observacoes, valorTotal, proximaRevisao, motoristaId) {
  const revisao = await prisma.revisao.create({
    data: {
      veiculoId,
      data,
      km,
      tipoRevisao,
      itensRevisados: itensRevisados || {},
      observacoes: observacoes || '',
      valorTotal,
      proximaRevisao: proximaRevisao || null,
      motoristaId: motoristaId || null
    }
  });

  await prisma.veiculo.update({
    where: { id: veiculoId },
    data: { kmAtual: km }
  });

  return revisao;
}

async function removerRevisao(revisaoId) {
  await prisma.revisao.delete({
    where: { id: revisaoId }
  });
}

async function obterProximaManutencao(veiculoId) {
  const veiculo = await prisma.veiculo.findUnique({
    where: { id: veiculoId },
    include: {
      manutencoes: {
        orderBy: { km: 'desc' },
        take: 1
      }
    }
  });

  if (!veiculo) return null;

  const ultimaManutencao = veiculo.manutencoes[0];
  if (!ultimaManutencao) {
    return { km: 10000, tipo: 'Primeira revisão' };
  }

  const kmDesdeUltima = veiculo.kmAtual - ultimaManutencao.km;
  const kmParaProxima = 10000 - (kmDesdeUltima % 10000);

  return {
    km: kmParaProxima,
    tipo: 'Revisão periódica'
  };
}

module.exports = {
  adicionarAbastecimento,
  removerAbastecimento,
  adicionarManutencao,
  removerManutencao,
  adicionarTrocaPneu,
  removerTrocaPneu,
  adicionarTrocaOleo,
  removerTrocaOleo,
  adicionarRevisao,
  removerRevisao,
  obterProximaManutencao
};
