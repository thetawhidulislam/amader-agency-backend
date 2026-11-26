/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `TeamMember` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "about" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_slug_key" ON "TeamMember"("slug");
