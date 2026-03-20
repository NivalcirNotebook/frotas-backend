# 🚗 Sistema de Gestão de Frotas - Aplicação Web

Sistema web completo para gerenciamento de frotas de automóveis com interface moderna para motoristas registrarem abastecimentos e visualizarem análises de performance.

## 🌟 Características

### Interface Web Moderna
- ✅ Design responsivo e intuitivo
- ✅ Dashboard com métricas em tempo real
- ✅ Formulários simplificados para motoristas
- ✅ Análises visuais de performance
- ✅ Cálculos automáticos de consumo e custos

### Funcionalidades Principais

#### Para Motoristas
- ⛽ **Registro Rápido de Abastecimentos**
  - Cálculo automático de valor por litro
  - Validação de dados em tempo real
  - Histórico completo de abastecimentos

- 🔧 **Registro de Manutenções**
  - Categorização (Preventiva/Corretiva)
  - Descrição detalhada dos serviços
  - Rastreamento de custos

- 🛞 **Controle de Pneus**
  - Registro de trocas
  - Cálculo de valor por pneu
  - Histórico de substituições

#### Para Gestores
- 📊 **Dashboard Completo**
  - Visão geral da frota
  - Estatísticas consolidadas
  - Métricas de performance

- 📈 **Análises Detalhadas**
  - Consumo médio por veículo
  - Custo operacional por km
  - Previsão de manutenções
  - Comparativos de performance

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação

1. **Instalar dependências do backend:**
```bash
npm install
```

2. **Instalar dependências do frontend:**
```bash
cd client
npm install
cd ..
```

### Executar a Aplicação

#### Opção 1: Executar Backend e Frontend Separadamente

**Terminal 1 - Backend (porta 3001):**
```bash
npm start
```

**Terminal 2 - Frontend (porta 3000):**
```bash
cd client
npm start
```

#### Opção 2: Build de Produção

```bash
cd client
npm run build
cd ..
npm start
```

Acesse: **http://localhost:3000** (desenvolvimento) ou **http://localhost:3001** (produção)

## 📱 Funcionalidades da Interface

### 📊 Dashboard
- Visualização de estatísticas gerais da frota
- Total de veículos, KM rodados, gastos totais
- Consumo médio e custo por km
- Lista de todos os veículos cadastrados

### 🚙 Veículos
- Cadastro de novos veículos
- Visualização de todos os veículos da frota
- Informações detalhadas (marca, modelo, placa, ano, km)
- Contadores de registros por veículo

### ⛽ Abastecimento
- Formulário simplificado para motoristas
- Seleção rápida de veículo
- Cálculo automático do valor por litro
- Validação de dados obrigatórios

### 🔧 Manutenção
- Registro de serviços realizados
- Categorização por tipo
- Campo para descrição detalhada
- Controle de custos

### 🛞 Pneus
- Registro de trocas de pneus
- Seleção de quantidade (1, 2, 4 ou 5 pneus)
- Especificação do modelo/tipo
- Cálculo automático do valor por pneu

### 📈 Análise
- Seleção de veículo para análise detalhada
- Métricas de consumo com classificação (Excelente/Bom/Regular/Atenção)
- Análise de custo operacional
- Previsão de próxima manutenção
- Tabela com últimos abastecimentos
- Contadores de registros

## 🎨 Design e UX

- **Gradiente moderno** no cabeçalho (roxo/violeta)
- **Cards com sombras** para destacar conteúdo
- **Badges coloridos** para indicadores de status
- **Responsivo** - funciona em desktop, tablet e mobile
- **Navegação intuitiva** com abas
- **Feedback visual** para ações do usuário

## 📊 API Endpoints

### Veículos
- `GET /api/veiculos` - Listar todos os veículos
- `GET /api/veiculos/:id` - Buscar veículo por ID
- `POST /api/veiculos` - Cadastrar novo veículo

### Registros
- `POST /api/veiculos/:id/abastecimento` - Registrar abastecimento
- `POST /api/veiculos/:id/manutencao` - Registrar manutenção
- `POST /api/veiculos/:id/pneus` - Registrar troca de pneus

### Análises
- `GET /api/analise/veiculo/:id` - Análise de veículo específico
- `GET /api/analise/frota` - Análise geral da frota

## 📁 Estrutura do Projeto

```
projeto-frotas-automóveis/
├── server.js                          # Servidor Express (Backend)
├── models/
│   ├── Veiculo.js                    # Modelo de veículo com cálculos
│   └── Frota.js                      # Gerenciamento da frota
├── bot/
│   └── BotAnalise.js                 # Bot de análise (usado pelo backend)
├── data/
│   └── frota.json                    # Dados persistidos
├── client/                           # Aplicação React (Frontend)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js          # Dashboard principal
│   │   │   ├── VeiculosList.js       # Lista e cadastro de veículos
│   │   │   ├── RegistrarAbastecimento.js
│   │   │   ├── RegistrarManutencao.js
│   │   │   ├── RegistrarPneus.js
│   │   │   └── Analise.js            # Análises de performance
│   │   ├── App.js                    # Componente principal
│   │   └── App.css                   # Estilos globais
│   └── package.json
├── index.js                          # Aplicação CLI (antiga)
├── package.json
└── README-WEB.md                     # Este arquivo
```

## 🎯 Fluxo de Uso Típico

1. **Gestor cadastra veículos** na aba "Veículos"
2. **Motoristas registram abastecimentos** na aba "Abastecimento"
3. **Equipe registra manutenções** conforme realizadas
4. **Sistema calcula automaticamente**:
   - Consumo médio (km/l)
   - Custo por km
   - Previsão de manutenção
5. **Gestores consultam análises** no Dashboard e aba "Análise"

## 💡 Dicas de Uso

- **Mínimo 2 abastecimentos** são necessários para calcular consumo médio
- **Mantenha o KM atualizado** em cada registro
- **Revise o Dashboard** regularmente para identificar anomalias
- **Use a análise individual** para decisões sobre veículos específicos

## 🔐 Segurança e Dados

- Dados salvos localmente em `data/frota.json`
- Backend em `http://localhost:3001`
- Frontend em `http://localhost:3000` (dev)
- CORS habilitado para desenvolvimento

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **CORS** - Comunicação cross-origin
- **Body-Parser** - Parser de requisições

### Frontend
- **React** - Biblioteca UI
- **Fetch API** - Requisições HTTP
- **CSS3** - Estilização moderna
- **Hooks** (useState, useEffect)

## 📈 Próximas Melhorias

- [ ] Autenticação de usuários
- [ ] Permissões por tipo de usuário (motorista/gestor)
- [ ] Gráficos de tendência
- [ ] Exportar relatórios em PDF
- [ ] Notificações de manutenção
- [ ] App mobile nativo
- [ ] Integração com APIs de preços de combustível

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique se o backend está rodando (porta 3001)
2. Verifique se o frontend está rodando (porta 3000)
3. Consulte o console do navegador para erros
4. Verifique os logs do servidor

---

**Sistema Web de Gestão de Frotas v2.0** 🚗💨
