# 🚀 Guia de Deployment para Produção

Este guia explica como colocar o Sistema de Gestão de Frotas em produção.

## 📋 Pré-requisitos

- Node.js 16+ instalado
- Git instalado (para deploy em plataformas cloud)
- Conta em uma plataforma de hospedagem (Heroku, Railway, Render, etc.)

## 🔧 Preparação da Aplicação

### 1. Build do Frontend

```bash
# Na pasta raiz do projeto
npm run build
```

Este comando cria a pasta `client/build` com os arquivos otimizados do React.

### 2. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
PORT=3001
JWT_SECRET=sua_chave_secreta_aqui_muito_segura
NODE_ENV=production
```

**IMPORTANTE**: Nunca compartilhe seu JWT_SECRET! Use uma senha forte e aleatória.

---

## 🌐 Opções de Hospedagem

### Opção 1: Heroku (Gratuito com limitações)

1. **Instalar Heroku CLI**
   ```bash
   # Baixe em: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login no Heroku**
   ```bash
   heroku login
   ```

3. **Criar aplicação**
   ```bash
   heroku create nome-da-sua-app
   ```

4. **Configurar variáveis de ambiente**
   ```bash
   heroku config:set JWT_SECRET=sua_chave_secreta_forte
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Preparar para produção"
   git push heroku main
   ```

6. **Abrir aplicação**
   ```bash
   heroku open
   ```

---

### Opção 2: Railway (Recomendado - Fácil e Gratuito)

1. **Acesse**: https://railway.app
2. **Crie uma conta** (pode usar GitHub)
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Conecte seu repositório**
6. **Configure as variáveis**:
   - `JWT_SECRET`: sua_chave_secreta_forte
   - `NODE_ENV`: production
7. **Railway fará o deploy automaticamente!**

---

### Opção 3: Render (Gratuito)

1. **Acesse**: https://render.com
2. **Crie uma conta**
3. **Clique em "New +" → "Web Service"**
4. **Conecte seu repositório GitHub**
5. **Configure**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. **Adicione variáveis de ambiente**:
   - `JWT_SECRET`: sua_chave_secreta_forte
   - `NODE_ENV`: production
7. **Clique em "Create Web Service"**

---

### Opção 4: VPS (DigitalOcean, AWS, etc.) - Mais Controle

#### Passos no Servidor:

1. **Conectar ao servidor**
   ```bash
   ssh root@seu-servidor-ip
   ```

2. **Instalar Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Instalar PM2 (gerenciador de processos)**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clonar o projeto**
   ```bash
   git clone https://github.com/seu-usuario/projeto-frotas.git
   cd projeto-frotas
   ```

5. **Instalar dependências**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

6. **Build do frontend**
   ```bash
   npm run build
   ```

7. **Criar arquivo .env**
   ```bash
   nano .env
   # Adicione as variáveis e salve (Ctrl+X, Y, Enter)
   ```

8. **Iniciar com PM2**
   ```bash
   pm2 start server.js --name "frotas-app"
   pm2 save
   pm2 startup
   ```

9. **Configurar Nginx (opcional, mas recomendado)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/frotas
   ```

   Adicione:
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/frotas /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 🔒 Segurança em Produção

### 1. HTTPS (SSL/TLS)

**Para Heroku/Railway/Render**: HTTPS já está configurado automaticamente!

**Para VPS com Nginx**: Use Let's Encrypt (gratuito)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### 2. Variáveis de Ambiente

Nunca coloque senhas ou chaves secretas no código! Sempre use `.env` e configure na plataforma de hospedagem.

### 3. Firewall (VPS)

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 📦 Checklist de Deploy

- [ ] Build do frontend realizado (`npm run build`)
- [ ] Arquivo `.env` configurado com JWT_SECRET forte
- [ ] Variáveis de ambiente configuradas na plataforma
- [ ] Aplicação testada localmente
- [ ] CORS configurado adequadamente
- [ ] HTTPS habilitado
- [ ] Backup dos dados (`data/` pasta)
- [ ] Monitoramento configurado (opcional)

---

## 🔄 Atualizações Futuras

### Heroku/Railway/Render
```bash
git add .
git commit -m "Descrição da atualização"
git push origin main
# O deploy acontece automaticamente!
```

### VPS
```bash
ssh root@seu-servidor-ip
cd projeto-frotas
git pull origin main
npm install
npm run build
pm2 restart frotas-app
```

---

## 📊 Monitoramento

### PM2 (VPS)
```bash
pm2 logs frotas-app      # Ver logs
pm2 status               # Status da aplicação
pm2 monit                # Monitor em tempo real
```

### Plataformas Cloud
Heroku, Railway e Render têm dashboards integrados com logs e métricas.

---

## 🆘 Solução de Problemas

### Aplicação não inicia
- Verifique as variáveis de ambiente
- Verifique os logs: `heroku logs --tail` ou `pm2 logs`
- Certifique-se que a porta está correta

### Erro 404 nas rotas do React
- Certifique-se que o build foi executado
- Verifique se o servidor está servindo `client/build`

### Banco de dados não persiste
- Verifique permissões da pasta `data/`
- Em algumas plataformas, use um banco de dados externo (MongoDB, PostgreSQL)

---

## 💡 Recomendação

Para começar rapidamente, recomendo **Railway** ou **Render**:
- ✅ Gratuito
- ✅ HTTPS automático
- ✅ Deploy automático via Git
- ✅ Fácil configuração

---

## 📞 Suporte

Se tiver problemas, verifique:
1. Logs da aplicação
2. Configurações de variáveis de ambiente
3. Versão do Node.js (deve ser 16+)
