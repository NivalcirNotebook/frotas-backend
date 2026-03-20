-- CreateTable
CREATE TABLE "veiculos" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "kmAtual" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motoristas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cnh" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataCadastro" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motoristas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viagens" (
    "id" SERIAL NOT NULL,
    "motoristaId" INTEGER NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "dataHoraSaida" TEXT NOT NULL,
    "dataHoraChegada" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "horarioSaida" TEXT NOT NULL,
    "horarioChegada" TEXT NOT NULL,
    "kmSaida" DOUBLE PRECISION NOT NULL,
    "kmChegada" DOUBLE PRECISION NOT NULL,
    "kmPercorridos" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abastecimentos" (
    "id" SERIAL NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "motoristaId" INTEGER,
    "data" TEXT NOT NULL,
    "km" INTEGER NOT NULL,
    "litros" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "valorPorLitro" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abastecimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manutencoes" (
    "id" SERIAL NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "motoristaId" INTEGER,
    "data" TEXT NOT NULL,
    "km" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manutencoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trocas_pneus" (
    "id" SERIAL NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "motoristaId" INTEGER,
    "data" TEXT NOT NULL,
    "km" INTEGER NOT NULL,
    "eixo" TEXT NOT NULL DEFAULT '',
    "posicao" TEXT NOT NULL DEFAULT '',
    "quantidade" INTEGER NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trocas_pneus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trocas_oleo" (
    "id" SERIAL NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "motoristaId" INTEGER,
    "data" TEXT NOT NULL,
    "km" INTEGER NOT NULL,
    "tipoOleo" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "filtroOleo" BOOLEAN NOT NULL DEFAULT false,
    "filtroAr" BOOLEAN NOT NULL DEFAULT false,
    "filtroCombustivel" BOOLEAN NOT NULL DEFAULT false,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "observacoes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trocas_oleo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revisoes" (
    "id" SERIAL NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "motoristaId" INTEGER,
    "data" TEXT NOT NULL,
    "km" INTEGER NOT NULL,
    "tipoRevisao" TEXT NOT NULL,
    "itensRevisados" JSONB NOT NULL DEFAULT '{}',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "proximaRevisao" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revisoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");

-- CreateIndex
CREATE INDEX "veiculos_placa_idx" ON "veiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "motoristas_cnh_key" ON "motoristas"("cnh");

-- CreateIndex
CREATE INDEX "motoristas_cnh_idx" ON "motoristas"("cnh");

-- CreateIndex
CREATE INDEX "motoristas_ativo_idx" ON "motoristas"("ativo");

-- CreateIndex
CREATE INDEX "viagens_motoristaId_idx" ON "viagens"("motoristaId");

-- CreateIndex
CREATE INDEX "viagens_veiculoId_idx" ON "viagens"("veiculoId");

-- CreateIndex
CREATE INDEX "viagens_data_idx" ON "viagens"("data");

-- CreateIndex
CREATE INDEX "abastecimentos_veiculoId_idx" ON "abastecimentos"("veiculoId");

-- CreateIndex
CREATE INDEX "abastecimentos_motoristaId_idx" ON "abastecimentos"("motoristaId");

-- CreateIndex
CREATE INDEX "abastecimentos_data_idx" ON "abastecimentos"("data");

-- CreateIndex
CREATE INDEX "manutencoes_veiculoId_idx" ON "manutencoes"("veiculoId");

-- CreateIndex
CREATE INDEX "manutencoes_motoristaId_idx" ON "manutencoes"("motoristaId");

-- CreateIndex
CREATE INDEX "manutencoes_data_idx" ON "manutencoes"("data");

-- CreateIndex
CREATE INDEX "trocas_pneus_veiculoId_idx" ON "trocas_pneus"("veiculoId");

-- CreateIndex
CREATE INDEX "trocas_pneus_motoristaId_idx" ON "trocas_pneus"("motoristaId");

-- CreateIndex
CREATE INDEX "trocas_pneus_data_idx" ON "trocas_pneus"("data");

-- CreateIndex
CREATE INDEX "trocas_oleo_veiculoId_idx" ON "trocas_oleo"("veiculoId");

-- CreateIndex
CREATE INDEX "trocas_oleo_motoristaId_idx" ON "trocas_oleo"("motoristaId");

-- CreateIndex
CREATE INDEX "trocas_oleo_data_idx" ON "trocas_oleo"("data");

-- CreateIndex
CREATE INDEX "revisoes_veiculoId_idx" ON "revisoes"("veiculoId");

-- CreateIndex
CREATE INDEX "revisoes_motoristaId_idx" ON "revisoes"("motoristaId");

-- CreateIndex
CREATE INDEX "revisoes_data_idx" ON "revisoes"("data");

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "motoristas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abastecimentos" ADD CONSTRAINT "abastecimentos_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abastecimentos" ADD CONSTRAINT "abastecimentos_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "motoristas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manutencoes" ADD CONSTRAINT "manutencoes_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manutencoes" ADD CONSTRAINT "manutencoes_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "motoristas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trocas_pneus" ADD CONSTRAINT "trocas_pneus_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trocas_pneus" ADD CONSTRAINT "trocas_pneus_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "motoristas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trocas_oleo" ADD CONSTRAINT "trocas_oleo_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trocas_oleo" ADD CONSTRAINT "trocas_oleo_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "motoristas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisoes" ADD CONSTRAINT "revisoes_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisoes" ADD CONSTRAINT "revisoes_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "motoristas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
