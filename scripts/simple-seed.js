// Simple database seed script using CommonJS
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Sample FRED series data
const testSeries = [
  {
    id: "GDPC1",
    metricId: "gdp",
    name: "Real Gross Domestic Product",
    description:
      "Inflation-adjusted measure of the value of all goods and services produced by an economy",
    unit: "Billions of Chained 2017 Dollars",
    frequency: "Quarterly",
  },
  {
    id: "CPIAUCSL",
    metricId: "cpi",
    name: "Consumer Price Index for All Urban Consumers: All Items",
    description:
      "Measure of the average change over time in the prices paid by urban consumers for a market basket of consumer goods and services",
    unit: "Index 1982-1984=100",
    frequency: "Monthly",
  },
  {
    id: "UNRATE",
    metricId: "unrate",
    name: "Unemployment Rate",
    description:
      "Percentage of the total labor force that is unemployed but actively seeking employment",
    unit: "Percent",
    frequency: "Monthly",
  },
];

// Sample data points for each series
function generateDataPoints(seriesId, count = 10) {
  const points = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);

    // Generate a realistic-looking value based on the series
    let value;
    if (seriesId === "GDPC1") {
      // GDP around 20,000 billion
      value = 20000 + Math.random() * 1000 - 500;
    } else if (seriesId === "CPIAUCSL") {
      // CPI around 300
      value = 300 + Math.random() * 10 - 5;
    } else if (seriesId === "UNRATE") {
      // Unemployment rate around 4%
      value = 4 + Math.random() * 1 - 0.5;
    } else {
      value = 100 + Math.random() * 10 - 5;
    }

    points.push({
      seriesId,
      date,
      value,
    });
  }

  return points;
}

async function seedDatabase() {
  try {
    console.log("🔄 Connecting to database...");

    // Clear existing data to avoid duplicates
    console.log("🧹 Clearing existing data...");
    await prisma.cachedFredData.deleteMany({});
    await prisma.lastFetchTimestamp.deleteMany({});
    await prisma.fredSeries.deleteMany({});

    console.log("🌱 Seeding test FRED series...");

    // Insert series and their data points
    for (const series of testSeries) {
      console.log(`Creating series: ${series.name}`);

      // Create the series
      const createdSeries = await prisma.fredSeries.create({
        data: series,
      });

      // Generate and insert data points
      const dataPoints = generateDataPoints(series.id);

      for (const point of dataPoints) {
        await prisma.cachedFredData.create({
          data: point,
        });
      }

      // Update last fetch timestamp
      await prisma.lastFetchTimestamp.create({
        data: {
          seriesId: series.id,
          lastFetchedAt: new Date(),
        },
      });

      console.log(
        `✅ Created series ${series.name} with ${dataPoints.length} data points`
      );
    }

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log("Seeding complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error during seeding:", err);
    process.exit(1);
  });
