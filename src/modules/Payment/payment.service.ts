import { PrismaClient } from "@/generated/prisma";
import { SubscriptionService } from "../Subscription/subscription.service";
import { DiscountInput, TaxInput } from "@/types/paymentTypes";
import { NotFoundError } from "@/core/errors/AppError";

export class PaymentService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly subscriptionService: SubscriptionService
    ) { }

    // ===============================
    // PRORATION
    // ===============================
    private async calculateProratedAmount(
        subscriberId: string,
        newPlanId: string
    ): Promise<number> {
        const membership = await this.prisma.membership.findUnique({
            where: { subscriberId },
            include: { plan: true }
        });

        if (!membership || !membership.isActive) return 0;
        if (!membership.endDate) return 0;
        // IF SAME PLAN: No proration credit 
        if (membership.planId === newPlanId) {
            return 0;
        }

        const now = Date.now();
        const start = membership.startDate.getTime();
        const end = membership.endDate.getTime();

        if (now >= end || end <= start) return 0;

        const totalDuration = end - start;
        const remainingTime = end - now;

        const planPriceMinor = Math.round(membership.plan.price * 100);

        return Math.floor(
            (remainingTime / totalDuration) * planPriceMinor
        );
    }

    // ===============================
    // DISCOUNT
    // ===============================
    private calculateDiscount(input: DiscountInput): number {
        const { amountMinor, type, value, maxDiscountMinor } = input;

        if (amountMinor <= 0 || value <= 0) return 0;

        let discount = 0;

        if (type === "PERCENTAGE") {
            if (value > 100) return 0;
            discount = Math.floor((amountMinor * value) / 100);
        }

        if (type === "FIXED") {
            discount = Math.min(value, amountMinor);
        }

        if (maxDiscountMinor !== undefined) {
            discount = Math.min(discount, maxDiscountMinor);
        }

        return Math.max(0, discount);
    }

    // ===============================
    // TAX
    // ===============================
    private calculateTax(input: TaxInput): number {
        const { amountMinor, type, value, inclusive = false, maxTaxMinor } = input;

        if (amountMinor <= 0 || value <= 0) return 0;

        let tax = 0;

        if (type === "PERCENTAGE") {
            if (value > 100) return 0;

            if (inclusive) {
                tax = Math.floor(amountMinor - amountMinor / (1 + value / 100));
            } else {
                tax = Math.floor((amountMinor * value) / 100);
            }
        }

        if (type === "FIXED") {
            tax = Math.min(value, amountMinor);
        }

        if (maxTaxMinor !== undefined) {
            tax = Math.min(tax, maxTaxMinor);
        }

        return Math.max(0, tax);
    }

    // ===============================
    // INSURANCE / ADD-ON
    // ===============================
    private calculateInsurance(amountMinor: number): number {
        return 0;
    }

    // ===============================
    // FINAL PAYABLE
    // ===============================
    public async calculateNetPayable(params: {
        subscriberId: string;
        basePriceMinor: number;
        discount?: DiscountInput;
        tax?: TaxInput;
        newPlanId: string;
    }): Promise<{
        base: number;
        proration: number;
        discount: number;
        tax: number;
        insurance: number;
        netPayable: number;
    }> {
        const { subscriberId, basePriceMinor, discount, tax, newPlanId } = params;

        const proration = await this.calculateProratedAmount(subscriberId, newPlanId);
        const effectiveBase = Math.max(0, basePriceMinor - proration);
        const discountAmount = discount ? this.calculateDiscount({ ...discount, amountMinor: effectiveBase }) : 0;
        const subtotal = Math.max(0, basePriceMinor - proration - discountAmount);
        const taxAmount = tax ? this.calculateTax({ ...tax, amountMinor: subtotal }) : 0;
        const insurance = this.calculateInsurance(subtotal);
        const netPayable = Math.max(0, subtotal + taxAmount + insurance);

        return {
            base: basePriceMinor,
            proration,
            discount: discountAmount,
            tax: taxAmount,
            insurance,
            netPayable
        };
    }

    // ===============================
    // PAYMENT INIT
    // ===============================
    public async initiatePayment(params: {
        planId: string;
        subscriberId: string;
        amountMinor: number;
        discount?: DiscountInput;
        tax?: TaxInput;
        currency: string;
        provider: string;
    }): Promise<any> {
        const { planId, subscriberId, amountMinor, currency, discount, tax, provider } = params;

        //Fetch plan & subscriber
        const plan = await this.prisma.plan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new NotFoundError("Plan");
        }
        const subscriber = await this.prisma.subscriber.findUnique({
            where: { id: subscriberId },
        })
        if (!subscriber) {
            throw new NotFoundError("User (Subscriber)");
        }

        //Account engine 
        const billing = await this.calculateNetPayable({
            subscriberId,
            basePriceMinor: plan.price,
            discount: discount,
            tax: tax,
            newPlanId: planId,
        })
        //Atomic write (IdempotencyKey generation)
        const idempotencyKey = `TXN_${Date.now()}_${subscriber.id.slice(0, 8)}`;

        //payment record pending setup
        const paymentRecord = await this.prisma.payment.create({
            data: {
                planId: plan.id,
                subscriberId: subscriber.id,
                amount: billing.netPayable,
                currency: currency,
                provider: provider,
                status: "pending",
                transactionId: idempotencyKey
            }
        })

        // gateway call happens here
        return {
            paymentId: paymentRecord.id,
            transactionId: idempotencyKey,
            billingSummary: billing,
            checkoutUrl: `https://fake-gateway.com/pay/${idempotencyKey}`
        };
    }

    // ===============================
    // PAYMENT CONFIRM (WEBHOOK)
    // ===============================
    public async confirmPayment(params: {
        transactionId: string;
        success: boolean;
    }): Promise<any> {
        await this.prisma.$transaction(async (tx) => {

            //automatically update only if still pending
            const updated = await tx.payment.updateMany({
                where: {
                    transactionId: params.transactionId,
                    status: "pending"
                },
                data: {
                    status: params.success ? "success" : "failed",
                    paidAt: params.success ? new Date() : null
                }
            })
            //if no row updated -> already processed
            if (updated.count === 0) return;

            //fetch updated payment 
            const payment = await tx.payment.findUnique({
                where: { transactionId: params.transactionId }
            })

            if (!payment) return;

            if (params.success) {
                await this.subscriptionService.activateMembership(
                    payment.subscriberId,
                    payment.planId,
                    tx // Pass transaction client to keep it atomic
                );
            }
        })
    }

    // ===============================
    // ROLLBACK / RECOVERY
    // ===============================
    public async handleRollback(transactionId: string): Promise<void> {
        const payment = await this.prisma.payment.findFirst({
            where: { transactionId }
        });

        if (!payment) return;
        if (payment.status === "success") return;

        await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: "failed" }
        });
    }
}
