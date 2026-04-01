/*
  Warnings:

  - A unique constraint covering the columns `[practice_session_id,section_id,exercise_type_id,exercise_id]` on the table `practice_session_section_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "practice_session_section_items_practice_session_id_section__key";

-- AlterTable
ALTER TABLE "practice_session_section_items" ADD COLUMN     "exercise_id" TEXT;

-- CreateIndex
CREATE INDEX "practice_session_section_items_exercise_id_idx" ON "practice_session_section_items"("exercise_id");

-- CreateIndex
CREATE UNIQUE INDEX "practice_session_section_items_practice_session_id_section__key" ON "practice_session_section_items"("practice_session_id", "section_id", "exercise_type_id", "exercise_id");

-- AddForeignKey
ALTER TABLE "practice_session_section_items" ADD CONSTRAINT "practice_session_section_items_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;
