import { PrismaClient } from '@prisma/client';
import { seedMetric } from './seedFredData';
import { testMetrics } from '../app/__tests__/fixtures/testMetrics';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

/**
 * Seeds test data for testing purposes
 * This creates a smaller dataset with consistent data for tests
 */
async function seedTestData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Connecting to database...');
    await prisma.$connect();
    
    console.log('🌱 Seeding test metrics...');
    
    // Seed a smaller set of test metrics for testing
    // Using parallel promises for speed
    const seedPromises = testMetrics.map((metric) => 
      seedMetric(prisma, metric.id, metric.title)
        .catch((err: Error) => {
          console.error(`❌ Error seeding test metric ${metric.id}:`, err);
          return null;
        })
    );
    
    const results = await Promise.all(seedPromises);
    const successCount = results.filter((result) => result !== null).length;
    
    console.log(`✅ Successfully seeded ${successCount}/${testMetrics.length} test metrics`);
    
    return {
      success: true,
      count: successCount
    };
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    return {
      success: false,
      error
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if this script is run directly
if (require.main === module) {
  seedTestData()
    .then(result => {
      if (result.success) {
        console.log('✅ Test data seeding completed');
        process.exit(0);
      } else {
        console.error('❌ Test data seeding failed');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('❌ Unhandled error in test data seeding:', err);
      process.exit(1);
    });
}

export { seedTestData }; 