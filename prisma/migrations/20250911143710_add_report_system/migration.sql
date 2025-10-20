-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('SALES', 'INVENTORY', 'CUSTOMER', 'PRODUCT');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('GENERATING', 'GENERATED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ReportFormat" AS ENUM ('PDF', 'EXCEL', 'CSV');

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."ReportType" NOT NULL,
    "period" TEXT NOT NULL,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'GENERATING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "size" TEXT NOT NULL,
    "format" "public"."ReportFormat" NOT NULL DEFAULT 'PDF',

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
