class BotAnalise {
  constructor(frota) {
    this.frota = frota;
  }

  analisarVeiculo(veiculoId) {
    const veiculo = this.frota.buscarVeiculo(veiculoId);
    if (!veiculo) {
      return { error: 'Veículo não encontrado!' };
    }

    const consumoMedio = veiculo.calcularConsumoMedio();
    const custoPorKm = veiculo.calcularCustoPorKm();
    const proximaManutencao = veiculo.obterProximaManutencao();

    return {
      veiculo: {
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        placa: veiculo.placa,
        ano: veiculo.ano,
        kmAtual: veiculo.kmAtual
      },
      consumoMedio,
      custoPorKm,
      proximaManutencao,
      abastecimentos: veiculo.registros.abastecimentos.length,
      manutencoes: veiculo.registros.manutencoes.length,
      trocasPneus: veiculo.registros.trocaPneus.length
    };
  }

  analisarFrota() {
    const stats = this.frota.obterEstatisticasGerais();
    return stats;
  }

  compararVeiculos(veiculoId1, veiculoId2) {
    const v1 = this.frota.buscarVeiculo(veiculoId1);
    const v2 = this.frota.buscarVeiculo(veiculoId2);

    if (!v1 || !v2) {
      return { error: 'Um ou ambos os veículos não foram encontrados!' };
    }

    const consumo1 = v1.calcularConsumoMedio();
    const consumo2 = v2.calcularConsumoMedio();
    const custo1 = v1.calcularCustoPorKm();
    const custo2 = v2.calcularCustoPorKm();

    return {
      veiculo1: {
        placa: v1.placa,
        marca: v1.marca,
        modelo: v1.modelo,
        consumo: consumo1,
        custo: custo1
      },
      veiculo2: {
        placa: v2.placa,
        marca: v2.marca,
        modelo: v2.modelo,
        consumo: consumo2,
        custo: custo2
      }
    };
  }
}

module.exports = BotAnalise;
