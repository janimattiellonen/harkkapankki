-- CreateTable
CREATE TABLE "exercise_type_groups" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_type_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_type_group_translations" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_type_group_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_type_group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "exercise_type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_type_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_translations" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_duration_configs" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "sessionLength" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_duration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_exercise_types" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "exercise_type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_exercise_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercise_type_groups_slug_key" ON "exercise_type_groups"("slug");

-- CreateIndex
CREATE INDEX "exercise_type_group_translations_language_idx" ON "exercise_type_group_translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_type_group_translations_group_id_language_key" ON "exercise_type_group_translations"("group_id", "language");

-- CreateIndex
CREATE INDEX "exercise_type_group_members_group_id_idx" ON "exercise_type_group_members"("group_id");

-- CreateIndex
CREATE INDEX "exercise_type_group_members_exercise_type_id_idx" ON "exercise_type_group_members"("exercise_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_type_group_members_group_id_exercise_type_id_key" ON "exercise_type_group_members"("group_id", "exercise_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "sections_slug_key" ON "sections"("slug");

-- CreateIndex
CREATE INDEX "sections_order_idx" ON "sections"("order");

-- CreateIndex
CREATE INDEX "section_translations_language_idx" ON "section_translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "section_translations_section_id_language_key" ON "section_translations"("section_id", "language");

-- CreateIndex
CREATE INDEX "section_duration_configs_sessionLength_idx" ON "section_duration_configs"("sessionLength");

-- CreateIndex
CREATE UNIQUE INDEX "section_duration_configs_section_id_sessionLength_key" ON "section_duration_configs"("section_id", "sessionLength");

-- CreateIndex
CREATE INDEX "section_exercise_types_section_id_idx" ON "section_exercise_types"("section_id");

-- CreateIndex
CREATE INDEX "section_exercise_types_exercise_type_id_idx" ON "section_exercise_types"("exercise_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "section_exercise_types_section_id_exercise_type_id_key" ON "section_exercise_types"("section_id", "exercise_type_id");

-- AddForeignKey
ALTER TABLE "exercise_type_group_translations" ADD CONSTRAINT "exercise_type_group_translations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "exercise_type_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_type_group_members" ADD CONSTRAINT "exercise_type_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "exercise_type_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_type_group_members" ADD CONSTRAINT "exercise_type_group_members_exercise_type_id_fkey" FOREIGN KEY ("exercise_type_id") REFERENCES "exercise_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_translations" ADD CONSTRAINT "section_translations_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_duration_configs" ADD CONSTRAINT "section_duration_configs_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_exercise_types" ADD CONSTRAINT "section_exercise_types_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_exercise_types" ADD CONSTRAINT "section_exercise_types_exercise_type_id_fkey" FOREIGN KEY ("exercise_type_id") REFERENCES "exercise_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
