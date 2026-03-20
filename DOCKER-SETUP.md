# 🐳 Guia de Deploy com Docker

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Docker Compose (incluído no Docker Desktop)

## 🚀 Comandos Rápidos

### Iniciar todos os serviços (primeira vez)

```bash
# Build e iniciar todos os containers
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Ver status dos containers
docker ps
```

### Comandos do dia a dia

```bash
# Iniciar containers (se já foram buildados)
docker-compose up -d

# Parar containers
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados do banco)
docker-compose down -v

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Reconstruir apenas um serviço
docker-compose up --build -d backend
docker-compose up --build -d frontend

# Entrar no container (para debugging)
docker exec -it frotas-backend sh
docker exec -it frotas-frontend sh
docker exec -it frotas-postgres psql -U frotas_admin -d frotas_db
```

## 🔧 Configuração

### Variáveis de Ambiente

Edite o arquivo `.env` ou crie um baseado em `.env.docker`:

```bash
cp .env.docker .env
```

### Portas

- **Frontend (React)**: http://localhost:80
- **Backend (API)**: http://localhost:3001
- **PostgreSQL**: localhost:5433

## 📦 Serviços

### 1. PostgreSQL
- Container: `frotas-postgres`
- Imagem: `postgres:15`
- Porta: 5433:5432
- Volume persistente: `postgres_data`

### 2. Backend (Node.js + Express)
- Container: `frotas-backend`
- Build: `./Dockerfile`
- Porta: 3001:3001
- Depende: PostgreSQL

### 3. Frontend (React + Nginx)
- Container: `frotas-frontend`
- Build: `./client/Dockerfile`
- Porta: 80:80
- Depende: Backend

## 🗄️ Banco de Dados

### Executar Migrações

```bash
# Dentro do container backend
docker exec -it frotas-backend npx prisma migrate deploy

# Ou via docker-compose
docker-compose exec backend npx prisma migrate deploy
```

### Seed (popular banco com dados iniciais)

```bash
docker-compose exec backend npx prisma db seed
```

### Acessar PostgreSQL

```bash
# Via psql no container
docker exec -it frotas-postgres psql -U frotas_admin -d frotas_db

# Via cliente externo
Host: localhost
Port: 5433
Database: frotas_db
User: frotas_admin
Password: frotas_senha_segura_2024
```

## 🔍 Troubleshooting

### Containers não iniciam

```bash
# Verificar logs
docker-compose logs

# Verificar status
docker ps -a

# Rebuild completo
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Erro de conexão com banco

```bash
# Verificar se postgres está rodando
docker-compose ps postgres

# Ver logs do postgres
docker-compose logs postgres

# Aguardar healthcheck
docker-compose exec postgres pg_isready -U frotas_admin
```

### Limpar tudo e recomeçar

```bash
# CUIDADO: Remove containers, volumes e imagens
docker-compose down -v
docker system prune -a
docker-compose up --build -d
```

## 📊 Monitoramento

### Ver uso de recursos

```bash
docker stats
```

### Ver tamanho dos volumes

```bash
docker system df -v
```

## 🔐 Segurança em Produção

1. **Altere as senhas** em `.env`:
   - `LOGIN_PASSWORD`
   - `JWT_SECRET`
   - `POSTGRES_PASSWORD`

2. **Use variáveis de ambiente** seguras (não commitar .env)

3. **Configure HTTPS** com certificado SSL

4. **Limite recursos** dos containers se necessário:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

## 🚀 Deploy em Servidor

### Usando Docker Compose

```bash
# No servidor
git clone <seu-repositorio>
cd projeto-frotas-automóveis
cp .env.example .env
# Edite .env com credenciais de produção
docker-compose up --build -d
```

### Atualizar aplicação

```bash
git pull
docker-compose up --build -d
```

## 📝 Comandos Úteis do Package.json

```bash
# Já configurados no package.json:
npm run docker:up      # Inicia containers
npm run docker:down    # Para containers
npm run docker:logs    # Ver logs
```
