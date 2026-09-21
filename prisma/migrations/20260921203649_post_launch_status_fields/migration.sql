-- CreateEnum
CREATE TYPE "RecipeImportStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "RecipeImageStatus" AS ENUM ('NONE', 'GENERATING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "imageError" TEXT,
ADD COLUMN     "imageStatus" "RecipeImageStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "importError" TEXT,
ADD COLUMN     "importStatus" "RecipeImportStatus" NOT NULL DEFAULT 'READY';

-- AlterTable
ALTER TABLE "ShoppingList" ADD COLUMN     "completedAt" TIMESTAMP(3);
