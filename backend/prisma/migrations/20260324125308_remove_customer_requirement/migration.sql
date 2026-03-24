-- DropForeignKey
ALTER TABLE "ExchangedItem" DROP CONSTRAINT "ExchangedItem_customerId_fkey";

-- AlterTable
ALTER TABLE "ExchangedItem" ALTER COLUMN "customerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ExchangedItem" ADD CONSTRAINT "ExchangedItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
