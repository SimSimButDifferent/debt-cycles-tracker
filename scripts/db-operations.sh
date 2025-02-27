#!/bin/bash
# Database Operations Script
# This script provides a simple menu for common database operations

set -e

# Check if we're in the project root
if [ ! -f "package.json" ]; then
  echo "Error: This script must be run from the project root directory."
  exit 1
fi

# Function to display menu
display_menu() {
  clear
  echo "🛠️  Database Operations 🛠️"
  echo "=========================="
  echo
  echo "Select an operation:"
  echo "1) View database status"
  echo "2) Reset and set up new database"
  echo "3) Run Prisma migrations"
  echo "4) Generate Prisma client"
  echo "5) Seed database with FRED data"
  echo "6) Seed database with test data"
  echo "7) Run database tests"
  echo "8) Open Prisma Studio"
  echo "9) Run full bootstrap (setup + seed + test)"
  echo "0) Exit"
  echo
  read -p "Enter your choice [0-9]: " choice
}

# Function to wait for user to press Enter
wait_for_key() {
  echo
  read -p "Press Enter to continue..." key
}

# Check database status
view_db_status() {
  clear
  echo "📊 Database Status"
  echo "================="
  
  # Check if DATABASE_URL is set
  if [ -z "$DATABASE_URL" ] && [ -f ".env" ]; then
    source .env
  fi
  
  if [ -z "$DATABASE_URL" ] && [ -f ".env.local" ]; then
    source .env.local
  fi
  
  if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set in .env or .env.local"
    wait_for_key
    return
  fi
  
  echo "✅ DATABASE_URL is set"
  
  # Extract database name from DATABASE_URL
  DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
  echo "📦 Database name: $DB_NAME"
  
  # Get connection details without the database name
  # This creates a connection string to the default 'postgres' database
  POSTGRES_URL=$(echo $DATABASE_URL | sed -E 's/(postgresql:\/\/[^\/]+\/).*/\1postgres/')
  
  # Check if PostgreSQL is running
  echo "🔍 Checking database connection..."
  if ! PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:([^@]*)@.*/\1/p') psql "$POSTGRES_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Cannot connect to PostgreSQL server"
    wait_for_key
    return
  fi
  
  echo "✅ Connected to PostgreSQL server"
  
  # Check if the database exists
  if ! PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:([^@]*)@.*/\1/p') psql "$POSTGRES_URL" -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
    echo "❌ Database '$DB_NAME' does not exist"
    wait_for_key
    return
  fi
  
  echo "✅ Database '$DB_NAME' exists"
  
  # Check if Prisma schema is applied
  echo "🔍 Checking Prisma schema..."
  if ! npx prisma db pull --print > /dev/null 2>&1; then
    echo "❌ Could not check Prisma schema (perhaps no tables exist yet)"
    wait_for_key
    return
  fi
  
  echo "✅ Prisma schema appears to be valid"
  
  # Count FRED series
  echo "🔍 Checking FRED data..."
  FRED_SERIES_COUNT=$(PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:([^@]*)@.*/\1/p') psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"FredSeries\";" -t 2>/dev/null || echo "0")
  FRED_DATA_COUNT=$(PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:([^@]*)@.*/\1/p') psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"CachedFredData\";" -t 2>/dev/null || echo "0")
  
  echo "📊 Database contains approximately:"
  echo "   - $FRED_SERIES_COUNT FRED series"
  echo "   - $FRED_DATA_COUNT cached data points"
  
  wait_for_key
}

# Main loop
while true; do
  display_menu
  
  case $choice in
    1)
      view_db_status
      ;;
    2)
      clear
      echo "🔄 Resetting and setting up new database..."
      npm run db:setup
      echo "✅ Database setup complete"
      wait_for_key
      ;;
    3)
      clear
      echo "🔄 Running Prisma migrations..."
      npm run db:migrate
      echo "✅ Migrations complete"
      wait_for_key
      ;;
    4)
      clear
      echo "🔄 Generating Prisma client..."
      npm run db:generate
      echo "✅ Prisma client generated"
      wait_for_key
      ;;
    5)
      clear
      echo "🌱 Seeding database with FRED data..."
      npm run seed
      echo "✅ Seeding complete"
      wait_for_key
      ;;
    6)
      clear
      echo "🧪 Seeding database with test data..."
      npm run seed:test
      echo "✅ Test data seeding complete"
      wait_for_key
      ;;
    7)
      clear
      echo "🧪 Running database tests..."
      ./scripts/test-database.sh
      wait_for_key
      ;;
    8)
      clear
      echo "🔍 Opening Prisma Studio..."
      echo "(Press Ctrl+C to exit when done)"
      npm run db:studio
      ;;
    9)
      clear
      echo "🚀 Running full database bootstrap..."
      ./scripts/database-bootstrap.sh
      wait_for_key
      ;;
    0)
      clear
      echo "👋 Exiting..."
      exit 0
      ;;
    *)
      echo "❌ Invalid option. Please try again."
      wait_for_key
      ;;
  esac
done 