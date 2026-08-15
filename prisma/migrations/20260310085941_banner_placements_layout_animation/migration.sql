-- CreateEnum
CREATE TYPE "BannerPlacement" AS ENUM ('HOME_HERO', 'HOME_PROMO_GRID', 'CATEGORY_TOP', 'CATEGORY_SIDEBAR', 'PRODUCT_PAGE', 'CART_PROMO', 'FOOTER_STRIP');

-- CreateEnum
CREATE TYPE "BannerLayout" AS ENUM ('FULL_WIDTH', 'CARD', 'BOX');

-- CreateEnum
CREATE TYPE "BannerAnimation" AS ENUM ('NONE', 'FADE', 'SLIDE', 'ZOOM');

-- AlterTable
ALTER TABLE "AdBanner" ADD COLUMN     "animation" "BannerAnimation" DEFAULT 'NONE',
ADD COLUMN     "layout" "BannerLayout",
ADD COLUMN     "placement" "BannerPlacement" NOT NULL DEFAULT 'HOME_HERO';

-- CreateIndex
CREATE INDEX "AdBanner_placement_idx" ON "AdBanner"("placement");
