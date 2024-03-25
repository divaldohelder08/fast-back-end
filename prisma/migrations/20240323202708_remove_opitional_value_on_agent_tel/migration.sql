/*
  Warnings:

  - Made the column `telefone` on table `Agents` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Agents" ALTER COLUMN "telefone" SET NOT NULL;
