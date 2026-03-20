# Deploy do Backend no Render

Este guia explica como fazer deploy do backend (API Node.js + Express + PostgreSQL) no Render.

## 📋 Pré-requisitos

- Conta no [Render](https://render.com)
- Repositório Git com o código do backend
- Código do backend na raiz do repositório

## 🗂️ Estrutura do Repositório Backend

Se você separou os repositórios, o repo do backend deve conter:

```
backend/
├── bot/
├── lib/
├── middleware/
├── models/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── scripts/
├── .gitignore
├── Dockerfile
├── package.json
├── server.js
└── index.js
```

## 🚀 Passo a Passo

### 1. Criar PostgreSQL Database

1. No dashboard do Render, clique em **"New +"** → **"PostgreSQL"**
2. Preencha:
   - **Name**: `frotas-db` (ou nome de sua escolha)
   - **Database**: `frotas_db`
   - **User**: será gerado automaticamente
   - **Region**: escolha a mais próxima
   - **Plan**: Free (para testes) ou Starter
3. Clique em **"Create Database"**
4. **Copie a "Internal Database URL"** - você vai precisar dela

### 2. Criar Web Service

1. No dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório Git (GitHub, GitLab, etc.)
3. Selecione o repositório do backend
4. Preencha as configurações:

   **Configurações Básicas:**
   - **Name**: `frotas-backend` (ou nome de sua escolha)
   - **Region**: mesma região do banco de dados
   - **Branch**: `main` (ou sua branch principal)
   - **Root Directory**: deixe vazio se o backend está na raiz
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `node server.js`
   - **Plan**: Free (para testes) ou Starter

### 3. Configurar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

```bash
# Obrigatórias
DATABASE_URL=<Cole a Internal Database URL do PostgreSQL aqui>
JWT_SECRET=sua_chave_secreta_super_segura_aqui_123456
NODE_ENV=production
PORT=3001

# URL do Frontend (após deploy na Vercel)
FRONTEND_URL=https://seu-app.vercel.app

# Credenciais de login (opcional - serão criadas via seed)
LOGIN_USERNAME=admin
LOGIN_PASSWORD=sua_senha_admin_segura
```

**⚠️ IMPORTANTE:**
- Substitua `<Cole a Internal Database URL...>` pela URL real do banco
- Gere uma chave JWT segura (pode usar: `openssl rand -base64 32`)
- Após fazer deploy do frontend na Vercel, volte aqui e atualize `FRONTEND_URL`

### 4. Deploy

1. Clique em **"Create Web Service"**
2. O Render vai:
   - Instalar dependências (`npm install`)
   - Gerar Prisma Client (`npx prisma generate`)
   - Executar migrations (`npx prisma migrate deploy`)
   - Iniciar o servidor

3. Acompanhe os logs para verificar se está tudo OK

### 5. Verificar Deploy

Quando o deploy terminar:

1. Copie a URL do serviço (algo como `https://frotas-backend.onrender.com`)
2. Teste no navegador ou Postman:
   ```
   GET https://frotas-backend.onrender.com/api/veiculos
   ```
   (Deve retornar erro 401 - Unauthorized, o que é correto)

3. Teste o login:
   ```
   POST https://frotas-backend.onrender.com/api/login
   Body: {
     "username": "admin",
     "password": "sua_senha_admin_segura"
   }
   ```

## 🌱 Popular o Banco de Dados (Seed)

Se você precisar popular o banco com dados iniciais:

1. No dashboard do Render, vá no seu Web Service
2. Clique na aba **"Shell"**
3. Execute:
   ```bash
   npx prisma db seed
   ```

## 🔄 Atualizações Futuras

Sempre que você fizer push para a branch principal:
- O Render fará deploy automaticamente
- As migrations serão executadas automaticamente

## 📝 Notas Importantes

- **Free tier**: O serviço gratuito hiberna após 15 minutos de inatividade
- **Primeira requisição**: Pode demorar ~30 segundos para "acordar"
- **Logs**: Sempre disponíveis no dashboard do Render
- **Custom Domain**: Você pode adicionar seu próprio domínio nas configurações

## 🔧 Troubleshooting

### Erro de Conexão com Banco
- Verifique se a `DATABASE_URL` está correta
- Confirme que o banco e o serviço estão na mesma região

### Erro nas Migrations
- Execute manualmente na Shell: `npx prisma migrate deploy`
- Verifique os logs para ver o erro específico

### Erro 500 no Servidor
- Verifique os logs no dashboard
- Confirme que todas as variáveis de ambiente estão configuradas
- Teste localmente primeiro

## ✅ Próximo Passo

Após o backend estar funcionando, siga o guia **DEPLOY-VERCEL.md** para fazer deploy do frontend.
