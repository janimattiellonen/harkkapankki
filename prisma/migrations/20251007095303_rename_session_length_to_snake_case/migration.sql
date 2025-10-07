-- Rename sessionLength to session_length in section_duration_configs table
ALTER TABLE "section_duration_configs" RENAME COLUMN "sessionLength" TO "session_length";

-- Rename sessionLength to session_length in practice_sessions table
ALTER TABLE "practice_sessions" RENAME COLUMN "sessionLength" TO "session_length";

-- Drop and recreate index for section_duration_configs
DROP INDEX IF EXISTS "section_duration_configs_sessionLength_idx";
CREATE INDEX "section_duration_configs_session_length_idx" ON "section_duration_configs"("session_length");

-- Drop and recreate unique constraint for section_duration_configs
ALTER TABLE "section_duration_configs" DROP CONSTRAINT IF EXISTS "section_duration_configs_section_id_sessionLength_key";
ALTER TABLE "section_duration_configs" ADD CONSTRAINT "section_duration_configs_section_id_session_length_key" UNIQUE("section_id", "session_length");
