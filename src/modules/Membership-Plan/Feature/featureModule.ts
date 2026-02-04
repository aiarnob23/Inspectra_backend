import { BaseModule } from "@/core/BaseModule";
import { FeatureService } from "./feature.service";
import { FeatureController } from "./feature.controller";
import { FeatureRoutes } from "./feature.route";
import { AppLogger } from "@/core/ logging/logger";


export class FeatureModule extends BaseModule {
  public readonly name = "FeatureModule";
  public readonly version = "1.0.0";
  public readonly dependencies = ["AuthModule"];

  private featureService!: FeatureService;
  private featureController!: FeatureController;
  private featureRoutes!: FeatureRoutes;

  protected async setupServices(): Promise<void> {
    this.featureService = new FeatureService(this.context.prisma);
    AppLogger.info("FeatureModule services initialized");
  }

  protected async setupRoutes(): Promise<void> {
    this.featureController = new FeatureController(this.featureService);
    AppLogger.info("FeatureController initialized successfully");

    this.featureRoutes = new FeatureRoutes(this.featureController);
    AppLogger.info("FeatureRoutes initialized successfully");

    this.router.use("/api/feature", this.featureRoutes.getRouter());
  }
}
