-- Safe script to add Banner table only
-- This script ONLY creates the Banner table and does NOT modify existing tables
-- Run this manually in your database if needed

CREATE TABLE IF NOT EXISTS "Banner" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "linkUrl" TEXT,
    "linkText" TEXT,
    "dealId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- Optional: Add index for performance
CREATE INDEX IF NOT EXISTS "Banner_isActive_idx" ON "Banner"("isActive");
CREATE INDEX IF NOT EXISTS "Banner_priority_idx" ON "Banner"("priority");

