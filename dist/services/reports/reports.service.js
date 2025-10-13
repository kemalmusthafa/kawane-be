"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ReportsService {
    async getReports(filters) {
        const { page, limit, search, type, status } = filters;
        const skip = (page - 1) * limit;
        console.log("Reports service - filters:", {
            page,
            limit,
            search,
            type,
            status,
        });
        const where = {};
        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive",
            };
        }
        if (type) {
            where.type = type;
        }
        if (status) {
            where.status = status;
        }
        console.log("Reports service - where clause:", where);
        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.report.count({ where }),
        ]);
        console.log("Reports service - results:", {
            reports: reports.length,
            total,
        });
        return {
            reports,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async generateReport(data) {
        const { type, period, format } = data;
        // Create report record
        const report = await prisma.report.create({
            data: {
                name: `${type} Report - ${period}`,
                type: type.toUpperCase(),
                period,
                status: "GENERATING",
                format: format.toUpperCase(),
                size: "0 MB",
            },
        });
        // Simulate report generation (in real app, this would be async)
        setTimeout(async () => {
            try {
                const reportData = await this.generateReportData(type, period);
                const size = this.calculateReportSize(reportData);
                await prisma.report.update({
                    where: { id: report.id },
                    data: {
                        status: "GENERATED",
                        size: `${size} MB`,
                    },
                });
            }
            catch (error) {
                await prisma.report.update({
                    where: { id: report.id },
                    data: { status: "FAILED" },
                });
            }
        }, 2000);
        return report;
    }
    async downloadReport(reportId) {
        const report = await prisma.report.findUnique({
            where: { id: reportId },
        });
        if (!report) {
            throw new Error("Report not found");
        }
        if (report.status !== "GENERATED") {
            throw new Error("Report not ready for download");
        }
        // In a real application, you would generate the actual file
        // For now, we'll return a mock PDF buffer
        const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${report.name}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;
        return Buffer.from(mockPdfContent, "utf-8");
    }
    async generateReportData(type, period) {
        // Mock report data generation
        switch (type.toLowerCase()) {
            case "sales":
                return {
                    totalRevenue: 15000000,
                    totalOrders: 125,
                    averageOrderValue: 120000,
                    topProducts: ["Product A", "Product B", "Product C"],
                };
            case "inventory":
                return {
                    totalProducts: 50,
                    lowStockProducts: 5,
                    outOfStockProducts: 2,
                    totalValue: 50000000,
                };
            case "customer":
                return {
                    totalCustomers: 200,
                    newCustomers: 25,
                    returningCustomers: 175,
                    averageOrderFrequency: 2.5,
                };
            case "product":
                return {
                    totalProducts: 50,
                    activeProducts: 45,
                    inactiveProducts: 5,
                    topSellingProducts: ["Product A", "Product B"],
                };
            default:
                return {};
        }
    }
    calculateReportSize(data) {
        // Mock size calculation
        const jsonSize = JSON.stringify(data).length;
        return Math.round((jsonSize / 1024 / 1024) * 100) / 100;
    }
}
exports.ReportsService = ReportsService;
