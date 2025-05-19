/*
  Warnings:

  - Added the required column `exercise_type_id` to the `exercises` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "exercise_type_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "exercise_types" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_type_translations" (
    "id" TEXT NOT NULL,
    "exercise_type_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_type_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercise_types_slug_key" ON "exercise_types"("slug");

-- CreateIndex
CREATE INDEX "exercise_types_parentId_idx" ON "exercise_types"("parentId");

-- CreateIndex
CREATE INDEX "exercise_type_translations_language_idx" ON "exercise_type_translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_type_translations_exercise_type_id_language_key" ON "exercise_type_translations"("exercise_type_id", "language");

-- CreateIndex
CREATE INDEX "exercises_exercise_type_id_idx" ON "exercises"("exercise_type_id");

-- AddForeignKey
ALTER TABLE "exercise_types" ADD CONSTRAINT "exercise_types_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "exercise_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_type_translations" ADD CONSTRAINT "exercise_type_translations_exercise_type_id_fkey" FOREIGN KEY ("exercise_type_id") REFERENCES "exercise_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_exercise_type_id_fkey" FOREIGN KEY ("exercise_type_id") REFERENCES "exercise_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
