# 🚗 Sistema de Gestão de Frotas

Sistema completo para gerenciamento de frotas de automóveis com bot de análise de performance inteligente.

## 📋 Funcionalidades

### Gestão de Veículos
- ✅ Cadastro de veículos (marca, modelo, placa, ano, km)
- ✅ Listagem completa da frota
- ✅ Busca por ID ou placa

### Registros Operacionais
- ⛽ **Abastecimentos**: litros, valores, km rodado
- 🛞 **Troca de Pneus**: quantidade, tipo, custos
- 🔧 **Manutenções**: preventivas e corretivas

### 🤖 Bot de Análise Inteligente

O bot fornece análises detalhadas sobre:

#### Análise Individual de Veículo
- **Consumo de combustível** (km/l)
- **Custo operacional** por km rodado
- **Próxima manutenção** estimada
- **Estado dos pneus**
- **Recomendações personalizadas**

#### Análise Geral da Frota
- Estatísticas consolidadas
- Consumo médio geral
- Custos totais
- Performance por veículo

#### Comparação entre Veículos
- Comparativo de consumo
- Comparativo de custos
- Identificação do mais econômico

## 🚀 Como Usar

### Instalação

```bash
# As dependências já foram instaladas
npm install
```

### Executar o Sistema

```bash
npm start
```

### Modo Desenvolvimento (auto-reload)

```bash
npm run dev
```

## 📊 Exemplo de Uso

1. **Adicione um veículo**
   - Opção 1 no menu
   - Informe marca, modelo, placa, ano e km atual

2. **Registre abastecimentos**
   - Opção 3 no menu
   - Adicione pelo menos 2 para calcular consumo médio

3. **Analise a performance**
   - Opção 6: Análise individual
   - Opção 7: Análise completa da frota
   - Opção 8: Compare dois veículos

## 📁 Estrutura do Projeto

```
projeto-frotas-automóveis/
├── models/
│   ├── Veiculo.js     # Classe do veículo com cálculos
│   └── Frota.js       # Gerenciamento da frota
├── bot/
│   └── BotAnalise.js  # Bot de análise inteligente
├── data/
│   └── frota.json     # Dados persistidos (criado automaticamente)
├── index.js           # Interface principal
├── package.json       # Dependências
└── README.md          # Este arquivo
```

## 🎯 Métricas Calculadas

### Consumo Médio (km/l)
Calcula a eficiência energética baseada nos abastecimentos registrados.

**Fórmula**: Total de KM percorridos / Total de litros abastecidos

**Classificação**:
- ✅ Excelente: ≥ 12 km/l
- ⚠️ Bom: 10-12 km/l
- ⚠️ Regular: 8-10 km/l
- ❌ Atenção: < 8 km/l

### Custo por KM (R$/km)
Considera todos os custos operacionais (combustível + manutenção + pneus).

**Classificação**:
- ✅ Econômico: ≤ R$ 0,50/km
- ⚠️ Moderado: R$ 0,50-0,80/km
- ❌ Alto: > R$ 0,80/km

### Manutenção Preventiva
Alertas automáticos a cada 10.000 km rodados.

### Vida Útil dos Pneus
- ✅ Normal: < 30.000 km desde última troca
- ⚠️ Atenção: 30.000-40.000 km
- ❌ Crítico: > 40.000 km

## 💡 Recomendações Inteligentes

O bot gera recomendações automáticas baseadas em:
- Baixo consumo de combustível
- Custos operacionais elevados
- Variação excessiva nos preços de abastecimento
- Necessidade de manutenção preventiva

## 🛠️ Tecnologias

- **Node.js**: Runtime JavaScript
- **readline-sync**: Interface interativa no terminal
- **chalk**: Cores e formatação visual
- **date-fns**: Manipulação de datas (preparado para uso futuro)

## 📝 Dados Persistidos

Todos os dados são salvos automaticamente em `data/frota.json` no formato JSON.

## 🔮 Próximas Melhorias Sugeridas

- [ ] Exportar relatórios em PDF
- [ ] Gráficos de tendência de consumo
- [ ] Integração com API de preços de combustível
- [ ] Alertas por e-mail/WhatsApp
- [ ] Dashboard web
- [ ] Histórico detalhado por período

## 📞 Suporte

Para dúvidas ou sugestões, consulte a documentação no código ou entre em contato.

---

**Desenvolvido para gestão eficiente de frotas automotivas** 🚗💨
