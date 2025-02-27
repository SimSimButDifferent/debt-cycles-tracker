#!/bin/bash
# Bootstrap a new development database with test data
# This script is useful when setting up a new development environment
# or when you want to reset your database to a clean state with test data

set -e

echo "🗄️  Database Bootstrap Script"
echo "============================"

# Check that required tools are available
command -v psql >/dev/null 2>&1 || { echo "PostgreSQL client (psql) is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting." >&2; exit 1; }

# Load environment variables
if [ -f .env ]; then
  source .env
fi

if [ -f .env.local ]; then
  source .env.local
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set in your .env or .env.local file"
  echo "Please configure your DATABASE_URL first"
  exit 1
fi

# Extract database name from DATABASE_URL for the drop command
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ -z "$DB_NAME" ]; then
  echo "❌ Could not parse database name from DATABASE_URL"
  exit 1
fi

# Confirm with user
echo "⚠️  WARNING: This will reset your database '$DB_NAME' and populate it with test data."
echo "All existing data will be lost."
read -p "Do you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Operation cancelled."
  exit 0
fi

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Reset the database (creating a new one if it doesn't exist)
echo "🔄 Resetting database..."

# Get connection details without the database name
# This creates a connection string to the default 'postgres' database
POSTGRES_URL=$(echo $DATABASE_URL | sed -E 's/(postgresql:\/\/[^\/]+\/).*/\1postgres/')

# Drop and create database
echo "   - Dropping database if it exists..."
PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:([^@]*)@.*/\1/p') psql "$POSTGRES_URL" -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"

echo "   - Creating database..."
PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:([^@]*)@.*/\1/p') psql "$POSTGRES_URL" -c "CREATE DATABASE \"$DB_NAME\";"

echo "✅ Database reset completed"

# Step 3: Run Prisma migrations
echo "🔄 Running database setup script..."
npm run db:setup

# Step 4: Seed the database with sample data
echo "🌱 Seeding database with sample data..."
npm run seed

# Step 5: Run database tests to verify setup
echo "🧪 Running database tests to verify setup..."
./scripts/test-database.sh

echo ""
echo "🎉 Database bootstrap complete!"
echo ""
echo "You can now:"
echo "1. Run 'npm run dev' to start the application"
echo "2. Run 'npm run db:studio' to view your database through Prisma Studio" 