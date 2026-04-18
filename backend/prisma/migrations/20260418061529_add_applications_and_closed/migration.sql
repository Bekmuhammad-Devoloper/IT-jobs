-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "is_closed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "applications" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT,
    "resume_url" TEXT,
    "portfolio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_post_id_user_id_key" ON "applications"("post_id", "user_id");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
