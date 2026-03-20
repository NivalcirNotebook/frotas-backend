# Guia: Separação em 2 Repositórios

Este documento explica como separar o projeto monorepo atual em **2 repositórios independentes** para deploy no Render (backend) e Vercel (frontend).

## 🎯 Por Que 2 Repositórios?

**Vantagens:**
- ✅ Deploys independentes (mudança no frontend não afeta backend)
- ✅ Builds mais rápidos
- ✅ Configuração mais simples no Render e Vercel
- ✅ Variáveis de ambiente separadas e mais seguras
- ✅ Melhor organização e escalabilidade

## 📦 Estrutura Atual vs Nova

### Atual (Monorepo)
```
projeto-frotas-automóveis/
├── client/          ← Frontend React
├── bot/
├── lib/
├── models/
├── prisma/
├── server.js        ← Backend
└── package.json
```

### Nova (2 Repositórios)

**Repositório 1: Backend**
```
frotas-backend/
├── bot/
├── lib/
├── middleware/
├── models/
├── prisma/
├── scripts/
├── server.js
├── index.js
├── package.json
└── README.md
```

**Repositório 2: Frontend**
```
frotas-frontend/
├── public/
├── src/
├── package.json
├── .env.example
└── README.md
```

## 🔧 Passo a Passo para Separação

### 1. Criar Repositório do Backend

```bash
# Criar nova pasta para o backend
mkdir frotas-backend
cd frotas-backend

# Inicializar Git
git init

# Copiar arquivos do backend do projeto original
# (faça isso manualmente ou via script)
```

**Arquivos/Pastas a copiar do projeto original:**
- `bot/`
- `lib/`
- `middleware/`
- `models/`
- `prisma/`
- `scripts/`
- `data/` (se necessário)
- `server.js`
- `index.js`
- `package.json` (raiz)
- `package-lock.json`
- `.gitignore`
- `Dockerfile`
- `.env.example`
- `DEPLOY-RENDER.md`
- `README.md` (crie um novo específico para o backend)

**NÃO copiar:**
- Pasta `client/`
- Arquivos específicos do frontend

**Criar .gitignore:**
```
node_modules/
.env
.env.local
.env.production
dist/
*.log
.DS_Store
```

**Primeiro commit:**
```bash
git add .
git commit -m "Initial commit: Backend API"
git branch -M main
git remote add origin <URL-DO-REPO-BACKEND>
git push -u origin main
```

### 2. Criar Repositório do Frontend

```bash
# Criar nova pasta para o frontend
mkdir frotas-frontend
cd frotas-frontend

# Inicializar Git
git init

# Copiar TODO o conteúdo da pasta client/ do projeto original
```

**Arquivos/Pastas a copiar da pasta `client/`:**
- `public/`
- `src/`
- `package.json`
- `package-lock.json`
- `.gitignore`
- `Dockerfile` (se houver)
- `nginx.conf` (se houver)
- `.env.example`
- `DEPLOY-VERCEL.md`
- `README.md` (crie um novo específico para o frontend)

**Atualizar .gitignore:**
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

**Primeiro commit:**
```bash
git add .
git commit -m "Initial commit: Frontend React"
git branch -M main
git remote add origin <URL-DO-REPO-FRONTEND>
git push -u origin main
```

### 3. Verificar Configurações

#### Backend (`frotas-backend`)

**package.json** - verificar scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "prisma:migrate": "npx prisma migrate dev",
    "prisma:studio": "npx prisma studio",
    "prisma:generate": "npx prisma generate"
  }
}
```

**.env.example:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/frotas_db"
JWT_SECRET=sua_chave_secreta
PORT=3001
FRONTEND_URL=http://localhost:3000
LOGIN_USERNAME=admin
LOGIN_PASSWORD=senha123
```

#### Frontend (`frotas-frontend`)

**package.json** - verificar scripts:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

**.env.example:**
```bash
REACT_APP_API_URL=http://localhost:3001
```

**src/config.js** - deve existir:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
export { API_URL };
```

## ✅ Checklist de Verificação

### Backend
- [ ] Repositório criado no GitHub/GitLab
- [ ] Arquivos copiados corretamente
- [ ] `package.json` atualizado
- [ ] `.env.example` criado
- [ ] `.gitignore` configurado
- [ ] CORS configurado em `server.js`
- [ ] Testado localmente (`npm install && npm start`)
- [ ] Migrations do Prisma funcionando

### Frontend
- [ ] Repositório criado no GitHub/GitLab
- [ ] Arquivos copiados da pasta `client/`
- [ ] `src/config.js` existe e está correto
- [ ] Todos os componentes usando `API_URL`
- [ ] `package.json` atualizado
- [ ] `.env.example` criado
- [ ] `.gitignore` configurado
- [ ] Testado localmente (`npm install && npm start`)

## 🚀 Próximos Passos

Depois de separar os repositórios:

1. **Deploy do Backend no Render**
   - Siga o guia: `DEPLOY-RENDER.md`
   - Configure PostgreSQL
   - Configure variáveis de ambiente
   - Anote a URL do backend

2. **Deploy do Frontend na Vercel**
   - Siga o guia: `client/DEPLOY-VERCEL.md`
   - Configure `REACT_APP_API_URL` com a URL do Render
   - Faça deploy

3. **Atualizar CORS**
   - Volte no Render
   - Atualize `FRONTEND_URL` com a URL da Vercel
   - Aguarde redeploy

## 🔄 Workflow de Desenvolvimento

### Desenvolvimento Local

**Terminal 1 - Backend:**
```bash
cd frotas-backend
npm install
cp .env.example .env
# Edite .env com suas configurações locais
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frotas-frontend
npm install
cp .env.example .env.local
# Edite .env.local: REACT_APP_API_URL=http://localhost:3001
npm start
```

### Sincronização de Mudanças

Quando fazer mudanças na API (contratos):

1. Atualizar backend primeiro
2. Testar localmente
3. Commit e push no repo do backend
4. Atualizar frontend para usar nova API
5. Testar localmente
6. Commit e push no repo do frontend

## 📝 Observações Importantes

### Variáveis de Ambiente

**Backend (.env):**
- `DATABASE_URL` - Conexão com PostgreSQL
- `JWT_SECRET` - Chave para tokens JWT
- `FRONTEND_URL` - URL do frontend para CORS
- `PORT` - Porta do servidor (padrão 3001)

**Frontend (.env.local):**
- `REACT_APP_API_URL` - URL do backend

### Arquivos Sensíveis

**NUNCA comitar:**
- `.env`
- `.env.local`
- `.env.production`
- `node_modules/`

**Sempre comitar:**
- `.env.example` (com valores de exemplo)

### Git Branches

Recomendação de estrutura:
- `main` - Produção (deploy automático)
- `develop` - Desenvolvimento
- `feature/*` - Features específicas

## 🆘 Problemas Comuns

### "Module not found" ao rodar frontend
```bash
cd frotas-frontend
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS
- Verifique `FRONTEND_URL` no backend
- Deve ser exatamente a URL do frontend (sem `/` no final)

### Prisma não encontra schema
```bash
cd frotas-backend
npx prisma generate
```

### Build falha na Vercel
- Verifique se todas dependências estão em `package.json`
- Não devem ter `devDependencies` necessárias para build

## 📚 Recursos Adicionais

- [Documentação Render](https://render.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

## ✨ Conclusão

Após seguir este guia, você terá:
- 2 repositórios independentes
- Backend deployado no Render com PostgreSQL
- Frontend deployado na Vercel
- Sistema totalmente funcional em produção

Boa sorte com o deploy! 🚀
