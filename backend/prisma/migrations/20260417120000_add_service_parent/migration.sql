-- AlterTable
ALTER TABLE "services" ADD COLUMN "parent_id" INTEGER;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
