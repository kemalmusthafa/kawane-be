import { Request, Response } from "express";
import {
  expireDealsService,
  cleanupExpiredDealsService,
} from "../services/deal/deal-expiration.service";

export const expireDealsController = async (req: Request, res: Response) => {
  try {
    const result = await expireDealsService();

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        expiredDealsCount: result.expiredDealsCount,
      },
    });
  } catch (error: any) {
    console.error("Error expiring deals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to expire deals",
      error: error.message,
    });
  }
};

export const cleanupExpiredDealsController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await cleanupExpiredDealsService();

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        cleanedUpDealsCount: result.cleanedUpDealsCount,
      },
    });
  } catch (error: any) {
    console.error("Error cleaning up expired deals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup expired deals",
      error: error.message,
    });
  }
};

export const processExpiredDealsController = async (
  req: Request,
  res: Response
) => {
  try {
    // First expire deals
    const expireResult = await expireDealsService();

    // Then cleanup old expired deals
    const cleanupResult = await cleanupExpiredDealsService();

    res.status(200).json({
      success: true,
      message: "Successfully processed expired deals",
      data: {
        expiredDealsCount: expireResult.expiredDealsCount,
        cleanedUpDealsCount: cleanupResult.cleanedUpDealsCount,
      },
    });
  } catch (error: any) {
    console.error("Error processing expired deals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process expired deals",
      error: error.message,
    });
  }
};
