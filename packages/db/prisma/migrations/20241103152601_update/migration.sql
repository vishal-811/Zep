/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Avatar` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Avatar" ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_id_key" ON "Avatar"("id");
