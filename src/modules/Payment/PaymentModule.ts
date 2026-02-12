import { PrismaClient } from "@/generated/prisma";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { SubscriptionService } from "../Subscription/subscription.service";
import { PaymentRoutes } from "./payment.route";
import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@/core/ logging/logger";

export class PaymentModule extends BaseModule {
    public readonly name = 'PaymentModule';
    public readonly version = '1.0.0';
    public readonly dependencies = [];

    private paymentService!: PaymentService;
    private paymentController!: PaymentController;
    private paymentRoutes!: PaymentRoutes;


    /**
     * Setup module services
     */
    protected async setupServices(): Promise<void> {
        this.paymentService = new PaymentService(this.context.prisma, new SubscriptionService(this.context.prisma));
        AppLogger.info('PaymentService initialized successfully');
    }

    /**
       * Setup module routes
       */
    protected async setupRoutes(): Promise<void> {
        this.paymentController = new PaymentController(this.paymentService);
        AppLogger.info('EmployeeController initialized successfully');

        this.paymentRoutes = new PaymentRoutes(this.paymentController);
        AppLogger.info('EmployeeRoutes initialized successfully');

        this.router.use('/api/employees', this.paymentRoutes.getRouter());
    }
}
