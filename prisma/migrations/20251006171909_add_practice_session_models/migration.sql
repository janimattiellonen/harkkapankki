-- CreateTable
CREATE TABLE "practice_sessions" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "sessionLength" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_session_section_items" (
    "id" TEXT NOT NULL,
    "practice_session_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "exercise_type_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_session_section_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "practice_session_section_items_practice_session_id_idx" ON "practice_session_section_items"("practice_session_id");

-- CreateIndex
CREATE INDEX "practice_session_section_items_section_id_idx" ON "practice_session_section_items"("section_id");

-- CreateIndex
CREATE INDEX "practice_session_section_items_exercise_type_id_idx" ON "practice_session_section_items"("exercise_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "practice_session_section_items_practice_session_id_section__key" ON "practice_session_section_items"("practice_session_id", "section_id", "exercise_type_id");

-- AddForeignKey
ALTER TABLE "practice_session_section_items" ADD CONSTRAINT "practice_session_section_items_practice_session_id_fkey" FOREIGN KEY ("practice_session_id") REFERENCES "practice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_session_section_items" ADD CONSTRAINT "practice_session_section_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_session_section_items" ADD CONSTRAINT "practice_session_section_items_exercise_type_id_fkey" FOREIGN KEY ("exercise_type_id") REFERENCES "exercise_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
