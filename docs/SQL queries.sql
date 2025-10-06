-- Here's an SQL query to get exercise types that belong to the 'exercise-form' group:

  SELECT
    et.id,
    et.slug,
    ett.language,
    ett.name,
    ett.description
  FROM exercise_types et
  INNER JOIN exercise_type_group_members etgm
    ON et.id = etgm.exercise_type_id
  INNER JOIN exercise_type_groups etg
    ON etgm.group_id = etg.id
  LEFT JOIN exercise_type_translations ett
    ON et.id = ett.exercise_type_id
  WHERE etg.slug = 'practice-session-form'
  AND ett.language = 'en'
  ORDER BY ett.language, et.slug;

-- If you only want English translations:

  SELECT
    et.id,
    et.slug,
    ett.name,
    ett.description
  FROM exercise_types et
  INNER JOIN exercise_type_group_members etgm
    ON et.id = etgm.exercise_type_id
  INNER JOIN exercise_type_groups etg
    ON etgm.group_id = etg.id
  LEFT JOIN exercise_type_translations ett
    ON et.id = ett.exercise_type_id AND ett.language = 'en'
  WHERE etg.slug = 'exercise-form'
  ORDER BY et.slug;

-- Or if you want to include parent/child hierarchy information:

  SELECT
    et.id,
    et.slug,
    ett.name,
    parent_et.slug as parent_slug,
    parent_ett.name as parent_name
  FROM exercise_types et
  INNER JOIN exercise_type_group_members etgm
    ON et.id = etgm.exercise_type_id
  INNER JOIN exercise_type_groups etg
    ON etgm.group_id = etg.id
  LEFT JOIN exercise_type_translations ett
    ON et.id = ett.exercise_type_id AND ett.language = 'en'
  LEFT JOIN exercise_types parent_et
    ON et.parent_id = parent_et.id
  LEFT JOIN exercise_type_translations parent_ett
    ON parent_et.id = parent_ett.exercise_type_id AND parent_ett.language = 'en'
  WHERE etg.slug = 'exercise-form'
  ORDER BY COALESCE(parent_et.slug, et.slug), et.slug;

-- Would you like me to test one of these queries against your database to verify the results?
