const prisma = require('../lib/prisma');

class Frota {
  constructor() {
  }



  async adicionarVeiculo(marca, modelo, placa, ano, kmAtual) {
    const veiculo = await prisma.veiculo.create({
      data: {
        marca,
        modelo,
        placa,
        ano,
        kmAtual: kmAtual || 0
      }
    });
    
    veiculo.registros = {
      abastecimentos: [],
      trocaPneus: [],
      manutencoes: [],
      trocasOleo: [],
      revisoes: []
    };
    
    return veiculo;
  }

  async buscarVeiculo(id) {
    const veiculo = await prisma.veiculo.findUnique({
      where: { id },
      include: {
        abastecimentos: { orderBy: { data: 'asc' } },
        manutencoes: { orderBy: { data: 'asc' } },
        trocasPneus: { orderBy: { data: 'asc' } },
        trocasOleo: { orderBy: { data: 'asc' } },
        revisoes: { orderBy: { data: 'asc' } }
      }
    });
    
    if (!veiculo) return null;
    
    veiculo.registros = {
      abastecimentos: veiculo.abastecimentos || [],
      trocaPneus: veiculo.trocasPneus || [],
      manutencoes: veiculo.manutencoes || [],
      trocasOleo: veiculo.trocasOleo || [],
      revisoes: veiculo.revisoes || []
    };
    
    delete veiculo.abastecimentos;
    delete veiculo.trocasPneus;
    delete veiculo.manutencoes;
    delete veiculo.trocasOleo;
    delete veiculo.revisoes;
    
    return veiculo;
  }

  async buscarVeiculoPorPlaca(placa) {
    const veiculo = await prisma.veiculo.findUnique({
      where: { placa },
      include: {
        abastecimentos: { orderBy: { data: 'asc' } },
        manutencoes: { orderBy: { data: 'asc' } },
        trocasPneus: { orderBy: { data: 'asc' } },
        trocasOleo: { orderBy: { data: 'asc' } },
        revisoes: { orderBy: { data: 'asc' } }
      }
    });
    
    if (!veiculo) return null;
    
    veiculo.registros = {
      abastecimentos: veiculo.abastecimentos || [],
      trocaPneus: veiculo.trocasPneus || [],
      manutencoes: veiculo.manutencoes || [],
      trocasOleo: veiculo.trocasOleo || [],
      revisoes: veiculo.revisoes || []
    };
    
    delete veiculo.abastecimentos;
    delete veiculo.trocasPneus;
    delete veiculo.manutencoes;
    delete veiculo.trocasOleo;
    delete veiculo.revisoes;
    
    return veiculo;
  }

  async listarVeiculos() {
    const veiculos = await prisma.veiculo.findMany({
      include: {
        abastecimentos: { orderBy: { data: 'asc' } },
        manutencoes: { orderBy: { data: 'asc' } },
        trocasPneus: { orderBy: { data: 'asc' } },
        trocasOleo: { orderBy: { data: 'asc' } },
        revisoes: { orderBy: { data: 'asc' } }
      },
      orderBy: { id: 'asc' }
    });
    
    return veiculos.map(v => {
      v.registros = {
        abastecimentos: v.abastecimentos || [],
        trocaPneus: v.trocasPneus || [],
        manutencoes: v.manutencoes || [],
        trocasOleo: v.trocasOleo || [],
        revisoes: v.revisoes || []
      };
      
      delete v.abastecimentos;
      delete v.trocasPneus;
      delete v.manutencoes;
      delete v.trocasOleo;
      delete v.revisoes;
      
      return v;
    });
  }

  async removerVeiculo(id) {
    try {
      await prisma.veiculo.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async obterEstatisticasGerais() {
    const veiculos = await this.listarVeiculos();
    const totalVeiculos = veiculos.length;
    let totalKm = 0;
    let totalGasto = 0;
    let consumoMedioGeral = 0;
    let veiculosComConsumo = 0;

    veiculos.forEach(veiculo => {
      totalKm += veiculo.kmAtual;
      
      veiculo.registros.abastecimentos.forEach(a => totalGasto += a.valorTotal);
      veiculo.registros.manutencoes.forEach(m => totalGasto += m.valorTotal);
      veiculo.registros.trocaPneus.forEach(p => totalGasto += p.valorTotal);
      if (veiculo.registros.trocasOleo) {
        veiculo.registros.trocasOleo.forEach(o => totalGasto += o.valorTotal);
      }
      if (veiculo.registros.revisoes) {
        veiculo.registros.revisoes.forEach(r => totalGasto += r.valorTotal);
      }

      const abastecimentos = veiculo.registros.abastecimentos;
      if (abastecimentos.length >= 2) {
        let totalKmPercorrido = 0;
        let totalLitros = 0;
        for (let i = 1; i < abastecimentos.length; i++) {
          const kmPercorrido = abastecimentos[i].km - abastecimentos[i - 1].km;
          totalKmPercorrido += kmPercorrido;
          totalLitros += abastecimentos[i].litros;
        }
        const consumo = totalLitros > 0 ? totalKmPercorrido / totalLitros : null;
        if (consumo) {
          consumoMedioGeral += consumo;
          veiculosComConsumo++;
        }
      }
    });

    return {
      totalVeiculos,
      totalKm,
      totalGasto,
      consumoMedioGeral: veiculosComConsumo > 0 ? consumoMedioGeral / veiculosComConsumo : 0,
      custoPorKm: totalKm > 0 ? totalGasto / totalKm : 0
    };
  }
}

module.exports = Frota;
