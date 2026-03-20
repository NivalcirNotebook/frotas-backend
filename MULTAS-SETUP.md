# Setup de Multas - Instruções de Migração

## Passo 1: Executar a Migração do Banco de Dados

A funcionalidade de multas requer uma nova tabela no banco de dados. Execute o comando abaixo:

### Opção 1: Via PowerShell (Admin)
Abra o PowerShell como Administrador e execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd "S:\Projetos\projeto-frotas-automóveis"
npx prisma migrate dev --name add_multas
```

### Opção 2: Via CMD
Abra o Prompt de Comando (CMD) e execute:
```cmd
cd S:\Projetos\projeto-frotas-automóveis
npx prisma migrate dev --name add_multas
```

### Opção 3: Via Git Bash
```bash
cd /s/Projetos/projeto-frotas-automóveis
npx prisma migrate dev --name add_multas
```

## Passo 2: Gerar o Prisma Client

Após a migração, gere o client atualizado:
```bash
npx prisma generate
```

## Passo 3: Iniciar o Servidor

```bash
npm start
```

## Passo 4: Iniciar o Cliente (em outro terminal)

```bash
cd client
npm start
```

## Verificação

Após iniciar o sistema, você deve ver:
- ✅ Novo botão "🚨 Multas" na barra de navegação
- ✅ Formulário de registro de multas com sugestão automática de motorista
- ✅ Lista de multas com filtros e totalizadores

## Funcionalidades Implementadas

### Backend
- ✅ Modelo `Multa` no Prisma Schema
- ✅ `GestorMultas.js` com todas as operações CRUD
- ✅ Rotas API completas em `/api/multas/*`
- ✅ Rota especial `/api/multas/sugerir-motorista/:veiculoId` que analisa viagens

### Frontend
- ✅ Componente `RegistrarMultas.js` completo
- ✅ Formulário com validação
- ✅ Sugestão automática de motorista baseada em viagens
- ✅ Filtros por veículo, motorista e status
- ✅ Totalizadores de valores e pontos
- ✅ Ações: criar, editar, pagar, excluir
- ✅ Interface com cores por status (Pendente, Paga, Em Recurso, Cancelada)

### Integração
- ✅ Botão "🚨 Multas" na navegação do App.js
- ✅ Permissões configuradas (admin e motoristas têm acesso)

## Campos da Multa

- **Veículo** (obrigatório)
- **Motorista** (opcional - pode ser sugerido automaticamente)
- **Data/Hora da Infração** (obrigatório)
- **Tipo de Multa** (dropdown com opções comuns)
- **Número do Auto de Infração** (obrigatório)
- **Local** (obrigatório)
- **Descrição** (obrigatório)
- **Valor da Multa** (obrigatório)
- **Pontos na CNH** (0-7)
- **Data de Vencimento** (obrigatório)
- **Status** (Pendente, Paga, Em Recurso, Cancelada)
- **Data de Pagamento** (se status = Paga)
- **Valor Pago** (se status = Paga)
- **Observações** (opcional)

## Recurso Especial: Sugestão de Motorista

O sistema analisa automaticamente as viagens registradas e sugere qual motorista estava usando o veículo na data/hora próxima à infração, facilitando a atribuição correta da responsabilidade.
