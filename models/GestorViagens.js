const prisma = require('../lib/prisma');

class GestorViagens {
  constructor() {
  }



  async adicionarViagem(motoristaId, veiculoId, dataHoraSaida, dataHoraChegada, kmSaida, kmChegada) {
    const viagem = await prisma.viagem.create({
      data: {
        motoristaId,
        veiculoId,
        dataHoraSaida,
        dataHoraChegada,
        data: dataHoraSaida.split('T')[0],
        horarioSaida: dataHoraSaida.split('T')[1],
        horarioChegada: dataHoraChegada.split('T')[1],
        kmSaida,
        kmChegada,
        kmPercorridos: kmChegada - kmSaida
      }
    });
    return viagem;
  }

  async listarViagens() {
    return await prisma.viagem.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async buscarViagem(id) {
    return await prisma.viagem.findUnique({
      where: { id }
    });
  }

  async buscarViagensPorMotorista(motoristaId) {
    return await prisma.viagem.findMany({
      where: { motoristaId },
      orderBy: { data: 'desc' }
    });
  }

  async buscarViagensPorVeiculo(veiculoId) {
    return await prisma.viagem.findMany({
      where: { veiculoId },
      orderBy: { data: 'desc' }
    });
  }

  async atualizarViagem(id, dadosAtualizados) {
    try {
      if (dadosAtualizados.kmSaida !== undefined && dadosAtualizados.kmChegada !== undefined) {
        dadosAtualizados.kmPercorridos = dadosAtualizados.kmChegada - dadosAtualizados.kmSaida;
      }
      
      const viagem = await prisma.viagem.update({
        where: { id },
        data: dadosAtualizados
      });
      return viagem;
    } catch (error) {
      return null;
    }
  }

  async removerViagem(id) {
    try {
      await prisma.viagem.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = GestorViagens;
