/*
  Warnings:

  - You are about to drop the column `type` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "type",
ADD COLUMN     "role" "userType" NOT NULL DEFAULT 'user';
