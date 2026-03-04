/*
  Warnings:

  - You are about to drop the column `access_token` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `providerAccountId` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `admin_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `admin_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `admin_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `admin_sessions` table. All the data in the column will be lost.
  - The `role` column on the `admin_users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[providerId,accountId]` on the table `admin_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `admin_sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `admin_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `admin_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `admin_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "admin_accounts_provider_providerAccountId_key";

-- DropIndex
DROP INDEX "admin_sessions_sessionToken_key";

-- AlterTable
ALTER TABLE "admin_accounts" DROP COLUMN "access_token",
DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "provider",
DROP COLUMN "providerAccountId",
DROP COLUMN "refresh_token",
DROP COLUMN "token_type",
DROP COLUMN "type",
DROP COLUMN "updated_at",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "idToken" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "providerId" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "admin_sessions" DROP COLUMN "created_at",
DROP COLUMN "expires",
DROP COLUMN "sessionToken",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'READ_ONLY';

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companion" TEXT,
    "storageUsed" INTEGER NOT NULL DEFAULT 0,
    "toursEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechWatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#7C3AED',
    "accentColor" TEXT,
    "iconEmoji" TEXT,
    "rssUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoUrl" TEXT,
    "githubStars" INTEGER,
    "githubUrl" TEXT,

    CONSTRAINT "TechWatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "techWatchId" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Nouvelle conversation',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companion" TEXT,
    "status" TEXT NOT NULL DEFAULT 'idle',

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolInvocations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readTime" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEntry" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "eolDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "highlights" TEXT[],
    "blogUrl" TEXT,
    "cveCount" INTEGER,
    "cveIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "impactScore" INTEGER,
    "isStable" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "type" TEXT NOT NULL DEFAULT 'MINOR',

    CONSTRAINT "TimelineEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "official" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "filePath" TEXT,
    "fileSize" INTEGER,
    "folderId" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "name" TEXT,
    "previewUrl" TEXT,
    "userId" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "techWatchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "pinned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickLink" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuickLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MindMapNode" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "color" TEXT,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 48,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 144,

    CONSTRAINT "MindMapNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MindMapEdge" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,

    CONSTRAINT "MindMapEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MindMapNote" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 400,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 300,
    "color" TEXT,

    CONSTRAINT "MindMapNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapNode" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 220,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 64,
    "status" TEXT NOT NULL DEFAULT 'not-started',
    "masteryScore" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoadmapNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapEdge" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'prerequisite',

    CONSTRAINT "RoadmapEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT,
    "level" TEXT,
    "obtainedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "score" TEXT,
    "credentialId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vsName" TEXT NOT NULL,
    "vsColor" TEXT NOT NULL DEFAULT '#6B7280',
    "vsLogoUrl" TEXT,
    "criteria" JSONB NOT NULL,
    "mainPros" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mainCons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vsPros" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vsCons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mainUseWhen" TEXT,
    "vsUseWhen" TEXT,
    "summary" TEXT,
    "verdict" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'groq',
    "apiKey" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "searchApiKey" TEXT,
    "searchProvider" TEXT,
    "youtubeApiKey" TEXT,

    CONSTRAINT "AiConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "companion" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "level" TEXT NOT NULL DEFAULT 'débutant',
    "tags" TEXT[],
    "coverImage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "similarLinks" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT,
    "companionNote" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSection" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "duration" INTEGER,

    CONSTRAINT "CourseSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseQuiz" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "answer" INTEGER NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "CourseQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedSections" TEXT[],
    "quizScores" JSONB NOT NULL DEFAULT '{}',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articles" INTEGER NOT NULL DEFAULT 0,
    "tasks" INTEGER NOT NULL DEFAULT 0,
    "resources" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletedTour" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tourKey" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompletedTour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snippet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "techWatchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "technology" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'plaintext',
    "code" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "executionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Snippet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TechWatch_userId_slug_key" ON "TechWatch"("userId", "slug");

-- CreateIndex
CREATE INDEX "Resource_techWatchId_idx" ON "Resource"("techWatchId");

-- CreateIndex
CREATE INDEX "Resource_folderId_idx" ON "Resource"("folderId");

-- CreateIndex
CREATE INDEX "Resource_userId_idx" ON "Resource"("userId");

-- CreateIndex
CREATE INDEX "Folder_techWatchId_idx" ON "Folder"("techWatchId");

-- CreateIndex
CREATE INDEX "Folder_userId_idx" ON "Folder"("userId");

-- CreateIndex
CREATE INDEX "Folder_parentId_idx" ON "Folder"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "AiConfig_userId_key" ON "AiConfig"("userId");

-- CreateIndex
CREATE INDEX "Course_techWatchId_idx" ON "Course"("techWatchId");

-- CreateIndex
CREATE INDEX "CourseSection_courseId_idx" ON "CourseSection"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_courseId_userId_key" ON "CourseEnrollment"("courseId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityLog_techWatchId_date_key" ON "ActivityLog"("techWatchId", "date");

-- CreateIndex
CREATE INDEX "CompletedTour_userId_idx" ON "CompletedTour"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompletedTour_userId_tourKey_key" ON "CompletedTour"("userId", "tourKey");

-- CreateIndex
CREATE INDEX "Snippet_userId_idx" ON "Snippet"("userId");

-- CreateIndex
CREATE INDEX "Snippet_technology_idx" ON "Snippet"("technology");

-- CreateIndex
CREATE INDEX "Snippet_techWatchId_idx" ON "Snippet"("techWatchId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_accounts_providerId_accountId_key" ON "admin_accounts"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_key" ON "admin_sessions"("token");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechWatch" ADD CONSTRAINT "TechWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEntry" ADD CONSTRAINT "TimelineEntry_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickLink" ADD CONSTRAINT "QuickLink_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindMapNode" ADD CONSTRAINT "MindMapNode_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindMapEdge" ADD CONSTRAINT "MindMapEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "MindMapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindMapEdge" ADD CONSTRAINT "MindMapEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "MindMapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindMapEdge" ADD CONSTRAINT "MindMapEdge_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindMapNote" ADD CONSTRAINT "MindMapNote_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapNode" ADD CONSTRAINT "RoadmapNode_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapEdge" ADD CONSTRAINT "RoadmapEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "RoadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapEdge" ADD CONSTRAINT "RoadmapEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "RoadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapEdge" ADD CONSTRAINT "RoadmapEdge_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSection" ADD CONSTRAINT "CourseSection_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQuiz" ADD CONSTRAINT "CourseQuiz_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "CourseSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snippet" ADD CONSTRAINT "Snippet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snippet" ADD CONSTRAINT "Snippet_techWatchId_fkey" FOREIGN KEY ("techWatchId") REFERENCES "TechWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
