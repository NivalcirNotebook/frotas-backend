-- CreateEnum
CREATE TYPE "StatusMulta" AS ENUM ('PENDENTE', 'PAGA', 'EM_RECURSO', 'CANCELADA');

-- CreateTable
CREATE TABLE "multas" (
    "id" SERIAL NOT NULL,
    "veiculoId" INTEGER NOT NULL,
    "motoristaId" INTEGER,
    "dataInfracao" TEXT NOT NULL,
    "tipoMulta" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorMulta" DOUBLE PRECISION NOT NULL,
    "pontosCNH" INTEGER NOT NULL DEFAULT 0,
    "numeroAuto" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "status" "StatusMulta" NOT NULL DEFAULT 'PENDENTE',
    "dataVencimento" TEXT NOT NULL,
    "dataPagamento" TEXT,
    "valorPago" DOUBLE PRECISION,
    "observacoes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "multas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "multas_veiculoId_idx" ON "multas"("veiculoId");

-- CreateIndex
CREATE INDEX "multas_motoristaId_idx" ON "multas"("motoristaId");

-- CreateIndex
CREATE INDEX "multas_dataInfracao_idx" ON "multas"("dataInfracao");

-- CreateIndex
CREATE INDEX "multas_status_idx" ON "multas"("status");

-- AddForeignKey
ALTER TABLE "multas" ADD CONSTRAINT "multas_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multas" ADD CONSTRAINT "multas_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "motoristas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
