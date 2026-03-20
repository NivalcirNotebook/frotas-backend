require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const Frota = require('./models/Frota');
const BotAnalise = require('./bot/BotAnalise');
const GestorMotoristas = require('./models/GestorMotoristas');
const GestorViagens = require('./models/GestorViagens');
const GestorUsuarios = require('./models/GestorUsuarios');
const GestorMultas = require('./models/GestorMultas');
const veiculoHelpers = require('./lib/veiculoHelpers');
const prisma = require('./lib/prisma');
const { comparePassword, generateToken } = require('./lib/auth');
const { authenticate, requireAdmin, requireRole } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_padrao';

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

const frota = new Frota();
const bot = new BotAnalise(frota);
const gestorMotoristas = new GestorMotoristas();
const gestorViagens = new GestorViagens();
const gestorUsuarios = new GestorUsuarios();
const gestorMultas = new GestorMultas();

// Rota de login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const usuario = await gestorUsuarios.buscarPorUsername(username);
    
    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário ou senha inválidos' 
      });
    }
    
    if (!usuario.ativo) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário desativado' 
      });
    }
    
    const senhaValida = await comparePassword(password, usuario.password);
    
    if (!senhaValida) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário ou senha inválidos' 
      });
    }
    
    const token = generateToken(usuario);
    
    res.json({ 
      success: true, 
      token,
      user: {
        id: usuario.id,
        username: usuario.username,
        nome: usuario.nome,
        role: usuario.role
      },
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor' 
    });
  }
});

// Rotas de Usuários
app.get('/api/usuarios/me', authenticate, async (req, res) => {
  const usuario = await gestorUsuarios.buscarPorId(req.user.id);
  if (!usuario) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  res.json(usuario);
});

app.get('/api/usuarios', authenticate, requireAdmin, async (req, res) => {
  const apenasAtivos = req.query.ativos === 'true';
  const usuarios = await gestorUsuarios.listarUsuarios(apenasAtivos);
  res.json(usuarios);
});

app.get('/api/usuarios/:id', authenticate, requireAdmin, async (req, res) => {
  const usuario = await gestorUsuarios.buscarPorId(parseInt(req.params.id));
  if (!usuario) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  res.json(usuario);
});

app.post('/api/usuarios', authenticate, requireAdmin, async (req, res) => {
  const { username, password, nome, email, role } = req.body;
  
  if (!username || !password || !nome) {
    return res.status(400).json({ error: 'Username, senha e nome são obrigatórios' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
  }
  
  try {
    const usuarioExistente = await gestorUsuarios.buscarPorUsername(username);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Username já cadastrado' });
    }
    
    const usuario = await gestorUsuarios.criarUsuario(username, password, nome, email, role);
    res.status(201).json(usuario);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.put('/api/usuarios/:id', authenticate, requireAdmin, async (req, res) => {
  const usuario = await gestorUsuarios.atualizarUsuario(parseInt(req.params.id), req.body);
  if (!usuario) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  res.json(usuario);
});

app.put('/api/usuarios/:id/senha', authenticate, requireAdmin, async (req, res) => {
  const { novaSenha } = req.body;
  
  if (!novaSenha || novaSenha.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
  }
  
  const sucesso = await gestorUsuarios.alterarSenha(parseInt(req.params.id), novaSenha);
  if (!sucesso) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  res.json({ message: 'Senha alterada com sucesso' });
});

app.delete('/api/usuarios/:id', authenticate, requireAdmin, async (req, res) => {
  const usuario = await gestorUsuarios.desativarUsuario(parseInt(req.params.id));
  if (!usuario) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  res.json({ message: 'Usuário desativado com sucesso', usuario });
});

app.put('/api/usuarios/:id/ativar', authenticate, requireAdmin, async (req, res) => {
  const usuario = await gestorUsuarios.ativarUsuario(parseInt(req.params.id));
  if (!usuario) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  res.json({ message: 'Usuário ativado com sucesso', usuario });
});

app.get('/api/veiculos', authenticate, async (req, res) => {
  const veiculos = await frota.listarVeiculos();
  res.json(veiculos);
});

app.get('/api/veiculos/:id', authenticate, async (req, res) => {
  const veiculo = await frota.buscarVeiculo(parseInt(req.params.id));
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  res.json(veiculo);
});

app.post('/api/veiculos', authenticate, requireAdmin, async (req, res) => {
  const { marca, modelo, placa, ano, kmAtual } = req.body;
  
  if (!marca || !modelo || !placa || !ano) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  
  const veiculo = await frota.adicionarVeiculo(marca, modelo, placa, ano, kmAtual || 0);
  res.status(201).json(veiculo);
});

app.delete('/api/veiculos/:id', authenticate, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`📋 Tentando excluir veículo ID: ${id}`);
  
  const sucesso = await frota.removerVeiculo(id);
  
  if (sucesso) {
    console.log(`✅ Veículo ${id} excluído com sucesso`);
    res.json({ message: 'Veículo excluído com sucesso' });
  } else {
    console.log(`❌ Veículo ${id} não encontrado`);
    res.status(404).json({ error: 'Veículo não encontrado' });
  }
});

app.post('/api/veiculos/:id/abastecimento', authenticate, async (req, res) => {
  const veiculo = await frota.buscarVeiculo(parseInt(req.params.id));
  
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  const { data, km, litros, valorTotal, motoristaId } = req.body;
  
  if (!data || !km || !litros || !valorTotal || !motoristaId) {
    return res.status(400).json({ error: 'Dados incompletos. Motorista é obrigatório.' });
  }
  
  await veiculoHelpers.adicionarAbastecimento(
    veiculo.id,
    data, 
    parseInt(km), 
    parseFloat(litros), 
    parseFloat(valorTotal),
    motoristaId ? parseInt(motoristaId) : null
  );
  
  const veiculoAtualizado = await frota.buscarVeiculo(veiculo.id);
  res.json({ message: 'Abastecimento registrado com sucesso', veiculo: veiculoAtualizado });
});

app.delete('/api/veiculos/:id/abastecimento/:index', authenticate, requireAdmin, async (req, res) => {
  const veiculo = await frota.buscarVeiculo(parseInt(req.params.id));
  
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  const index = parseInt(req.params.index);
  
  if (index < 0 || index >= veiculo.registros.abastecimentos.length) {
    return res.status(404).json({ error: 'Abastecimento não encontrado' });
  }
  
  const abastecimentoId = veiculo.registros.abastecimentos[index].id;
  await veiculoHelpers.removerAbastecimento(abastecimentoId);
  
  res.json({ message: 'Abastecimento excluído com sucesso' });
});

app.post('/api/veiculos/:id/pneus', authenticate, async (req, res) => {
  const veiculo = await frota.buscarVeiculo(parseInt(req.params.id));
  
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  const { data, km, eixo, posicao, quantidade, valorTotal, tipo, motoristaId } = req.body;
  
  if (!data || !km || !quantidade || !valorTotal || !tipo || !motoristaId) {
    return res.status(400).json({ error: 'Dados incompletos. Motorista é obrigatório.' });
  }
  
  await veiculoHelpers.adicionarTrocaPneu(
    veiculo.id,
    data,
    parseInt(km),
    eixo || '',
    posicao || '',
    parseInt(quantidade),
    parseFloat(valorTotal),
    tipo,
    motoristaId ? parseInt(motoristaId) : null
  );
  
  const veiculoAtualizado = await frota.buscarVeiculo(veiculo.id);
  res.json({ message: 'Troca de pneus registrada com sucesso', veiculo: veiculoAtualizado });
});

app.post('/api/veiculos/:id/manutencao', authenticate, async (req, res) => {
  const veiculo = await frota.buscarVeiculo(parseInt(req.params.id));
  
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  const { data, km, tipo, descricao, valorTotal, motoristaId } = req.body;
  
  if (!data || !km || !tipo || !descricao || !valorTotal || !motoristaId) {
    return res.status(400).json({ error: 'Dados incompletos. Motorista é obrigatório.' });
  }
  
  await veiculoHelpers.adicionarManutencao(
    veiculo.id,
    data, 
    parseInt(km), 
    tipo, 
    descricao, 
    parseFloat(valorTotal),
    motoristaId ? parseInt(motoristaId) : null
  );
  
  const veiculoAtualizado = await frota.buscarVeiculo(veiculo.id);
  res.json({ message: 'Manutenção registrada com sucesso', veiculo: veiculoAtualizado });
});

app.delete('/api/veiculos/:id/manutencao/:index', authenticate, requireAdmin, async (req, res) => {
  const veiculo = await frota.buscarVeiculo(parseInt(req.params.id));
  
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  const index = parseInt(req.params.index);
  
  if (index < 0 || index >= veiculo.registros.manutencoes.length) {
    return res.status(404).json({ error: 'Manutenção não encontrada' });
  }
  
  const manutencaoId = veiculo.registros.manutencoes[index].id;
  await veiculoHelpers.removerManutencao(manutencaoId);
  
  res.json({ message: 'Manutenção excluída com sucesso' });
});

app.delete('/api/veiculos/:id/pneus/:index', authenticate, requireAdmin, async (req, res) => {
  const veiculo = await frota.buscarVeiculo(parseInt(req.params.id));
  
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  const index = parseInt(req.params.index);
  
  if (index < 0 || index >= veiculo.registros.trocaPneus.length) {
    return res.status(404).json({ error: 'Troca de pneus não encontrada' });
  }
  
  const trocaPneuId = veiculo.registros.trocaPneus[index].id;
  await veiculoHelpers.removerTrocaPneu(trocaPneuId);
  
  res.json({ message: 'Troca de pneus excluída com sucesso' });
});

app.post('/api/veiculos/:id/troca-oleo', authenticate, async (req, res) => {
  const veiculo = await frota.buscarVeiculo(parseInt(req.params.id));
  
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  const { data, km, tipoOleo, quantidade, filtroOleo, filtroAr, filtroCombustivel, valorTotal, observacoes, motoristaId } = req.body;
  
  if (!data || !km || !tipoOleo || !quantidade || !valorTotal || !motoristaId) {
    return res.status(400).json({ error: 'Dados incompletos. Todos os campos obrigatórios devem ser preenchidos.' });
  }
  
  await veiculoHelpers.adicionarTrocaOleo(
    veiculo.id,
    data,
    parseInt(km),
    tipoOleo,
    parseFloat(quantidade),
    filtroOleo || false,
    filtroAr || false,
    filtroCombustivel || false,
    parseFloat(valorTotal),
    observacoes || '',
    parseInt(motoristaId)
  );
  
  const veiculoAtualizado = await frota.buscarVeiculo(veiculo.id);
  res.json({ message: 'Troca de óleo registrada com sucesso', veiculo: veiculoAtualizado });
});

app.delete('/api/veiculos/:id/troca-oleo/:index', authenticate, requireAdmin, async (req, res) => {
  const veiculo = await frota.buscarVeiculo(parseInt(req.params.id));
  
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  if (!veiculo.registros.trocasOleo) {
    return res.status(404).json({ error: 'Nenhuma troca de óleo encontrada' });
  }
  
  const index = parseInt(req.params.index);
  
  if (index < 0 || index >= veiculo.registros.trocasOleo.length) {
    return res.status(404).json({ error: 'Troca de óleo não encontrada' });
  }
  
  const trocaOleoId = veiculo.registros.trocasOleo[index].id;
  await veiculoHelpers.removerTrocaOleo(trocaOleoId);
  
  res.json({ message: 'Troca de óleo excluída com sucesso' });
});

app.post('/api/veiculos/:id/revisao', authenticate, async (req, res) => {
  const veiculo = await frota.buscarVeiculo(parseInt(req.params.id));
  
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  const { data, km, tipoRevisao, itensRevisados, observacoes, valorTotal, proximaRevisao, motoristaId } = req.body;
  
  if (!data || !km || !tipoRevisao || !valorTotal || !motoristaId) {
    return res.status(400).json({ error: 'Dados incompletos. Todos os campos obrigatórios devem ser preenchidos.' });
  }
  
  await veiculoHelpers.adicionarRevisao(
    veiculo.id,
    data,
    parseInt(km),
    tipoRevisao,
    itensRevisados || {},
    observacoes || '',
    parseFloat(valorTotal),
    proximaRevisao ? parseInt(proximaRevisao) : null,
    parseInt(motoristaId)
  );
  
  const veiculoAtualizado = await frota.buscarVeiculo(veiculo.id);
  res.json({ message: 'Revisão registrada com sucesso', veiculo: veiculoAtualizado });
});

app.delete('/api/veiculos/:id/revisao/:index', authenticate, requireAdmin, async (req, res) => {
  const veiculo = await frota.buscarVeiculo(parseInt(req.params.id));
  
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  if (!veiculo.registros.revisoes) {
    return res.status(404).json({ error: 'Nenhuma revisão encontrada' });
  }
  
  const index = parseInt(req.params.index);
  
  if (index < 0 || index >= veiculo.registros.revisoes.length) {
    return res.status(404).json({ error: 'Revisão não encontrada' });
  }
  
  const revisaoId = veiculo.registros.revisoes[index].id;
  await veiculoHelpers.removerRevisao(revisaoId);
  
  res.json({ message: 'Revisão excluída com sucesso' });
});

app.get('/api/analise/veiculo/:id', authenticate, requireAdmin, async (req, res) => {
  const veiculoId = parseInt(req.params.id);
  const veiculo = await frota.buscarVeiculo(veiculoId);
  
  if (!veiculo) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }
  
  console.log(`\n📊 ANÁLISE - ${veiculo.marca} ${veiculo.modelo}`);
  
  // Buscar viagens do veículo
  const todasViagens = await gestorViagens.listarViagens();
  const viagens = todasViagens.filter(v => v.veiculoId === veiculoId);
  console.log(`   Viagens: ${viagens.length}`);
  console.log(`   Abastecimentos: ${veiculo.registros.abastecimentos.length}`);
  console.log(`   Manutenções: ${veiculo.registros.manutencoes.length}`);
  console.log(`   Pneus: ${veiculo.registros.trocaPneus.length}`);
  console.log(`   Trocas de Óleo: ${veiculo.registros.trocasOleo?.length || 0}`);
  console.log(`   Revisões: ${veiculo.registros.revisoes?.length || 0}`);
  
  // Calcular KM rodados: somar viagens + diferença de KM dos abastecimentos
  let kmRodados = 0;
  let kmViagens = 0;
  let kmAbastecimentos = 0;
  
  // Somar KM das viagens
  if (viagens.length > 0) {
    kmViagens = viagens.reduce((total, v) => total + (v.kmPercorridos || 0), 0);
    console.log(`   ✅ KM de viagens: ${kmViagens}`);
  }
  
  // Somar diferença de KM dos abastecimentos
  if (veiculo.registros.abastecimentos.length > 0) {
    const kms = veiculo.registros.abastecimentos.map(a => a.km);
    const kmMin = Math.min(...kms);
    const kmMax = Math.max(...kms);
    kmAbastecimentos = kmMax - kmMin;
    console.log(`   ✅ KM de abastecimentos: ${kmMin} → ${kmMax} = ${kmAbastecimentos} km`);
  }
  
  // Total de KM rodados
  kmRodados = kmViagens + kmAbastecimentos;
  console.log(`   ✅ TOTAL KM Rodados: ${kmRodados} km (Viagens: ${kmViagens} + Abastecimentos: ${kmAbastecimentos})`);
  
  if (kmRodados === 0) {
    console.log(`   ⚠️ Sem dados para calcular KM`);
  }
  
  // Calcular consumo médio
  let consumoMedio = null;
  const totalLitros = veiculo.registros.abastecimentos.reduce((sum, a) => sum + a.litros, 0);
  console.log(`   Total de litros: ${totalLitros}`);
  
  if (totalLitros > 0 && kmRodados > 0) {
    consumoMedio = kmRodados / totalLitros;
    console.log(`   ✅ Consumo médio: ${consumoMedio.toFixed(2)} km/l (${kmRodados} km ÷ ${totalLitros} litros)`);
  } else {
    console.log(`   ⚠️ Não foi possível calcular consumo (KM: ${kmRodados}, Litros: ${totalLitros})`);
  }
  
  // Calcular custo por KM
  let custoPorKm = null;
  const totalCombustivel = veiculo.registros.abastecimentos.reduce((sum, a) => sum + a.valorTotal, 0);
  const totalManutencao = veiculo.registros.manutencoes.reduce((sum, m) => sum + m.valorTotal, 0);
  const totalPneus = veiculo.registros.trocaPneus.reduce((sum, p) => sum + p.valorTotal, 0);
  const totalOleo = (veiculo.registros.trocasOleo || []).reduce((sum, o) => sum + o.valorTotal, 0);
  const totalRevisoes = (veiculo.registros.revisoes || []).reduce((sum, r) => sum + r.valorTotal, 0);
  const custoTotal = totalCombustivel + totalManutencao + totalPneus + totalOleo + totalRevisoes;
  
  console.log(`   Custo total: R$ ${custoTotal.toFixed(2)} (Comb: ${totalCombustivel}, Manut: ${totalManutencao}, Pneus: ${totalPneus}, Óleo: ${totalOleo}, Revisões: ${totalRevisoes})`);
  
  if (kmRodados > 0) {
    custoPorKm = custoTotal / kmRodados;
    console.log(`   ✅ Custo Total por KM: R$ ${custoPorKm.toFixed(2)} (${custoTotal} ÷ ${kmRodados})`);
  } else {
    console.log(`   ⚠️ Não foi possível calcular custo/km (KM rodados = 0)`);
  }
  
  // Calcular custo por KM apenas de combustível
  let custoPorKmCombustivel = null;
  if (kmRodados > 0 && totalCombustivel > 0) {
    custoPorKmCombustivel = totalCombustivel / kmRodados;
    console.log(`   ✅ Custo/KM Combustível: R$ ${custoPorKmCombustivel.toFixed(2)} (${totalCombustivel} ÷ ${kmRodados})`);
  }
  
  const proximaManutencao = await veiculoHelpers.obterProximaManutencao(veiculoId);
  
  res.json({
    veiculo: {
      id: veiculo.id,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      placa: veiculo.placa,
      ano: veiculo.ano,
      kmAtual: veiculo.kmAtual
    },
    metricas: {
      consumoMedio,
      custoPorKm,
      custoPorKmCombustivel,
      proximaManutencao,
      kmRodados,
      totalLitros,
      gastoCombustivel: totalCombustivel,
      totalGasto: custoTotal
    },
    registros: {
      ...veiculo.registros,
      viagens
    }
  });
});

app.get('/api/analise/frota', authenticate, requireAdmin, async (req, res) => {
  const stats = await frota.obterEstatisticasGerais();
  res.json(stats);
});

app.get('/api/motoristas', authenticate, requireAdmin, async (req, res) => {
  const apenasAtivos = req.query.ativos === 'true';
  const motoristas = await gestorMotoristas.listarMotoristas(apenasAtivos);
  res.json(motoristas);
});

app.get('/api/motoristas/:id', authenticate, requireAdmin, async (req, res) => {
  const motorista = await gestorMotoristas.buscarMotorista(parseInt(req.params.id));
  if (!motorista) {
    return res.status(404).json({ error: 'Motorista não encontrado' });
  }
  res.json(motorista);
});

app.post('/api/motoristas', authenticate, requireAdmin, async (req, res) => {
  const { nome, cnh, telefone, email } = req.body;
  
  if (!nome || !cnh) {
    return res.status(400).json({ error: 'Nome e CNH são obrigatórios' });
  }
  
  const cnhExistente = await gestorMotoristas.buscarMotoristaPorCNH(cnh);
  if (cnhExistente) {
    return res.status(400).json({ error: 'CNH já cadastrada' });
  }
  
  const motorista = await gestorMotoristas.adicionarMotorista(nome, cnh, telefone, email);
  res.status(201).json(motorista);
});

app.put('/api/motoristas/:id', authenticate, requireAdmin, async (req, res) => {
  const motorista = await gestorMotoristas.atualizarMotorista(parseInt(req.params.id), req.body);
  if (!motorista) {
    return res.status(404).json({ error: 'Motorista não encontrado' });
  }
  res.json(motorista);
});

app.delete('/api/motoristas/:id', authenticate, requireAdmin, async (req, res) => {
  const motorista = await gestorMotoristas.desativarMotorista(parseInt(req.params.id));
  if (!motorista) {
    return res.status(404).json({ error: 'Motorista não encontrado' });
  }
  res.json({ message: 'Motorista desativado com sucesso', motorista });
});

// Rota para análise de performance por motorista
app.get('/api/analise/motorista/:id', authenticate, requireAdmin, async (req, res) => {
  const motoristaId = parseInt(req.params.id);
  const motorista = await gestorMotoristas.buscarMotorista(motoristaId);
  
  if (!motorista) {
    return res.status(404).json({ error: 'Motorista não encontrado' });
  }

  const veiculos = await frota.listarVeiculos();
  const viagens = await gestorViagens.listarViagens();
  const veiculosUsados = [];
  let totalAbastecimentos = 0;
  let totalLitros = 0;
  let totalKmRodados = 0;
  let totalGastoAbastecimento = 0;
  let totalGastoManutencao = 0;
  let totalGastoPneus = 0;
  let totalManutencoes = 0;
  let totalTrocasPneus = 0;

  // Primeiro, calcular KM das viagens
  const viagensMotorista = viagens.filter(v => v.motoristaId === motoristaId);
  const kmViagens = viagensMotorista.reduce((total, v) => total + (v.kmPercorridos || 0), 0);

  veiculos.forEach(veiculo => {
    const abastecimentos = veiculo.registros.abastecimentos.filter(a => a.motoristaId === motoristaId);
    const manutencoes = veiculo.registros.manutencoes.filter(m => m.motoristaId === motoristaId);
    const trocasPneus = veiculo.registros.trocaPneus.filter(p => p.motoristaId === motoristaId);
    const viagensVeiculo = viagensMotorista.filter(v => v.veiculoId === veiculo.id);

    console.log(`\n🔍 Veículo ${veiculo.marca} ${veiculo.modelo}:`);
    console.log(`   Abastecimentos: ${abastecimentos.length}, Manutenções: ${manutencoes.length}, Pneus: ${trocasPneus.length}, Viagens: ${viagensVeiculo.length}`);

    if (abastecimentos.length > 0 || manutencoes.length > 0 || trocasPneus.length > 0 || viagensVeiculo.length > 0) {
      let kmInicial = null;
      let kmFinal = null;
      let litrosTotais = 0;
      let gastoAbastecimento = 0;
      let gastoManutencao = 0;
      let gastoPneus = 0;

      abastecimentos.forEach(a => {
        if (kmInicial === null || a.km < kmInicial) kmInicial = a.km;
        if (kmFinal === null || a.km > kmFinal) kmFinal = a.km;
        litrosTotais += a.litros;
        gastoAbastecimento += a.valorTotal;
      });

      manutencoes.forEach(m => {
        if (kmInicial === null || m.km < kmInicial) kmInicial = m.km;
        if (kmFinal === null || m.km > kmFinal) kmFinal = m.km;
        gastoManutencao += m.valorTotal;
      });

      trocasPneus.forEach(p => {
        if (kmInicial === null || p.km < kmInicial) kmInicial = p.km;
        if (kmFinal === null || p.km > kmFinal) kmFinal = p.km;
        gastoPneus += p.valorTotal;
      });

      // Calcular KM rodados: somar viagens + diferença de KM dos registros
      let kmRodados = 0;
      let kmViagensVeiculo = 0;
      let kmRegistros = 0;
      
      // Somar KM das viagens
      if (viagensVeiculo.length > 0) {
        kmViagensVeiculo = viagensVeiculo.reduce((total, v) => total + (v.kmPercorridos || 0), 0);
        console.log(`   ✅ KM de viagens: ${kmViagensVeiculo}`);
      }
      
      // Somar diferença de KM dos registros
      if (kmInicial !== null && kmFinal !== null && kmFinal > kmInicial) {
        kmRegistros = kmFinal - kmInicial;
        console.log(`   ✅ KM de registros: ${kmInicial} → ${kmFinal} = ${kmRegistros} km`);
      }
      
      // Total de KM rodados
      kmRodados = kmViagensVeiculo + kmRegistros;
      console.log(`   ✅ TOTAL KM: ${kmRodados} km (Viagens: ${kmViagensVeiculo} + Registros: ${kmRegistros})`);
      
      if (kmRodados === 0) {
        console.log(`   ⚠️ Não foi possível calcular KM (inicial: ${kmInicial}, final: ${kmFinal})`);
      }

      const consumoMedio = litrosTotais > 0 && kmRodados > 0 ? kmRodados / litrosTotais : null;

      veiculosUsados.push({
        id: veiculo.id,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        placa: veiculo.placa,
        abastecimentos: abastecimentos.length,
        manutencoes: manutencoes.length,
        trocasPneus: trocasPneus.length,
        viagens: viagensVeiculo.length,
        kmRodados,
        litros: litrosTotais,
        consumoMedio,
        gastoAbastecimento,
        gastoManutencao,
        gastoPneus,
        gastoTotal: gastoAbastecimento + gastoManutencao + gastoPneus
      });

      totalAbastecimentos += abastecimentos.length;
      totalManutencoes += manutencoes.length;
      totalTrocasPneus += trocasPneus.length;
      totalLitros += litrosTotais;
      totalKmRodados += kmRodados;
      totalGastoAbastecimento += gastoAbastecimento;
      totalGastoManutencao += gastoManutencao;
      totalGastoPneus += gastoPneus;
    }
  });

  const consumoMedioGeral = totalLitros > 0 && totalKmRodados > 0 ? totalKmRodados / totalLitros : 0;
  const totalGasto = totalGastoAbastecimento + totalGastoManutencao + totalGastoPneus;
  const custoPorKm = totalKmRodados > 0 ? totalGasto / totalKmRodados : 0;

  res.json({
    motorista: {
      id: motorista.id,
      nome: motorista.nome,
      cnh: motorista.cnh
    },
    resumo: {
      veiculosUsados: veiculosUsados.length,
      totalAbastecimentos,
      totalManutencoes,
      totalTrocasPneus,
      totalViagens: viagensMotorista.length,
      totalKmRodados,
      totalLitros,
      consumoMedioGeral,
      totalGasto,
      custoPorKm
    },
    veiculos: veiculosUsados
  });
});

// Rotas de Viagens
app.get('/api/viagens', authenticate, async (req, res) => {
  const viagens = await gestorViagens.listarViagens();
  res.json(viagens);
});

app.get('/api/viagens/:id', authenticate, async (req, res) => {
  const viagem = await gestorViagens.buscarViagem(parseInt(req.params.id));
  if (!viagem) {
    return res.status(404).json({ error: 'Viagem não encontrada' });
  }
  res.json(viagem);
});

app.post('/api/viagens', authenticate, async (req, res) => {
  const { motoristaId, veiculoId, dataHoraSaida, dataHoraChegada, kmSaida, kmChegada } = req.body;
  
  if (!motoristaId || !veiculoId || !dataHoraSaida || !dataHoraChegada || kmSaida === undefined || kmChegada === undefined) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  if (kmChegada < kmSaida) {
    return res.status(400).json({ error: 'Quilometragem de chegada deve ser maior que a de saída' });
  }

  const viagem = await gestorViagens.adicionarViagem(
    parseInt(motoristaId),
    parseInt(veiculoId),
    dataHoraSaida,
    dataHoraChegada,
    parseFloat(kmSaida),
    parseFloat(kmChegada)
  );
  
  res.status(201).json(viagem);
});

app.put('/api/viagens/:id', authenticate, requireAdmin, async (req, res) => {
  const viagem = await gestorViagens.atualizarViagem(parseInt(req.params.id), req.body);
  if (!viagem) {
    return res.status(404).json({ error: 'Viagem não encontrada' });
  }
  res.json(viagem);
});

app.delete('/api/viagens/:id', authenticate, requireAdmin, async (req, res) => {
  const sucesso = await gestorViagens.removerViagem(parseInt(req.params.id));
  if (sucesso) {
    res.json({ message: 'Viagem excluída com sucesso' });
  } else {
    res.status(404).json({ error: 'Viagem não encontrada' });
  }
});

app.get('/api/multas', authenticate, async (req, res) => {
  try {
    const filtros = {
      veiculoId: req.query.veiculoId,
      motoristaId: req.query.motoristaId,
      status: req.query.status,
      dataInicio: req.query.dataInicio,
      dataFim: req.query.dataFim
    };
    const multas = await gestorMultas.listarMultas(filtros);
    res.json(multas);
  } catch (error) {
    console.error('Erro ao listar multas:', error);
    res.status(500).json({ error: 'Erro ao listar multas' });
  }
});

app.get('/api/multas/sugerir-motorista/:veiculoId', authenticate, async (req, res) => {
  try {
    const veiculoId = parseInt(req.params.veiculoId);
    const dataInfracao = req.query.dataInfracao;
    
    if (!dataInfracao) {
      return res.status(400).json({ error: 'Data da infração é obrigatória' });
    }
    
    const motoristaId = await gestorMultas.sugerirMotorista(veiculoId, dataInfracao);
    
    if (motoristaId) {
      const motorista = await gestorMotoristas.buscarMotorista(motoristaId);
      res.json({ 
        success: true, 
        motoristaId, 
        motorista: motorista ? { id: motorista.id, nome: motorista.nome, cnh: motorista.cnh } : null
      });
    } else {
      res.json({ success: false, motoristaId: null, motorista: null });
    }
  } catch (error) {
    console.error('Erro ao sugerir motorista:', error);
    res.status(500).json({ error: 'Erro ao sugerir motorista' });
  }
});

app.get('/api/multas/veiculo/:veiculoId', authenticate, async (req, res) => {
  try {
    const multas = await gestorMultas.buscarMultasPorVeiculo(parseInt(req.params.veiculoId));
    res.json(multas);
  } catch (error) {
    console.error('Erro ao buscar multas do veículo:', error);
    res.status(500).json({ error: 'Erro ao buscar multas' });
  }
});

app.get('/api/multas/motorista/:motoristaId', authenticate, async (req, res) => {
  try {
    const multas = await gestorMultas.buscarMultasPorMotorista(parseInt(req.params.motoristaId));
    res.json(multas);
  } catch (error) {
    console.error('Erro ao buscar multas do motorista:', error);
    res.status(500).json({ error: 'Erro ao buscar multas' });
  }
});

app.get('/api/multas/:id', authenticate, async (req, res) => {
  try {
    const multa = await gestorMultas.buscarMulta(parseInt(req.params.id));
    if (!multa) {
      return res.status(404).json({ error: 'Multa não encontrada' });
    }
    res.json(multa);
  } catch (error) {
    console.error('Erro ao buscar multa:', error);
    res.status(500).json({ error: 'Erro ao buscar multa' });
  }
});

app.post('/api/multas', authenticate, async (req, res) => {
  try {
    const { 
      veiculoId, motoristaId, dataInfracao, tipoMulta, descricao, 
      valorMulta, pontosCNH, numeroAuto, local, dataVencimento, observacoes 
    } = req.body;
    
    if (!veiculoId || !dataInfracao || !tipoMulta || !descricao || !valorMulta || !numeroAuto || !local || !dataVencimento) {
      return res.status(400).json({ error: 'Dados incompletos. Verifique todos os campos obrigatórios.' });
    }
    
    const multa = await gestorMultas.adicionarMulta(
      parseInt(veiculoId),
      motoristaId ? parseInt(motoristaId) : null,
      dataInfracao,
      tipoMulta,
      descricao,
      parseFloat(valorMulta),
      parseInt(pontosCNH) || 0,
      numeroAuto,
      local,
      dataVencimento,
      observacoes || ''
    );
    
    res.status(201).json(multa);
  } catch (error) {
    console.error('Erro ao criar multa:', error);
    res.status(500).json({ error: 'Erro ao criar multa' });
  }
});

app.put('/api/multas/:id', authenticate, async (req, res) => {
  try {
    const multa = await gestorMultas.atualizarMulta(parseInt(req.params.id), req.body);
    if (!multa) {
      return res.status(404).json({ error: 'Multa não encontrada' });
    }
    res.json(multa);
  } catch (error) {
    console.error('Erro ao atualizar multa:', error);
    res.status(500).json({ error: 'Erro ao atualizar multa' });
  }
});

app.put('/api/multas/:id/pagar', authenticate, async (req, res) => {
  try {
    const { dataPagamento, valorPago } = req.body;
    
    if (!dataPagamento || !valorPago) {
      return res.status(400).json({ error: 'Data de pagamento e valor pago são obrigatórios' });
    }
    
    const multa = await gestorMultas.marcarComoPaga(
      parseInt(req.params.id),
      dataPagamento,
      parseFloat(valorPago)
    );
    
    if (!multa) {
      return res.status(404).json({ error: 'Multa não encontrada' });
    }
    
    res.json({ message: 'Multa marcada como paga', multa });
  } catch (error) {
    console.error('Erro ao marcar multa como paga:', error);
    res.status(500).json({ error: 'Erro ao marcar multa como paga' });
  }
});

app.delete('/api/multas/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const sucesso = await gestorMultas.removerMulta(parseInt(req.params.id));
    if (sucesso) {
      res.json({ message: 'Multa excluída com sucesso' });
    } else {
      res.status(404).json({ error: 'Multa não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao excluir multa:', error);
    res.status(500).json({ error: 'Erro ao excluir multa' });
  }
});

app.get('/api/analise/multas', authenticate, requireAdmin, async (req, res) => {
  try {
    const estatisticas = await gestorMultas.obterEstatisticasMultas();
    res.json(estatisticas);
  } catch (error) {
    console.error('Erro ao obter estatísticas de multas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

app.get('/api/graficos/dados-consolidados', authenticate, requireAdmin, async (req, res) => {
  const veiculos = await frota.listarVeiculos();
  const motoristas = await gestorMotoristas.listarMotoristas(true);
  const viagens = await gestorViagens.listarViagens();

  const dadosConsolidados = {
    consumoPorVeiculo: [],
    custoPorVeiculo: [],
    kmPorMotorista: [],
    consumoPorMotorista: [],
    viagensPorMes: [],
    gastoPorCategoria: [],
    veiculosMaisUsados: [],
    performanceGeral: {
      totalVeiculos: veiculos.length,
      totalMotoristas: motoristas.length,
      totalViagens: viagens.length,
      kmTotal: 0,
      gastoTotal: 0
    }
  };

  let gastoAbastecimento = 0;
  let gastoManutencao = 0;
  let gastoPneus = 0;
  let gastoOleo = 0;
  let gastoRevisao = 0;

  veiculos.forEach(veiculo => {
    const abastecimentos = veiculo.registros.abastecimentos || [];
    const manutencoes = veiculo.registros.manutencoes || [];
    const trocaPneus = veiculo.registros.trocaPneus || [];
    const trocasOleo = veiculo.registros.trocasOleo || [];
    const revisoes = veiculo.registros.revisoes || [];

    const totalAbast = abastecimentos.reduce((sum, a) => sum + a.valorTotal, 0);
    const totalManut = manutencoes.reduce((sum, m) => sum + m.valorTotal, 0);
    const totalPneus = trocaPneus.reduce((sum, p) => sum + p.valorTotal, 0);
    const totalOleo = trocasOleo.reduce((sum, o) => sum + o.valorTotal, 0);
    const totalRevisao = revisoes.reduce((sum, r) => sum + r.valorTotal, 0);
    const totalCusto = totalAbast + totalManut + totalPneus + totalOleo + totalRevisao;

    gastoAbastecimento += totalAbast;
    gastoManutencao += totalManut;
    gastoPneus += totalPneus;
    gastoOleo += totalOleo;
    gastoRevisao += totalRevisao;

    const totalLitros = abastecimentos.reduce((sum, a) => sum + a.litros, 0);
    let kmRodados = 0;
    if (abastecimentos.length >= 2) {
      const kms = abastecimentos.map(a => a.km).sort((a, b) => a - b);
      kmRodados = kms[kms.length - 1] - kms[0];
    }
    const consumo = totalLitros > 0 ? kmRodados / totalLitros : 0;

    dadosConsolidados.consumoPorVeiculo.push({
      nome: `${veiculo.marca} ${veiculo.modelo}`,
      placa: veiculo.placa,
      consumo: parseFloat(consumo.toFixed(2))
    });

    dadosConsolidados.custoPorVeiculo.push({
      nome: `${veiculo.marca} ${veiculo.modelo}`,
      placa: veiculo.placa,
      custo: parseFloat(totalCusto.toFixed(2))
    });

    dadosConsolidados.veiculosMaisUsados.push({
      nome: `${veiculo.placa}`,
      viagens: viagens.filter(v => v.veiculoId === veiculo.id).length,
      km: veiculo.kmAtual
    });

    dadosConsolidados.performanceGeral.kmTotal += kmRodados;
    dadosConsolidados.performanceGeral.gastoTotal += totalCusto;
  });

  motoristas.forEach(motorista => {
    const viagensMotorista = viagens.filter(v => v.motoristaId === motorista.id);
    const kmTotal = viagensMotorista.reduce((sum, v) => sum + (v.kmPercorridos || 0), 0);
    
    let totalLitros = 0;
    let kmRodadosConsumo = 0;
    veiculos.forEach(veiculo => {
      const abastecimentos = (veiculo.registros.abastecimentos || []).filter(a => a.motoristaId === motorista.id);
      totalLitros += abastecimentos.reduce((sum, a) => sum + a.litros, 0);
      if (abastecimentos.length >= 2) {
        const kms = abastecimentos.map(a => a.km).sort((a, b) => a - b);
        kmRodadosConsumo += kms[kms.length - 1] - kms[0];
      }
    });

    const consumoMedio = totalLitros > 0 ? kmRodadosConsumo / totalLitros : 0;

    dadosConsolidados.kmPorMotorista.push({
      nome: motorista.nome,
      km: kmTotal,
      viagens: viagensMotorista.length
    });

    dadosConsolidados.consumoPorMotorista.push({
      nome: motorista.nome,
      consumo: parseFloat(consumoMedio.toFixed(2))
    });
  });

  const viagensPorMesMap = {};
  viagens.forEach(viagem => {
    const mesAno = viagem.data.substring(0, 7);
    if (!viagensPorMesMap[mesAno]) {
      viagensPorMesMap[mesAno] = { mes: mesAno, quantidade: 0, km: 0 };
    }
    viagensPorMesMap[mesAno].quantidade++;
    viagensPorMesMap[mesAno].km += viagem.kmPercorridos || 0;
  });

  dadosConsolidados.viagensPorMes = Object.values(viagensPorMesMap).sort((a, b) => a.mes.localeCompare(b.mes));

  dadosConsolidados.gastoPorCategoria = [
    { categoria: 'Abastecimento', valor: parseFloat(gastoAbastecimento.toFixed(2)) },
    { categoria: 'Manutenção', valor: parseFloat(gastoManutencao.toFixed(2)) },
    { categoria: 'Pneus', valor: parseFloat(gastoPneus.toFixed(2)) },
    { categoria: 'Óleo', valor: parseFloat(gastoOleo.toFixed(2)) },
    { categoria: 'Revisão', valor: parseFloat(gastoRevisao.toFixed(2)) }
  ].filter(item => item.valor > 0);

  dadosConsolidados.consumoPorVeiculo = dadosConsolidados.consumoPorVeiculo.filter(v => v.consumo > 0);
  dadosConsolidados.consumoPorMotorista = dadosConsolidados.consumoPorMotorista.filter(m => m.consumo > 0);
  dadosConsolidados.veiculosMaisUsados.sort((a, b) => b.viagens - a.viagens).slice(0, 10);

  res.json(dadosConsolidados);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
});
