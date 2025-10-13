"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const reports_service_1 = require("../services/reports/reports.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class ReportsController {
    constructor() {
        this.getReportsController = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 10, search, type, status } = req.query;
            console.log("Reports controller - query params:", {
                page,
                limit,
                search,
                type,
                status,
            });
            const reports = await this.reportsService.getReports({
                page: parseInt(page),
                limit: parseInt(limit),
                search: search,
                type: type,
                status: status,
            });
            console.log("Reports service response:", reports);
            res.status(200).json({
                success: true,
                message: "Reports retrieved successfully",
                data: reports,
            });
        });
        this.generateReportController = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
            const { type, period, format = "PDF" } = req.body;
            console.log("Generate report controller - body:", {
                type,
                period,
                format,
            });
            const report = await this.reportsService.generateReport({
                type,
                period,
                format,
            });
            console.log("Generate report service response:", report);
            res.status(201).json({
                success: true,
                message: "Report generated successfully",
                data: report,
            });
        });
        this.downloadReportController = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
            const { reportId } = req.params;
            const reportBuffer = await this.reportsService.downloadReport(reportId);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="report-${reportId}.pdf"`);
            res.send(reportBuffer);
        });
        this.reportsService = new reports_service_1.ReportsService();
    }
}
exports.ReportsController = ReportsController;
