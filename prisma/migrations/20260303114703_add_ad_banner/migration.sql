-- CreateEnum
CREATE TYPE "BannerLinkType" AS ENUM ('TAG', 'CATEGORY', 'PRODUCT');

-- CreateTable
CREATE TABLE "AdBanner" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "linkType" "BannerLinkType" NOT NULL,
    "linkSlug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdBanner_pkey" PRIMARY KEY ("id")
);
