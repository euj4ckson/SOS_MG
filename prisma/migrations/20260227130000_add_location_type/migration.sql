-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('SHELTER', 'DONATION_POINT');

-- AlterTable
ALTER TABLE "Shelter"
ADD COLUMN "type" "LocationType" NOT NULL DEFAULT 'SHELTER';

-- CreateIndex
CREATE INDEX "Shelter_type_idx" ON "Shelter"("type");
