/*
  Warnings:

  - You are about to drop the column `interval` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the `admin_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admin_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admin_users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeMonthlyPriceId]` on the table `plans` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeYearlyPriceId]` on the table `plans` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "admin_accounts" DROP CONSTRAINT "admin_accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "admin_sessions" DROP CONSTRAINT "admin_sessions_userId_fkey";

-- AlterTable
ALTER TABLE "AiConfig" ADD COLUMN     "baseUrl" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pricePaid" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "plans" DROP COLUMN "interval",
DROP COLUMN "price",
ADD COLUMN     "monthlyPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripeMonthlyPriceId" TEXT,
ADD COLUMN     "stripeProductId" TEXT,
ADD COLUMN     "stripeYearlyPriceId" TEXT,
ADD COLUMN     "trialPeriodDays" INTEGER DEFAULT 0,
ADD COLUMN     "yearlyPrice" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isPremiumLifetime" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER',
ADD COLUMN     "stripeCustomerId" TEXT;

-- DropTable
DROP TABLE "admin_accounts";

-- DropTable
DROP TABLE "admin_sessions";

-- DropTable
DROP TABLE "admin_users";

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "plans_stripeMonthlyPriceId_key" ON "plans"("stripeMonthlyPriceId");

-- CreateIndex
CREATE UNIQUE INDEX "plans_stripeYearlyPriceId_key" ON "plans"("stripeYearlyPriceId");

-- CreateIndex
CREATE UNIQUE INDEX "user_stripeCustomerId_key" ON "user"("stripeCustomerId");
