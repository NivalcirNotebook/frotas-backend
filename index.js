const readlineSync = require('readline-sync');
const chalk = require('chalk');
const Frota = require('./models/Frota');
const BotAnalise = require('./bot/BotAnalise');

const frota = new Frota();
const bot = new BotAnalise(frota);

function exibirMenu() {
  console.clear();
  console.log(chalk.blue.bold('\n╔════════════════════════════════════════════╗'));
  console.log(chalk.blue.bold('║    SISTEMA DE GESTÃO DE FROTAS v1.0       ║'));
  console.log(chalk.blue.bold('╚════════════════════════════════════════════╝\n'));
  
  console.log(chalk.cyan('VEÍCULOS:'));
  console.log('  1. Adicionar veículo');
  console.log('  2. Listar veículos');
  console.log('');
  
  console.log(chalk.cyan('REGISTROS:'));
  console.log('  3. Registrar abastecimento');
  console.log('  4. Registrar troca de pneus');
  console.log('  5. Registrar manutenção');
  console.log('');
  
  console.log(chalk.cyan('ANÁLISES (BOT):'));
  console.log('  6. Analisar veículo específico');
  console.log('  7. Analisar frota completa');
  console.log('  8. Comparar dois veículos');
  console.log('');
  
  console.log(chalk.cyan('OUTROS:'));
  console.log('  0. Sair');
  console.log('');
}

function adicionarVeiculo() {
  console.log(chalk.yellow.bold('\n→ ADICIONAR VEÍCULO\n'));
  
  const marca = readlineSync.question('Marca: ');
  const modelo = readlineSync.question('Modelo: ');
  const placa = readlineSync.question('Placa: ');
  const ano = parseInt(readlineSync.question('Ano: '));
  const kmAtual = parseInt(readlineSync.question('KM atual: '));
  
  const veiculo = frota.adicionarVeiculo(marca, modelo, placa, ano, kmAtual);
  console.log(chalk.green(`\n✓ Veículo adicionado com ID: ${veiculo.id}`));
  readlineSync.question('\nPressione ENTER para continuar...');
}

function listarVeiculos() {
  console.log(chalk.yellow.bold('\n→ LISTA DE VEÍCULOS\n'));
  
  const veiculos = frota.listarVeiculos();
  
  if (veiculos.length === 0) {
    console.log(chalk.gray('Nenhum veículo cadastrado.'));
  } else {
    veiculos.forEach(v => {
      console.log(chalk.white(`ID: ${v.id} | ${v.placa} - ${v.marca} ${v.modelo} (${v.ano})`));
      console.log(chalk.gray(`   KM: ${v.kmAtual.toLocaleString('pt-BR')}`));
      console.log('');
    });
  }
  
  readlineSync.question('Pressione ENTER para continuar...');
}

function registrarAbastecimento() {
  console.log(chalk.yellow.bold('\n→ REGISTRAR ABASTECIMENTO\n'));
  
  const veiculoId = parseInt(readlineSync.question('ID do veículo: '));
  const veiculo = frota.buscarVeiculo(veiculoId);
  
  if (!veiculo) {
    console.log(chalk.red('\n✗ Veículo não encontrado!'));
    readlineSync.question('\nPressione ENTER para continuar...');
    return;
  }
  
  const data = readlineSync.question('Data (DD/MM/AAAA): ');
  const km = parseInt(readlineSync.question('KM no momento: '));
  const litros = parseFloat(readlineSync.question('Litros abastecidos: '));
  const valorTotal = parseFloat(readlineSync.question('Valor total (R$): '));
  
  veiculo.adicionarAbastecimento(data, km, litros, valorTotal);
  frota.salvarDados();
  
  console.log(chalk.green('\n✓ Abastecimento registrado com sucesso!'));
  readlineSync.question('\nPressione ENTER para continuar...');
}

function registrarTrocaPneus() {
  console.log(chalk.yellow.bold('\n→ REGISTRAR TROCA DE PNEUS\n'));
  
  const veiculoId = parseInt(readlineSync.question('ID do veículo: '));
  const veiculo = frota.buscarVeiculo(veiculoId);
  
  if (!veiculo) {
    console.log(chalk.red('\n✗ Veículo não encontrado!'));
    readlineSync.question('\nPressione ENTER para continuar...');
    return;
  }
  
  const data = readlineSync.question('Data (DD/MM/AAAA): ');
  const km = parseInt(readlineSync.question('KM no momento: '));
  const quantidade = parseInt(readlineSync.question('Quantidade de pneus: '));
  const valorTotal = parseFloat(readlineSync.question('Valor total (R$): '));
  const tipo = readlineSync.question('Tipo (ex: Michelin 205/55R16): ');
  
  veiculo.adicionarTrocaPneus(data, km, quantidade, valorTotal, tipo);
  frota.salvarDados();
  
  console.log(chalk.green('\n✓ Troca de pneus registrada com sucesso!'));
  readlineSync.question('\nPressione ENTER para continuar...');
}

function registrarManutencao() {
  console.log(chalk.yellow.bold('\n→ REGISTRAR MANUTENÇÃO\n'));
  
  const veiculoId = parseInt(readlineSync.question('ID do veículo: '));
  const veiculo = frota.buscarVeiculo(veiculoId);
  
  if (!veiculo) {
    console.log(chalk.red('\n✗ Veículo não encontrado!'));
    readlineSync.question('\nPressione ENTER para continuar...');
    return;
  }
  
  const data = readlineSync.question('Data (DD/MM/AAAA): ');
  const km = parseInt(readlineSync.question('KM no momento: '));
  const tipo = readlineSync.question('Tipo (Preventiva/Corretiva): ');
  const descricao = readlineSync.question('Descrição: ');
  const valorTotal = parseFloat(readlineSync.question('Valor total (R$): '));
  
  veiculo.adicionarManutencao(data, km, tipo, descricao, valorTotal);
  frota.salvarDados();
  
  console.log(chalk.green('\n✓ Manutenção registrada com sucesso!'));
  readlineSync.question('\nPressione ENTER para continuar...');
}

function analisarVeiculo() {
  console.log(chalk.yellow.bold('\n→ ANÁLISE DE VEÍCULO\n'));
  
  const veiculoId = parseInt(readlineSync.question('ID do veículo: '));
  const resultado = bot.analisarVeiculo(veiculoId);
  
  console.log(resultado);
  readlineSync.question('\nPressione ENTER para continuar...');
}

function analisarFrota() {
  const resultado = bot.analisarFrota();
  console.log(resultado);
  readlineSync.question('\nPressione ENTER para continuar...');
}

function compararVeiculos() {
  console.log(chalk.yellow.bold('\n→ COMPARAR VEÍCULOS\n'));
  
  const id1 = parseInt(readlineSync.question('ID do primeiro veículo: '));
  const id2 = parseInt(readlineSync.question('ID do segundo veículo: '));
  
  const resultado = bot.compararVeiculos(id1, id2);
  console.log(resultado);
  readlineSync.question('\nPressione ENTER para continuar...');
}

function main() {
  let opcao;
  
  do {
    exibirMenu();
    opcao = readlineSync.question(chalk.green('Escolha uma opção: '));
    
    switch (opcao) {
      case '1':
        adicionarVeiculo();
        break;
      case '2':
        listarVeiculos();
        break;
      case '3':
        registrarAbastecimento();
        break;
      case '4':
        registrarTrocaPneus();
        break;
      case '5':
        registrarManutencao();
        break;
      case '6':
        analisarVeiculo();
        break;
      case '7':
        analisarFrota();
        break;
      case '8':
        compararVeiculos();
        break;
      case '0':
        console.log(chalk.blue('\n👋 Até logo!\n'));
        break;
      default:
        console.log(chalk.red('\n✗ Opção inválida!'));
        readlineSync.question('\nPressione ENTER para continuar...');
    }
  } while (opcao !== '0');
}

main();
