import { Router } from "express";
import { authenticate } from "@/middleware/auth";
import { asyncHandler } from "@/middleware/asyncHandler";
import { PaymentController } from "./payment.controller";

export class PaymentRoutes {
  private router = Router();
  private paymentController: PaymentController;

  constructor(paymentController: PaymentController) {
    this.router = Router();
    this.paymentController = paymentController;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Initiate payment
    this.router.post(
      "/initiate",
      authenticate,
      asyncHandler((req, res) =>
        this.paymentController.initiatePayment(req, res)
      )
    );

    // Webhook (no auth)
    this.router.post(
      "/webhook",
      asyncHandler((req, res) =>
        this.paymentController.confirmPayment(req, res)
      )
    );

    // List payments
    this.router.get(
      "/",
      authenticate,
      asyncHandler((req, res) =>
        this.paymentController.getPayments(req, res)
      )
    );
  }

  public getRouter() {
    return this.router;
  }
}
