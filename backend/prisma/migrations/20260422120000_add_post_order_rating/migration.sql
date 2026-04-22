-- AlterTable
ALTER TABLE "posts" ADD COLUMN "pinned_order" INTEGER;
ALTER TABLE "posts" ADD COLUMN "rating" DECIMAL(3,1) NOT NULL DEFAULT 0;
