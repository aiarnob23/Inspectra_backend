import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { BaseController } from "@/core/BaseController";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";

export class PaymentController extends BaseController {
  constructor(private paymentService: PaymentService) {
    super();
  }

  /**
   * POST /api/payments/initiate
   */
  public initiatePayment = async (req: Request, res: Response) => {
    const body = req.body;
    const userId = req.userId as string;

    const result = await this.paymentService.initiatePayment({
      planId: body.planId,
      subscriberId: userId,
      amountMinor: body.amountMinor,
      discount: body.discount,
      tax: body.tax,
      currency: body.currency,
      provider: body.provider,
    });

    this.logAction("initiatePayment", req, {
      planId: body.planId,
    });

    return this.sendResponse(
      res,
      "Payment initiated successfully",
      HTTPStatusCode.OK,
      result
    );
  };

  /**
   * POST /api/payments/webhook
   */
  public confirmPayment = async (req: Request, res: Response) => {
    const body = req.body;

    await this.paymentService.confirmPayment({
      transactionId: body.transactionId,
      success: body.success,
    });

    return this.sendResponse(
      res,
      "Webhook processed",
      HTTPStatusCode.OK,
      null
    );
  };

  /**
   * GET /api/payments
   */
  public getPayments = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const offset = (page - 1) * limit;

    const payments = await this.paymentService["prisma"].payment.findMany({
      where: {
        subscriberId: userId,
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await this.paymentService["prisma"].payment.count({
      where: { subscriberId: userId },
    });

    return this.sendPaginatedResponse(
      res,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
      "Payments retrieved successfully",
      payments
    );
  };
}
