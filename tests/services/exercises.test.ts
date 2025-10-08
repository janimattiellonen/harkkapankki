import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../setup/db-setup';
import { createExerciseType } from '../setup/test-helpers';
import {
  createExercise,
  fetchExerciseById,
  updateExercise,
  fetchExercises,
  deleteExercise,
} from '~/services/exercises.server';
import type { ExerciseInput } from '~/services/exercises.server';

describe('Exercise Service - createExercise', () => {
  let puttingTypeId: string;

  // Setup: Create exercise type before each test
  beforeEach(async () => {
    const technique = await createExerciseType('technique', { fi: 'Tekniikka', en: 'Technique' });

    const putting = await createExerciseType(
      'putting',
      { fi: 'Puttaaminen', en: 'Putting' },
      technique.id
    );

    puttingTypeId = putting.id;
  });

  it('should create a new exercise with valid data', async () => {
    // Arrange: Prepare test data
    const exerciseData: ExerciseInput = {
      name: 'Circle Putting Drill',
      description: 'Practice putting from all angles',
      content: '1. Place 8 putts in a circle\n2. Make each putt\n3. Repeat',
      duration: 20,
      exerciseTypeId: puttingTypeId,
      youtubeVideo: 'https://youtube.com/watch?v=example',
      image: null,
    };

    // Act: Execute the function being tested
    const createdExercise = await createExercise(exerciseData);

    // Assert: Verify the exercise was created correctly
    expect(createdExercise).toBeDefined();
    expect(createdExercise.id).toBeTruthy(); // Has a UUID
    expect(createdExercise.name).toBe('Circle Putting Drill');
    expect(createdExercise.description).toBe('Practice putting from all angles');
    expect(createdExercise.content).toBe(
      '1. Place 8 putts in a circle\n2. Make each putt\n3. Repeat'
    );
    expect(createdExercise.duration).toBe(20);
    expect(createdExercise.exerciseTypeId).toBe(puttingTypeId);
    expect(createdExercise.youtubeVideo).toBe('https://youtube.com/watch?v=example');
    expect(createdExercise.image).toBeNull();
    expect(createdExercise.createdAt).toBeInstanceOf(Date);
    expect(createdExercise.updatedAt).toBeInstanceOf(Date);

    // Verify it's actually in the database
    const dbExercise = await db.exercise.findUnique({
      where: { id: createdExercise.id },
    });

    expect(dbExercise).not.toBeNull();
    expect(dbExercise?.name).toBe('Circle Putting Drill');
  });

  it('should handle optional fields correctly', async () => {
    const exerciseData: ExerciseInput = {
      name: 'Quick Drill',
      content: 'Just throw',
      duration: 5,
      exerciseTypeId: puttingTypeId,
    };

    const createdExercise = await createExercise(exerciseData);

    expect(createdExercise.description).toBeNull();
    expect(createdExercise.youtubeVideo).toBeNull();
    expect(createdExercise.image).toBeNull();
  });

  it('should fail when exercise type does not exist', async () => {
    const exerciseData: ExerciseInput = {
      name: 'Invalid Exercise',
      content: 'Test',
      duration: 10,
      exerciseTypeId: 'non-existent-id',
    };

    await expect(createExercise(exerciseData)).rejects.toThrow();
  });
});

describe('Exercise Service - updateExercise', () => {
  let puttingTypeId: string;
  let backhandTypeId: string;
  let existingExerciseId: string;

  beforeEach(async () => {
    const technique = await createExerciseType('technique', { fi: 'Tekniikka', en: 'Technique' });

    const putting = await createExerciseType(
      'putting',
      { fi: 'Puttaaminen', en: 'Putting' },
      technique.id
    );

    const backhand = await createExerciseType(
      'backhand',
      { fi: 'Rystyheitto', en: 'Backhand' },
      technique.id
    );

    puttingTypeId = putting.id;
    backhandTypeId = backhand.id;

    // Create an exercise to update
    const exercise = await createExercise({
      name: 'Original Exercise',
      content: 'Original content',
      duration: 10,
      exerciseTypeId: puttingTypeId,
    });

    existingExerciseId = exercise.id;
  });

  it('should update an existing exercise', async () => {
    const updateData: ExerciseInput = {
      name: 'Updated Exercise',
      description: 'New description',
      content: 'Updated content',
      duration: 15,
      exerciseTypeId: backhandTypeId,
      youtubeVideo: 'https://youtube.com/updated',
      image: '/images/updated.jpg',
    };

    const updatedExercise = await updateExercise(existingExerciseId, updateData);

    expect(updatedExercise.id).toBe(existingExerciseId);
    expect(updatedExercise.name).toBe('Updated Exercise');
    expect(updatedExercise.description).toBe('New description');
    expect(updatedExercise.content).toBe('Updated content');
    expect(updatedExercise.duration).toBe(15);
    expect(updatedExercise.exerciseTypeId).toBe(backhandTypeId);
    expect(updatedExercise.youtubeVideo).toBe('https://youtube.com/updated');
    expect(updatedExercise.image).toBe('/images/updated.jpg');

    // Verify in database
    const dbExercise = await db.exercise.findUnique({
      where: { id: existingExerciseId },
    });

    expect(dbExercise?.name).toBe('Updated Exercise');
  });
});

describe('Exercise Service - fetchExerciseById', () => {
  let puttingTypeId: string;
  let exerciseId: string;

  beforeEach(async () => {
    const technique = await createExerciseType('technique', { fi: 'Tekniikka', en: 'Technique' });

    const putting = await createExerciseType(
      'putting',
      { fi: 'Puttaaminen', en: 'Putting' },
      technique.id
    );

    puttingTypeId = putting.id;

    const exercise = await createExercise({
      name: 'Test Exercise',
      content: 'Test content',
      duration: 10,
      exerciseTypeId: puttingTypeId,
    });

    exerciseId = exercise.id;
  });

  it('should fetch an exercise with type path', async () => {
    const fetchedExercise = await fetchExerciseById(exerciseId, 'en');

    expect(fetchedExercise).not.toBeNull();
    expect(fetchedExercise?.id).toBe(exerciseId);
    expect(fetchedExercise?.name).toBe('Test Exercise');
    expect(fetchedExercise?.exerciseTypePath).toBe('Technique / Putting');
  });

  it('should return null for non-existent exercise', async () => {
    const fetchedExercise = await fetchExerciseById('non-existent-id', 'en');

    expect(fetchedExercise).toBeNull();
  });
});

describe('Exercise Service - fetchExercises', () => {
  let puttingTypeId: string;
  let backhandTypeId: string;

  beforeEach(async () => {
    const technique = await createExerciseType('technique', { fi: 'Tekniikka', en: 'Technique' });

    const putting = await createExerciseType(
      'putting',
      { fi: 'Puttaaminen', en: 'Putting' },
      technique.id
    );

    const backhand = await createExerciseType(
      'backhand',
      { fi: 'Rystyheitto', en: 'Backhand' },
      technique.id
    );

    puttingTypeId = putting.id;
    backhandTypeId = backhand.id;

    // Create sample exercises
    await createExercise({
      name: 'Putting Drill 1',
      content: 'Content 1',
      duration: 10,
      exerciseTypeId: puttingTypeId,
    });

    await createExercise({
      name: 'Putting Drill 2',
      content: 'Content 2',
      duration: 15,
      exerciseTypeId: puttingTypeId,
    });

    await createExercise({
      name: 'Backhand Practice',
      content: 'Content 3',
      duration: 20,
      exerciseTypeId: backhandTypeId,
    });
  });

  it('should fetch all exercises', async () => {
    const exercises = await fetchExercises('en');

    expect(exercises).toHaveLength(3);
    expect(exercises[0].exerciseTypePath).toBeTruthy();
  });

  it('should filter exercises by search term', async () => {
    const exercises = await fetchExercises('en', { searchTerm: 'Putting' });

    expect(exercises).toHaveLength(2);
    expect(exercises.every(e => e.name.includes('Putting'))).toBe(true);
  });

  it('should filter exercises by exercise type', async () => {
    const exercises = await fetchExercises('en', {
      exerciseTypeIds: [puttingTypeId],
    });

    expect(exercises).toHaveLength(2);
    expect(exercises.every(e => e.exerciseTypeId === puttingTypeId)).toBe(true);
  });

  it('should return empty array when search term is too short', async () => {
    const exercises = await fetchExercises('en', { searchTerm: 'Pu' });

    // Search term < 3 characters should return all results (no filter applied)
    expect(exercises).toHaveLength(3);
  });
});

describe('Exercise Service - deleteExercise', () => {
  let puttingTypeId: string;
  let exerciseIds: string[] = [];

  beforeEach(async () => {
    const technique = await createExerciseType('technique', { fi: 'Tekniikka', en: 'Technique' });

    const putting = await createExerciseType(
      'putting',
      { fi: 'Puttaaminen', en: 'Putting' },
      technique.id
    );

    puttingTypeId = putting.id;

    // Create 5 exercises for testing
    exerciseIds = [];
    for (let i = 1; i <= 5; i++) {
      const exercise = await createExercise({
        name: `Test Exercise ${i}`,
        content: `Content for exercise ${i}`,
        duration: 10 + i,
        exerciseTypeId: puttingTypeId,
      });
      exerciseIds.push(exercise.id);
    }
  });

  it('should delete an exercise and verify remaining exercises', async () => {
    // Verify we have 5 exercises initially
    const initialExercises = await db.exercise.findMany({
      where: { id: { in: exerciseIds } },
      orderBy: { name: 'asc' },
    });
    expect(initialExercises).toHaveLength(5);

    // Delete the third exercise
    const exerciseToDelete = exerciseIds[2];
    const deletedExercise = await deleteExercise(exerciseToDelete);

    // Verify the deleted exercise is returned
    expect(deletedExercise).toBeDefined();
    expect(deletedExercise.id).toBe(exerciseToDelete);
    expect(deletedExercise.name).toBe('Test Exercise 3');

    // Verify only 4 exercises remain in database
    const remainingExercises = await db.exercise.findMany({
      where: { id: { in: exerciseIds } },
      orderBy: { name: 'asc' },
    });
    expect(remainingExercises).toHaveLength(4);

    // Verify the correct exercises remain
    const remainingIds = remainingExercises.map(e => e.id);
    expect(remainingIds).toContain(exerciseIds[0]);
    expect(remainingIds).toContain(exerciseIds[1]);
    expect(remainingIds).not.toContain(exerciseIds[2]); // This one was deleted
    expect(remainingIds).toContain(exerciseIds[3]);
    expect(remainingIds).toContain(exerciseIds[4]);

    // Verify the deleted exercise cannot be fetched
    const fetchedExercise = await fetchExerciseById(exerciseToDelete, 'en');
    expect(fetchedExercise).toBeNull();
  });

  it('should fail when trying to delete a non-existing exercise and verify all exercises remain', async () => {
    // Verify we have 5 exercises initially
    const initialExercises = await db.exercise.findMany({
      where: { id: { in: exerciseIds } },
      orderBy: { name: 'asc' },
    });
    expect(initialExercises).toHaveLength(5);

    // Try to delete a non-existing exercise
    const nonExistentId = 'non-existent-exercise-id';

    // This should throw an error
    await expect(deleteExercise(nonExistentId)).rejects.toThrow();

    // Verify all 5 exercises still exist in database
    const remainingExercises = await db.exercise.findMany({
      where: { id: { in: exerciseIds } },
      orderBy: { name: 'asc' },
    });
    expect(remainingExercises).toHaveLength(5);

    // Verify all exercise IDs are still present
    const remainingIds = remainingExercises.map(e => e.id);
    exerciseIds.forEach(id => {
      expect(remainingIds).toContain(id);
    });

    // Verify all exercise names are correct
    expect(remainingExercises[0].name).toBe('Test Exercise 1');
    expect(remainingExercises[1].name).toBe('Test Exercise 2');
    expect(remainingExercises[2].name).toBe('Test Exercise 3');
    expect(remainingExercises[3].name).toBe('Test Exercise 4');
    expect(remainingExercises[4].name).toBe('Test Exercise 5');
  });
});
