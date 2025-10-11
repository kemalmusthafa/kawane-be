import { Request, Response } from "express";
import { forgotPasswordService } from "../services/auth/forgot-password.service";

export class DevController {
  async testForgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const result = await forgotPasswordService({ email });

      res.json({
        success: true,
        message: "Development test - Reset link generated",
        data: result,
      });
    } catch (error: any) {
      console.error("Dev test error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
