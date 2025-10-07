-- AlterTable: Add slug column to exercises (nullable first)
ALTER TABLE "exercises" ADD COLUMN "slug" TEXT;

-- AlterTable: Add slug column to practice_sessions (nullable first)
ALTER TABLE "practice_sessions" ADD COLUMN "slug" TEXT;

-- Generate slugs for existing exercises
-- This PostgreSQL function creates URL-safe slugs from exercise names
UPDATE "exercises"
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM("name"),
        '[\s_]+', '-', 'g'
      ),
      '[^a-z0-9\-_]', '', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE "slug" IS NULL;

-- Handle duplicate slugs for exercises by appending a counter
WITH ranked_exercises AS (
  SELECT
    id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM "exercises"
)
UPDATE "exercises" e
SET slug = re.slug || '-' || re.rn
FROM ranked_exercises re
WHERE e.id = re.id AND re.rn > 1;

-- Generate slugs for existing practice sessions
-- If name is null, use 'practice-session' as base
UPDATE "practice_sessions"
SET "slug" = CASE
  WHEN "name" IS NOT NULL AND TRIM("name") != '' THEN
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            TRIM("name"),
            '[\s_]+', '-', 'g'
          ),
          '[^a-z0-9\-_]', '', 'g'
        ),
        '-+', '-', 'g'
      )
    )
  ELSE
    'practice-session'
  END
WHERE "slug" IS NULL;

-- Handle duplicate slugs for practice sessions by appending a counter
WITH ranked_sessions AS (
  SELECT
    id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
  FROM "practice_sessions"
)
UPDATE "practice_sessions" ps
SET slug = CASE
  WHEN rs.rn > 1 THEN rs.slug || '-' || rs.rn
  ELSE rs.slug
END
FROM ranked_sessions rs
WHERE ps.id = rs.id AND rs.rn > 1;

-- Create unique indexes
CREATE UNIQUE INDEX "exercises_slug_key" ON "exercises"("slug");
CREATE UNIQUE INDEX "practice_sessions_slug_key" ON "practice_sessions"("slug");

-- Make slug columns NOT NULL
ALTER TABLE "exercises" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "practice_sessions" ALTER COLUMN "slug" SET NOT NULL;
