// fileName: ReminderModule.ts

import { BaseModule } from "@/core/BaseModule";
import { ReminderService } from "./reminder.service";
import { ReminderController } from "./reminder.controller";
import { ReminderRoutes } from "./reminder.route";
import { AppLogger } from "@/core/ logging/logger";

export class ReminderModule extends BaseModule {
    public readonly name = 'ReminderModule';
    public readonly version = '1.0.0';
    public readonly dependencies = [];

    private reminderService!: ReminderService;
    private reminderController!: ReminderController;
    private reminderRoutes!: ReminderRoutes;

    /**
     * Setup module services
     */
    protected async setupServices(): Promise<void> {
        this.reminderService = new ReminderService(this.context.prisma);
        AppLogger.info('ReminderService initialized successfully');
    }

    /**
     * Setup module routes
     */
    protected async setupRoutes(): Promise<void> {
        this.reminderController = new ReminderController(this.reminderService);
        AppLogger.info('ReminderController initialized successfully');
        this.reminderRoutes = new ReminderRoutes(this.reminderController);
        AppLogger.info('ReminderRoutes initialized successfully');

        this.router.use("/api/reminders", this.reminderRoutes.getRouter());
    }
}