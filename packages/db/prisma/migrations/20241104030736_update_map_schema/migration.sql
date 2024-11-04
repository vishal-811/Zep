/*
  Warnings:

  - Made the column `width` on table `Map` required. This step will fail if there are existing NULL values in that column.
  - Made the column `height` on table `Map` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Map" ALTER COLUMN "width" SET NOT NULL,
ALTER COLUMN "height" SET NOT NULL;
