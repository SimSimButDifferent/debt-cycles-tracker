#!/bin/bash
# Run database-specific tests

echo "🧪 Running FRED Database tests..."
npm test -- -t "FRED.*Database" --runInBand

echo "🧪 Running FRED API with Caching tests..."
npm test -- -t "FRED API with Database Integration" --runInBand

echo "✅ Database tests complete!" 