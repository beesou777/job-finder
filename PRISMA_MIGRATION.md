# Prisma Migration Guide

This project has been migrated from TypeORM to Prisma for better Vercel serverless compatibility.

## ✅ What Changed

- **ORM**: TypeORM → Prisma
- **Database Client**: Now using `@prisma/client`
- **Schema**: Defined in `prisma/schema.prisma`
- **All API routes**: Updated to use Prisma

## 🚀 Setup Instructions

### 1. Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma Client based on `prisma/schema.prisma`.

### 2. Database Migration

#### For Development:
```bash
npm run prisma:migrate
```

This will:
- Create a new migration
- Apply it to your database
- Generate the Prisma Client

#### For Production (Vercel):
```bash
npm run prisma:deploy
```

Or add to your Vercel build command:
```bash
npm run build && npm run prisma:generate && npm run prisma:deploy
```

### 3. Environment Variables

Make sure `DATABASE_URL` is set in your `.env` file and Vercel environment variables.

## 📋 Database Schema

The schema is defined in `prisma/schema.prisma`. Key models:

- **User**: Authentication users
- **Job**: Job postings
- **Category**: Job categories

## 🔄 Migration from Existing Database

If you have an existing database with TypeORM tables:

1. **Backup your database first!**

2. Prisma will detect existing tables and work with them (if column names match)

3. If column names differ, you may need to:
   - Update `prisma/schema.prisma` to match your existing schema
   - Or run a migration to rename columns

4. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

## 🛠️ Common Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migration (dev)
npm run prisma:migrate

# Apply migrations (production)
npm run prisma:deploy

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## 📝 Notes

- **No more `synchronize`**: Prisma uses migrations instead
- **Better Vercel support**: Prisma is optimized for serverless
- **Type safety**: Prisma provides excellent TypeScript support
- **Connection pooling**: Prisma handles connection pooling automatically

## 🐛 Troubleshooting

### "Prisma Client not generated"
Run: `npm run prisma:generate`

### "Migration failed"
Check your `DATABASE_URL` is correct and database is accessible.

### "Tables already exist"
Prisma will work with existing tables. Just run `prisma generate` and `prisma migrate deploy`.

## 🔗 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma + Next.js](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

