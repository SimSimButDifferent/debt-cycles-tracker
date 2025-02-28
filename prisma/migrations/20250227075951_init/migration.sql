-- CreateTable
CREATE TABLE "FredSeries" (
    "id" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FredSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedFredData" (
    "id" SERIAL NOT NULL,
    "seriesId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CachedFredData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LastFetchTimestamp" (
    "seriesId" TEXT NOT NULL,
    "lastFetchedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LastFetchTimestamp_pkey" PRIMARY KEY ("seriesId")
);

-- CreateIndex
CREATE INDEX "FredSeries_metricId_idx" ON "FredSeries"("metricId");

-- CreateIndex
CREATE INDEX "CachedFredData_date_idx" ON "CachedFredData"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CachedFredData_seriesId_date_key" ON "CachedFredData"("seriesId", "date");

-- CreateIndex
CREATE INDEX "LastFetchTimestamp_lastFetchedAt_idx" ON "LastFetchTimestamp"("lastFetchedAt");

-- AddForeignKey
ALTER TABLE "CachedFredData" ADD CONSTRAINT "CachedFredData_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "FredSeries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
