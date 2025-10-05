# Testing Guide

This project uses **Vitest** with a real PostgreSQL test database for integration testing.

## Quick Start

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Database Setup

The test database is configured in `.env.test`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/harkka_db_test"
```

### Initial Setup (one-time)

1. Create the test database:
```bash
PGPASSWORD=postgres psql -h localhost -p 5436 -U postgres -c "CREATE DATABASE harkka_db_test;"
```

2. Apply migrations to test database:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/harkka_db_test" npx prisma migrate deploy
```

## Writing Tests

### Using Test Helpers

The `tests/setup/test-helpers.ts` file provides factory functions to make test data creation painless:

```typescript
import { createExerciseType, setupBasicExerciseTypes } from '../setup/test-helpers';

// Create a single exercise type
const putting = await createExerciseType(
  'putting',
  { fi: 'Puttaaminen', en: 'Putting' }
);

// Or use the quick setup for common scenario
const { technique, putting, backhand } = await setupBasicExerciseTypes();
```

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../setup/db-setup';
import { createExerciseType } from '../setup/test-helpers';
import { createExercise } from '~/services/exercises.server';

describe('Your Feature', () => {
  let exerciseTypeId: string;

  beforeEach(async () => {
    // Setup test data
    const type = await createExerciseType('test', { fi: 'Testi', en: 'Test' });
    exerciseTypeId = type.id;
  });

  it('should do something', async () => {
    // Arrange
    const data = { /* your test data */ };

    // Act
    const result = await yourFunction(data);

    // Assert
    expect(result).toBeDefined();
    expect(result.someProperty).toBe('expected value');
  });
});
```

## Test Organization

```
tests/
├── setup/
│   ├── db-setup.ts          # Database cleanup & connection
│   └── test-helpers.ts      # Factory functions
├── services/
│   └── exercises.test.ts    # Service layer tests
├── repositories/
│   └── (future tests)       # Repository layer tests
└── fixtures/
    └── (future data)        # Shared test data
```

## Database Cleanup

The test database is **automatically cleaned before each test** via `beforeEach` in `tests/setup/db-setup.ts`. This ensures:
- No test pollution
- Consistent starting state
- Fast execution

## Tips

1. **Use factory functions**: Always prefer `createExerciseType()` over manual Prisma calls
2. **Test isolation**: Each test gets a clean database - no need to clean up manually
3. **Real database**: Tests use actual PostgreSQL, catching real integration issues
4. **Fast feedback**: Vitest is extremely fast, especially in watch mode
5. **Type safety**: Full TypeScript support throughout

## Existing Test Coverage

- ✅ `createExercise` - Creating exercises with valid/invalid data
- ✅ `updateExercise` - Updating existing exercises
- ✅ `fetchExerciseById` - Fetching single exercise with type path
- ✅ `fetchExercises` - Fetching with filters (search, type)

## Adding New Tests

1. Create a new test file in appropriate directory (`tests/services/`, `tests/repositories/`)
2. Import helpers from `tests/setup/`
3. Use `describe`, `it`, `beforeEach` from vitest
4. Run tests with `npm run test:watch` for instant feedback
