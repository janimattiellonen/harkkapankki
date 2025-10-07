# Harkkapankki

A system for creating disc golf training programs.

- 📖 [Remix docs](https://remix.run/docs)

## Development

Run the dev server:

```shellscript
npm run dev
```

## Database Access

### Docker Container Access

To access the PostgreSQL container:

```bash
# Access the container's shell
docker exec -it harkka-db bash

# Access psql directly
docker exec -it harkka-db psql -U postgres -d harkka_db
```

### Database Connection Details

- Host: localhost
- Port: 5434 (external port)
- Database: harkka_db
- Username: postgres
- Password: postgres

### Common Database Commands

```sql
-- List all tables
\dt

-- Connect to database
\c harkka_db

-- Describe table
\d exercises

-- Basic query
SELECT * FROM exercises;
```

### Using External Tools

You can connect to the database using tools like pgAdmin or DBeaver with these settings:

- Host: localhost
- Port: 5434
- Database: harkka_db
- Username: postgres
- Password: postgres

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Scripts

The project includes several utility scripts for managing content and maintaining the database. See [scripts/README.md](./scripts/README.md) for detailed documentation.

**Quick reference**:

- `npm run insert-exercises -- <json-file> <type-id>` - Import exercise content
- `npx tsx scripts/regenerate-slugs.ts` - Regenerate all slugs
- `npx tsx scripts/test-slugs.ts` - Test slug generation
- `npx tsx scripts/crawler/index.ts <html-file>` - Parse HTML content

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
