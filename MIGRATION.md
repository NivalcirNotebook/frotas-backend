# Guia de Migração: JSON para PostgreSQL com Prisma

Este guia detalha o processo de migração do sistema de gestão de frotas de arquivos JSON para PostgreSQL com Prisma ORM.

## Pré-requisitos

- Docker Desktop instalado e em execução
- Node.js versão 14 ou superior
- Dados existentes em `data/*.json` (backup automático será criado)

## Passo a Passo

### 1. Garantir Docker Desktop Rodando

Certifique-se que o Docker Desktop está rodando no seu sistema Windows.

### 2. Iniciar PostgreSQL com Docker

```bash
npm run docker:up
```

Isso iniciará um container PostgreSQL com:
- Usuário: `frotas_admin`
- Senha: `frotas_senha_segura_2024`
- Database: `frotas_db`
- Porta: `5432`

Para verificar se está rodando:
```bash
docker ps
```

### 3. Aplicar Migrations do Prisma

```bash
npm run prisma:migrate
```

Quando solicitado o nome da migration, use: `init`

Isso criará todas as tabelas no PostgreSQL:
- `veiculos`
- `motoristas`
- `viagens`
- `abastecimentos`
- `manutencoes`
- `trocas_pneus`
- `trocas_oleo`
- `revisoes`

### 4. Gerar Prisma Client

```bash
npm run prisma:generate
```

### 5. Migrar Dados do JSON para PostgreSQL

```bash
npm run migrate:data
```

Este script irá:
1. Criar backup automático dos JSONs em `data/backup/`
2. Ler todos os dados de `data/*.json`
3. Inserir no PostgreSQL mantendo relacionamentos
4. Exibir logs detalhados do processo

**Importante:** Os arquivos JSON originais NÃO serão deletados. Eles permanecerão como backup.

### 6. Verificar Dados Migrados

Use o Prisma Studio para visualizar os dados:

```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

### 7. Iniciar o Servidor

```bash
npm start
```

ou para desenvolvimento com hot-reload:

```bash
npm run dev
```

## Estrutura Migrada

### Antes (JSON)
```
data/
  ├── frota.json          (veículos + registros aninhados)
  ├── motoristas.json     (dados de motoristas)
  └── viagens.json        (histórico de viagens)
```

### Depois (PostgreSQL)
```
Database: frotas_db
  ├── veiculos           (dados básicos dos veículos)
  ├── motoristas         (dados dos motoristas)
  ├── viagens            (histórico de viagens)
  ├── abastecimentos     (registros de abastecimento)
  ├── manutencoes        (registros de manutenção)
  ├── trocas_pneus       (registros de troca de pneus)
  ├── trocas_oleo        (registros de troca de óleo)
  └── revisoes           (registros de revisões)
```

## Relacionamentos

- `Veiculo` 1:N `Abastecimento`, `Manutencao`, `TrocaPneu`, `TrocaOleo`, `Revisao`, `Viagem`
- `Motorista` 1:N `Abastecimento`, `Manutencao`, `TrocaPneu`, `TrocaOleo`, `Revisao`, `Viagem`

## Comandos Úteis

### Parar PostgreSQL
```bash
npm run docker:down
```

### Ver logs do PostgreSQL
```bash
npm run docker:logs
```

### Acessar banco de dados diretamente
```bash
docker exec -it frotas-postgres psql -U frotas_admin -d frotas_db
```

### Resetar database (CUIDADO!)
```bash
npx prisma migrate reset
```

## Troubleshooting

### Docker não inicia
- Verifique se o Docker Desktop está rodando
- Verifique se a porta 5432 não está sendo usada: `netstat -ano | findstr :5432`

### Erro na migration
- Certifique-se que o PostgreSQL está rodando
- Verifique as credenciais no arquivo `.env`
- Tente: `npx prisma migrate reset` e recomece

### Erro ao migrar dados
- Verifique os logs detalhados no console
- Os backups estão em `data/backup/`
- Você pode executar o script novamente (ele não duplicará dados se a tabela estiver vazia)

### API não funciona após migração
- Verifique se o Prisma Client foi gerado: `npm run prisma:generate`
- Reinicie o servidor
- Verifique os logs do servidor

## Rollback

Se precisar voltar para JSON:

1. Pare o servidor
2. Os arquivos JSON originais estão em `data/`
3. Os backups estão em `data/backup/`
4. Restaure o código antigo do Git se necessário

## Performance

O PostgreSQL oferece:
- ✅ Queries mais rápidas com índices
- ✅ Transações ACID
- ✅ Relacionamentos nativos
- ✅ Escalabilidade
- ✅ Backup e recovery profissionais

## Próximos Passos

Após migração bem-sucedida:

1. Teste todas as funcionalidades da API
2. Teste o frontend
3. Valide os cálculos de consumo e custos
4. Configure backup automático do PostgreSQL
5. Em produção, use variáveis de ambiente seguras
