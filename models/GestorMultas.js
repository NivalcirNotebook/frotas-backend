const prisma = require('../lib/prisma');

class GestorMultas {
  constructor() {
  }

  async adicionarMulta(veiculoId, motoristaId, dataInfracao, tipoMulta, descricao, valorMulta, pontosCNH, numeroAuto, local, dataVencimento, observacoes = '') {
    const multa = await prisma.multa.create({
      data: {
        veiculoId,
        motoristaId: motoristaId || null,
        dataInfracao,
        tipoMulta,
        descricao,
        valorMulta,
        pontosCNH: pontosCNH || 0,
        numeroAuto,
        local,
        status: 'PENDENTE',
        dataVencimento,
        observacoes: observacoes || ''
      }
    });
    return multa;
  }

  async listarMultas(filtros = {}) {
    const where = {};
    
    if (filtros.veiculoId) {
      where.veiculoId = parseInt(filtros.veiculoId);
    }
    
    if (filtros.motoristaId) {
      where.motoristaId = parseInt(filtros.motoristaId);
    }
    
    if (filtros.status) {
      where.status = filtros.status;
    }
    
    if (filtros.dataInicio && filtros.dataFim) {
      where.dataInfracao = {
        gte: filtros.dataInicio,
        lte: filtros.dataFim
      };
    }

    return await prisma.multa.findMany({
      where,
      orderBy: { dataInfracao: 'desc' }
    });
  }

  async buscarMulta(id) {
    return await prisma.multa.findUnique({
      where: { id }
    });
  }

  async buscarMultasPorVeiculo(veiculoId) {
    return await prisma.multa.findMany({
      where: { veiculoId },
      orderBy: { dataInfracao: 'desc' }
    });
  }

  async buscarMultasPorMotorista(motoristaId) {
    return await prisma.multa.findMany({
      where: { motoristaId },
      orderBy: { dataInfracao: 'desc' }
    });
  }

  async atualizarMulta(id, dadosAtualizados) {
    try {
      const multa = await prisma.multa.update({
        where: { id },
        data: dadosAtualizados
      });
      return multa;
    } catch (error) {
      return null;
    }
  }

  async marcarComoPaga(id, dataPagamento, valorPago) {
    try {
      const multa = await prisma.multa.update({
        where: { id },
        data: {
          status: 'PAGA',
          dataPagamento,
          valorPago
        }
      });
      return multa;
    } catch (error) {
      return null;
    }
  }

  async removerMulta(id) {
    try {
      await prisma.multa.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async obterEstatisticasMultas() {
    const multas = await prisma.multa.findMany();
    
    const totalMultas = multas.length;
    const multasPendentes = multas.filter(m => m.status === 'PENDENTE').length;
    const multasPagas = multas.filter(m => m.status === 'PAGA').length;
    const multasEmRecurso = multas.filter(m => m.status === 'EM_RECURSO').length;
    
    const valorTotalMultas = multas.reduce((sum, m) => sum + m.valorMulta, 0);
    const valorPendente = multas.filter(m => m.status === 'PENDENTE').reduce((sum, m) => sum + m.valorMulta, 0);
    const valorPago = multas.filter(m => m.status === 'PAGA').reduce((sum, m) => sum + (m.valorPago || m.valorMulta), 0);
    
    const totalPontos = multas.reduce((sum, m) => sum + m.pontosCNH, 0);
    
    return {
      totalMultas,
      multasPendentes,
      multasPagas,
      multasEmRecurso,
      valorTotalMultas,
      valorPendente,
      valorPago,
      totalPontos
    };
  }

  async sugerirMotorista(veiculoId, dataInfracao) {
    const dataInfracaoDate = new Date(dataInfracao);
    const umDiaAntes = new Date(dataInfracaoDate);
    umDiaAntes.setDate(umDiaAntes.getDate() - 1);
    const umDiaDepois = new Date(dataInfracaoDate);
    umDiaDepois.setDate(umDiaDepois.getDate() + 1);

    const dataInfracaoStr = dataInfracao.split('T')[0];
    const umDiaAntesStr = umDiaAntes.toISOString().split('T')[0];
    const umDiaDepoisStr = umDiaDepois.toISOString().split('T')[0];

    const viagens = await prisma.viagem.findMany({
      where: {
        veiculoId,
        OR: [
          { data: dataInfracaoStr },
          { data: umDiaAntesStr },
          { data: umDiaDepoisStr }
        ]
      },
      orderBy: { dataHoraSaida: 'desc' }
    });

    if (viagens.length > 0) {
      const viagensPorMotorista = {};
      viagens.forEach(v => {
        if (!viagensPorMotorista[v.motoristaId]) {
          viagensPorMotorista[v.motoristaId] = {
            motoristaId: v.motoristaId,
            quantidade: 0,
            ultimaViagem: v.dataHoraSaida
          };
        }
        viagensPorMotorista[v.motoristaId].quantidade++;
      });

      const motoristaSugerido = Object.values(viagensPorMotorista).sort((a, b) => {
        if (b.quantidade !== a.quantidade) {
          return b.quantidade - a.quantidade;
        }
        return new Date(b.ultimaViagem) - new Date(a.ultimaViagem);
      })[0];

      return motoristaSugerido ? motoristaSugerido.motoristaId : null;
    }

    return null;
  }
}

module.exports = GestorMultas;
