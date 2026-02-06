import { BaseModule } from "@/core/BaseModule";
import { ClientService } from "./client.service";
import { ClientController } from "./client.controller";
import { ClientRoutes } from "./client.route";
import { AppLogger } from "@/core/ logging/logger";

export class ClientModule extends BaseModule {
    public readonly name = 'ClientModule';
    public readonly version = '1.0.0';
    public readonly dependencies = [];

    private clientService!: ClientService;
    private clientController!: ClientController;
    private clientRoutes!: ClientRoutes;

    /**
       * Setup module services
       */
    protected async setupServices(): Promise<void> {
        this.clientService = new ClientService(this.context.prisma);
        AppLogger.info('ClientService initialized successfully');
    }

    /**
     * Setup module routes
     */
    protected async setupRoutes(): Promise<void> {
        this.clientController = new ClientController(this.clientService);
        AppLogger.info('ClientController initialized successfully');

        this.clientRoutes = new ClientRoutes(this.clientController);
        AppLogger.info('ClientRoutes initialized successfully');

        this.router.use('/api/clients', this.clientRoutes.getRouter());
    }

}