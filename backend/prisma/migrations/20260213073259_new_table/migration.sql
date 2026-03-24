-- AlterTable
ALTER TABLE "ExchangedItem" ADD COLUMN     "saleId" TEXT;

-- AddForeignKey
ALTER TABLE "ExchangedItem" ADD CONSTRAINT "ExchangedItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
