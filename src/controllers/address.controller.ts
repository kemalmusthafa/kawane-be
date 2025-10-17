import { Request, Response } from "express";
import { createAddressService } from "../services/address/create-address.service";
import { getUserAddressesService } from "../services/address/get-user-addresses.service";
import { updateAddressService } from "../services/address/update-address.service";
import { deleteAddressService } from "../services/address/delete-address.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class AddressController {
  async createAddressController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const address = await createAddressService({
        userId,
        ...req.body,
      });

      successResponse(res, address, "Address created successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getUserAddressesController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      // Use validated query data if available, otherwise fallback to req.query
      const queryData = (req as any).validatedQuery || req.query;
      const { page, limit } = queryData;

      const result = await getUserAddressesService({
        userId,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });

      successResponse(res, result, "Addresses retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async updateAddressController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const addressId = req.params.id;

      const address = await updateAddressService({
        addressId,
        userId,
        ...req.body,
      });

      successResponse(res, address, "Address updated successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async deleteAddressController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const addressId = req.params.id;

      await deleteAddressService({
        addressId,
        userId,
      });

      successResponse(res, null, "Address deleted successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
