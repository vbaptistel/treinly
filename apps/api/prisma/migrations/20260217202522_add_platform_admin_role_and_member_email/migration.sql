/*
  Warnings:

  - Added the required column `email` to the `tenant_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "role" ADD VALUE 'PLATFORM_ADMIN';

-- AlterTable
ALTER TABLE "tenant_users" ADD COLUMN     "email" TEXT NOT NULL;
