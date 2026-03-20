const prisma = require('../lib/prisma');

class GestorMotoristas {
  constructor() {
  }



  async adicionarMotorista(nome, cnh, telefone, email) {
    const motorista = await prisma.motorista.create({
      data: {
        nome,
        cnh,
        telefone: telefone || null,
        email: email || null,
        ativo: true,
        dataCadastro: new Date().toISOString().split('T')[0]
      }
    });
    return motorista;
  }

  async buscarMotorista(id) {
    return await prisma.motorista.findUnique({
      where: { id }
    });
  }

  async buscarMotoristaPorCNH(cnh) {
    return await prisma.motorista.findUnique({
      where: { cnh }
    });
  }

  async listarMotoristas(apenasAtivos = false) {
    const where = apenasAtivos ? { ativo: true } : {};
    return await prisma.motorista.findMany({
      where,
      orderBy: { id: 'asc' }
    });
  }

  async atualizarMotorista(id, dados) {
    try {
      const updateData = {};
      if (dados.nome) updateData.nome = dados.nome;
      if (dados.telefone !== undefined) updateData.telefone = dados.telefone;
      if (dados.email !== undefined) updateData.email = dados.email;
      if (dados.hasOwnProperty('ativo')) updateData.ativo = dados.ativo;

      const motorista = await prisma.motorista.update({
        where: { id },
        data: updateData
      });
      return motorista;
    } catch (error) {
      return null;
    }
  }

  async desativarMotorista(id) {
    return await this.atualizarMotorista(id, { ativo: false });
  }

  async ativarMotorista(id) {
    return await this.atualizarMotorista(id, { ativo: true });
  }
}

module.exports = GestorMotoristas;
