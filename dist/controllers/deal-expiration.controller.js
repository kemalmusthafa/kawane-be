"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processExpiredDealsController = exports.cleanupExpiredDealsController = exports.expireDealsController = void 0;
const deal_expiration_service_1 = require("../services/deal/deal-expiration.service");
const expireDealsController = async (req, res) => {
    try {
        const result = await (0, deal_expiration_service_1.expireDealsService)();
        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                expiredDealsCount: result.expiredDealsCount,
            },
        });
    }
    catch (error) {
        console.error("Error expiring deals:", error);
        res.status(500).json({
            success: false,
            message: "Failed to expire deals",
            error: error.message,
        });
    }
};
exports.expireDealsController = expireDealsController;
const cleanupExpiredDealsController = async (req, res) => {
    try {
        const result = await (0, deal_expiration_service_1.cleanupExpiredDealsService)();
        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                cleanedUpDealsCount: result.cleanedUpDealsCount,
            },
        });
    }
    catch (error) {
        console.error("Error cleaning up expired deals:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cleanup expired deals",
            error: error.message,
        });
    }
};
exports.cleanupExpiredDealsController = cleanupExpiredDealsController;
const processExpiredDealsController = async (req, res) => {
    try {
        // First expire deals
        const expireResult = await (0, deal_expiration_service_1.expireDealsService)();
        // Then cleanup old expired deals
        const cleanupResult = await (0, deal_expiration_service_1.cleanupExpiredDealsService)();
        res.status(200).json({
            success: true,
            message: "Successfully processed expired deals",
            data: {
                expiredDealsCount: expireResult.expiredDealsCount,
                cleanedUpDealsCount: cleanupResult.cleanedUpDealsCount,
            },
        });
    }
    catch (error) {
        console.error("Error processing expired deals:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process expired deals",
            error: error.message,
        });
    }
};
exports.processExpiredDealsController = processExpiredDealsController;
