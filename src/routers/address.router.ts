import { Router } from "express";
import { AddressController } from "../controllers/address.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateQuery,
} from "../middlewares/zod-validation.middleware";
import {
  createAddressSchema,
  paginationSchema,
} from "../utils/validation-schemas";

export class AddressRouter {
  private router: Router;
  private addressController: AddressController;

  constructor() {
    this.router = Router();
    this.addressController = new AddressController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get user addresses with pagination
    this.router.get(
      "/",
      requireAuth,
      validateQuery(paginationSchema),
      this.addressController.getUserAddressesController
    );

    // Create new address
    this.router.post(
      "/",
      requireAuth,
      validateBody(createAddressSchema),
      this.addressController.createAddressController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
