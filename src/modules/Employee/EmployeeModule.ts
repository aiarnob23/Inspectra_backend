import { BaseModule } from "@/core/BaseModule";
import { EmployeeService } from "./employee.service";
import { EmployeeController } from "./employee.controller";
import { EmployeeRoutes } from "./employee.route";
import { AppLogger } from "@/core/ logging/logger";

export class EmployeeModule extends BaseModule {
    public readonly name = 'EmployeeModule';
    public readonly version = '1.0.0';
    public readonly dependencies = [];

    private employeeService!: EmployeeService;
    private employeeController!: EmployeeController;
    private employeeRoutes!: EmployeeRoutes;

    /**
     * Setup module services
     */
    protected async setupServices(): Promise<void> {
        this.employeeService = new EmployeeService(this.context.prisma);
        AppLogger.info('EmployeeService initialized successfully');
    }

    /**
     * Setup module routes
     */
    protected async setupRoutes(): Promise<void> {
        this.employeeController = new EmployeeController(this.employeeService);
        AppLogger.info('EmployeeController initialized successfully');

        this.employeeRoutes = new EmployeeRoutes(this.employeeController);
        AppLogger.info('EmployeeRoutes initialized successfully');

        this.router.use('/api/employees', this.employeeRoutes.getRouter());
    }
}