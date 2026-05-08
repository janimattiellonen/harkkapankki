-- CreateTable
CREATE TABLE "practice_session_retrospectives" (
    "id" TEXT NOT NULL,
    "practice_session_id" TEXT NOT NULL,
    "participant_count" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "went_well" TEXT,
    "improvements" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_session_retrospectives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "practice_session_retrospectives_practice_session_id_key" ON "practice_session_retrospectives"("practice_session_id");

-- AddForeignKey
ALTER TABLE "practice_session_retrospectives" ADD CONSTRAINT "practice_session_retrospectives_practice_session_id_fkey" FOREIGN KEY ("practice_session_id") REFERENCES "practice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
