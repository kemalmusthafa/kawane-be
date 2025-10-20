import { Request, Response } from "express";
import { ReportsService } from "../services/reports/reports.service";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class ReportsController {
  private reportsService: ReportsService;

  constructor() {
    this.reportsService = new ReportsService();
  }

  public getReportsController = asyncHandler(
    async (req: Request, res: Response) => {
      const { page = 1, limit = 10, search, type, status } = req.query;

      console.log("Reports controller - query params:", {
        page,
        limit,
        search,
        type,
        status,
      });

      const reports = await this.reportsService.getReports({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        type: type as string,
        status: status as string,
      });

      console.log("Reports service response:", reports);

      res.status(200).json({
        success: true,
        message: "Reports retrieved successfully",
        data: reports,
      });
    }
  );

  public generateReportController = asyncHandler(
    async (req: Request, res: Response) => {
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
    }
  );

  public downloadReportController = asyncHandler(
    async (req: Request, res: Response) => {
      const { reportId } = req.params;

      const reportBuffer = await this.reportsService.downloadReport(reportId);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="report-${reportId}.pdf"`
      );
      res.send(reportBuffer);
    }
  );
}
