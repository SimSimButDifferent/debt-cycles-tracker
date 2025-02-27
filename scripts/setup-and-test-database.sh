#!/bin/bash
# Setup and test the database

# Set error handling
set -e

echo "🗄️  Setting up and testing the database..."
echo "============================================"

# Step 1: Setup the database
echo "📦 Setting up the database..."
npm run db:setup

# Step 2: Run database tests
echo ""
echo "🧪 Running database tests..."
./scripts/test-database.sh

# Step 3: Generate coverage report
echo ""
echo "📊 Generating coverage report for database services..."
npm test -- --coverage --coverageReporters="text-summary" --collectCoverageFrom="app/database/**/*.ts" --collectCoverageFrom="app/services/fredApi.ts"

echo ""
echo "✅ Database setup and testing complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run seed' to populate the database with initial data"
echo "2. Run 'npm run dev' to start the development server" 