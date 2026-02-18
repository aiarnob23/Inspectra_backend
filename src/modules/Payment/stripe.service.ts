import Stripe from "stripe";

export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            typescript: true,
        });
    }

    async createCheckoutSession(params: {
        amountMinor: number;
        currency: string;
        transactionId: string;
    }) {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: params.currency,
                        product_data: {
                            name: "Membership Plan",
                        },
                        unit_amount: params.amountMinor,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                transactionId: params.transactionId,
            },
            success_url: `${process.env.CLIENT_URL}/payment-success`,
            cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
        },
        {
            idempotencyKey:params.transactionId 
        }
    );

        return session;
    }

    async verifyWebhookSignature(payload: Buffer, signature: string) {
        return await this.stripe.webhooks.constructEventAsync(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    }

}
