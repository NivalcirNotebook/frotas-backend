# Sistema de Gestão de Frotas - PostgreSQL + Prisma

Sistema de gestão de frotas automotivas com armazenamento em PostgreSQL usando Prisma ORM.

## Stack Tecnológica

### Backend
- Node.js + Express
- PostgreSQL 16 (via Docker)
- Prisma ORM
- JWT para autenticação

### Frontend
- React
- Axios para requisições HTTP

### DevOps
- Docker Compose para PostgreSQL
- Prisma Migrations para versionamento do schema

## Instalação e Setup

### 1. Instalar Dependências

```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env` (já feito):

```bash
cp .env.example .env
```

Ajuste as credenciais se necessário.

### 3. Iniciar PostgreSQL

```bash
npm run docker:up
```

### 4. Aplicar Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. (Opcional) Migrar Dados do JSON

Se você tem dados em `data/*.json`:

```bash
npm run migrate:data
```

### 6. Iniciar Aplicação

```bash
# Desenvolvimento (backend)
npm run dev

# Produção (backend)
npm start

# Frontend (em outro terminal)
npm run client
```

## Scripts Disponíveis

### Backend
- `npm start` - Inicia servidor de produção
- `npm run dev` - Inicia servidor com nodemon
- `npm run cli` - Interface de linha de comando

### Docker
- `npm run docker:up` - Inicia PostgreSQL
- `npm run docker:down` - Para PostgreSQL
- `npm run docker:logs` - Ver logs do PostgreSQL

### Prisma
- `npm run prisma:migrate` - Criar/aplicar migrations
- `npm run prisma:studio` - Interface visual do banco
- `npm run prisma:generate` - Gerar Prisma Client

### Migração
- `npm run migrate:data` - Migrar dados de JSON para PostgreSQL

### Frontend
- `npm run client` - Inicia React dev server
- `npm run build` - Build de produção do frontend

## Estrutura do Banco de Dados

### Tabelas Principais

#### veiculos
- id, marca, modelo, placa, ano, kmAtual
- Índice em: placa

#### motoristas
- id, nome, cnh, telefone, email, ativo, dataCadastro
- Índices em: cnh, ativo

#### viagens
- id, motoristaId, veiculoId, dataHoraSaida, dataHoraChegada, kmSaida, kmChegada, kmPercorridos
- Índices em: motoristaId, veiculoId, data

#### abastecimentos
- id, veiculoId, motoristaId, data, km, litros, valorTotal, valorPorLitro
- Índices em: veiculoId, motoristaId, data

#### manutencoes
- id, veiculoId, motoristaId, data, km, tipo, descricao, valorTotal
- Índices em: veiculoId, motoristaId, data

#### trocas_pneus
- id, veiculoId, motoristaId, data, km, eixo, posicao, quantidade, valorTotal, tipo
- Índices em: veiculoId, motoristaId, data

#### trocas_oleo
- id, veiculoId, motoristaId, data, km, tipoOleo, quantidade, filtroOleo, filtroAr, filtroCombustivel, valorTotal, observacoes
- Índices em: veiculoId, motoristaId, data

#### revisoes
- id, veiculoId, motoristaId, data, km, tipoRevisao, itensRevisados (JSON), observacoes, valorTotal, proximaRevisao
- Índices em: veiculoId, motoristaId, data

## API Endpoints

### Autenticação
- `POST /api/login` - Login com usuário e senha

### Veículos
- `GET /api/veiculos` - Listar todos
- `GET /api/veiculos/:id` - Buscar por ID
- `POST /api/veiculos` - Criar novo
- `DELETE /api/veiculos/:id` - Remover

### Registros de Veículos
- `POST /api/veiculos/:id/abastecimento` - Registrar abastecimento
- `DELETE /api/veiculos/:id/abastecimento/:index` - Remover abastecimento
- `POST /api/veiculos/:id/manutencao` - Registrar manutenção
- `DELETE /api/veiculos/:id/manutencao/:index` - Remover manutenção
- `POST /api/veiculos/:id/pneus` - Registrar troca de pneus
- `DELETE /api/veiculos/:id/pneus/:index` - Remover troca de pneus
- `POST /api/veiculos/:id/troca-oleo` - Registrar troca de óleo
- `DELETE /api/veiculos/:id/troca-oleo/:index` - Remover troca de óleo
- `POST /api/veiculos/:id/revisao` - Registrar revisão
- `DELETE /api/veiculos/:id/revisao/:index` - Remover revisão

### Análises
- `GET /api/analise/veiculo/:id` - Análise detalhada do veículo
- `GET /api/analise/frota` - Estatísticas gerais da frota
- `GET /api/analise/motorista/:id` - Performance do motorista

### Motoristas
- `GET /api/motoristas` - Listar todos (query: ?ativos=true)
- `GET /api/motoristas/:id` - Buscar por ID
- `POST /api/motoristas` - Criar novo
- `PUT /api/motoristas/:id` - Atualizar
- `DELETE /api/motoristas/:id` - Desativar

### Viagens
- `GET /api/viagens` - Listar todas
- `GET /api/viagens/:id` - Buscar por ID
- `POST /api/viagens` - Criar nova
- `PUT /api/viagens/:id` - Atualizar
- `DELETE /api/viagens/:id` - Remover

### Gráficos
- `GET /api/graficos/dados-consolidados` - Dados consolidados para dashboards

## Desenvolvimento

### Prisma Studio

Interface visual para o banco de dados:

```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

### Migrations

Criar nova migration após alteração no schema:

```bash
npx prisma migrate dev --name nome_da_migration
```

### Seed (Dados de Teste)

Para popular o banco com dados de teste, você pode:

1. Usar o script de migração com JSONs de exemplo
2. Criar um arquivo `prisma/seed.js`
3. Usar o Prisma Studio manualmente

## Produção

### Variáveis de Ambiente

Em produção, configure:

```env
NODE_ENV=production
DATABASE_URL="postgresql://usuario:senha@host:5432/database"
JWT_SECRET="chave_secreta_forte_aleatoria"
LOGIN_USERNAME="admin"
LOGIN_PASSWORD="senha_forte"
PORT=3001
```

### Deploy

1. Configure PostgreSQL em servidor (não use Docker em produção)
2. Execute migrations: `npx prisma migrate deploy`
3. Build do frontend: `npm run build`
4. Inicie com PM2 ou similar: `pm2 start server.js`

### Backup

Configure backup automático do PostgreSQL:

```bash
# Exemplo de backup manual
docker exec frotas-postgres pg_dump -U frotas_admin frotas_db > backup.sql

# Restore
docker exec -i frotas-postgres psql -U frotas_admin frotas_db < backup.sql
```

## Segurança

- ✅ Senhas nunca em código (use .env)
- ✅ JWT com expiração
- ✅ Validação de dados de entrada
- ✅ SQL Injection prevenido pelo Prisma
- ✅ CORS configurado
- ⚠️ Implemente HTTPS em produção
- ⚠️ Rate limiting para APIs públicas

## Suporte

Para problemas ou dúvidas, consulte:
- `MIGRATION.md` - Guia de migração detalhado
- Logs do servidor
- Logs do Docker: `npm run docker:logs`
- Prisma Studio para inspeção de dados
