-- CreateTable
CREATE TABLE "Banner" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

