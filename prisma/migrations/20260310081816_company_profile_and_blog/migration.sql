-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "aboutUsContent" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPageContent" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "footerCopyright" TEXT,
ADD COLUMN     "footerTagline" TEXT,
ADD COLUMN     "headerNavItems" JSONB,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "showTopBar" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "siteName" TEXT,
ADD COLUMN     "socialLinks" JSONB;

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");
