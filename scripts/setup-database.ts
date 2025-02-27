#!/usr/bin/env ts-node
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

console.log('🗄️  Database Setup Script');
console.log('=======================');

// Check if DATABASE_URL is set
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL is not set in your .env file');
  console.log('Please set DATABASE_URL in your .env or .env.local file.');
  console.log('Example: DATABASE_URL="postgresql://username:password@localhost:5432/debt_cycles?schema=public"');
  process.exit(1);
}

// Create prisma directory if it doesn't exist
const prismaDir = path.join(process.cwd(), 'prisma');
if (!fs.existsSync(prismaDir)) {
  console.log('📁 Creating prisma directory...');
  fs.mkdirSync(prismaDir);
}

console.log('🔄 Running Prisma migrations...');
try {
  // Run migrations to create/update database schema
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Database migrations completed');
} catch (error) {
  console.error('❌ Failed to run migrations:', error);
  console.log('Attempting to generate Prisma client anyway...');
}

console.log('🔧 Generating Prisma client...');
try {
  // Generate Prisma client
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error);
  process.exit(1);
}

console.log('');
console.log('🎉 Database setup complete!');
console.log('');
console.log('Next steps:');
console.log('1. Run `npm run seed` to populate the database with initial data');
console.log('2. Run `npx prisma studio` to view your database');
console.log(''); 