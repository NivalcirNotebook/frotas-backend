class Veiculo {
  constructor(id, marca, modelo, placa, ano, kmAtual = 0) {
    this.id = id;
    this.marca = marca;
    this.modelo = modelo;
    this.placa = placa;
    this.ano = ano;
    this.kmAtual = kmAtual;
    this.registros = {
      abastecimentos: [],
      trocaPneus: [],
      manutencoes: [],
      trocasOleo: [],
      revisoes: []
    };
  }

  adicionarAbastecimento(data, km, litros, valorTotal, motoristaId = null) {
    this.registros.abastecimentos.push({
      data,
      km,
      litros,
      valorTotal,
      valorPorLitro: valorTotal / litros,
      motoristaId
    });
    this.kmAtual = km;
  }

  adicionarTrocaPneus(data, km, quantidade, valorTotal, tipo, motoristaId = null) {
    this.registros.trocaPneus.push({
      data,
      km,
      quantidade,
      valorTotal,
      tipo,
      motoristaId
    });
    this.kmAtual = km;
  }

  adicionarManutencao(data, km, tipo, descricao, valorTotal, motoristaId = null) {
    this.registros.manutencoes.push({
      data,
      km,
      tipo,
      descricao,
      valorTotal,
      motoristaId
    });
    this.kmAtual = km;
  }

  calcularConsumoMedio() {
    const abastecimentos = this.registros.abastecimentos;
    if (abastecimentos.length < 2) return null;

    let totalKm = 0;
    let totalLitros = 0;

    for (let i = 1; i < abastecimentos.length; i++) {
      const kmPercorrido = abastecimentos[i].km - abastecimentos[i - 1].km;
      totalKm += kmPercorrido;
      totalLitros += abastecimentos[i].litros;
    }

    return totalLitros > 0 ? totalKm / totalLitros : null;
  }

  calcularCustoPorKm() {
    const abastecimentos = this.registros.abastecimentos;
    const manutencoes = this.registros.manutencoes;
    const pneus = this.registros.trocaPneus;

    if (abastecimentos.length === 0) return null;

    const totalCombustivel = abastecimentos.reduce((sum, a) => sum + a.valorTotal, 0);
    const totalManutencao = manutencoes.reduce((sum, m) => sum + m.valorTotal, 0);
    const totalPneus = pneus.reduce((sum, p) => sum + p.valorTotal, 0);

    const kmTotal = this.kmAtual - (abastecimentos[0].km || 0);
    const custoTotal = totalCombustivel + totalManutencao + totalPneus;

    return kmTotal > 0 ? custoTotal / kmTotal : null;
  }

  obterProximaManutencao() {
    const ultimaManutencao = this.registros.manutencoes[this.registros.manutencoes.length - 1];
    if (!ultimaManutencao) return { km: 10000, tipo: 'Primeira revisão' };

    const kmDesdeUltima = this.kmAtual - ultimaManutencao.km;
    const kmParaProxima = 10000 - (kmDesdeUltima % 10000);
    
    return {
      km: kmParaProxima,
      tipo: 'Revisão periódica'
    };
  }

  removerAbastecimento(index) {
    if (index >= 0 && index < this.registros.abastecimentos.length) {
      this.registros.abastecimentos.splice(index, 1);
      return true;
    }
    return false;
  }

  removerManutencao(index) {
    if (index >= 0 && index < this.registros.manutencoes.length) {
      this.registros.manutencoes.splice(index, 1);
      return true;
    }
    return false;
  }

  removerTrocaPneus(index) {
    if (index >= 0 && index < this.registros.trocaPneus.length) {
      this.registros.trocaPneus.splice(index, 1);
      return true;
    }
    return false;
  }
}

module.exports = Veiculo;
