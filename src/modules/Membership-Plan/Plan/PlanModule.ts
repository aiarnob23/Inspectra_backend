import { BaseModule } from "@/core/BaseModule";
import { PlanService } from "./plan.service";
import { PlanController } from "./plan.controller";
import { PlanRoutes } from "./plan.route";
import { AppLogger } from "@/core/ logging/logger";

export class PlanModule extends BaseModule {
  public readonly name = "PlanModule";
  public readonly version = "1.0.0";
  public readonly dependencies = ["AuthModule"];

  private planService!:PlanService;
  private planController!:PlanController;
  private planRoutes!:PlanRoutes;

  protected async setupServices() {
    this.planService = new PlanService(this.context.prisma);
    AppLogger.info("PlanModule services initialized");
  }

  protected async setupRoutes():Promise<void>{
    this.planController = new PlanController(this.planService);
    AppLogger.info('PlanControlelr initialized successfully');

    this.planRoutes = new PlanRoutes(this.planController);
    AppLogger.info('PlanRoutes initialized successfully');

    this.router.use('/api/plan', this.planRoutes.getRouter());
  }
}
