import { BaseService } from "@/core/BaseService";
import { Plan, PrismaClient } from "@/generated/prisma";
import { createPlanInput } from "./plan.validation";
import { ConflictError } from "@/core/errors/AppError";
import { AppLogger } from "@/core/ logging/logger";

export class PlanService extends BaseService<
    Plan
> {
    constructor(prisma: PrismaClient) {
        super(prisma, "Plan", {
            enableAuditFields: true,
            enableSoftDelete: false,
        });
    }

    protected getModel() {
        return this.prisma.plan;
    }

    async createPlan(data: createPlanInput): Promise<{ message: string }> {
        const {
            type,
            price,
            maxClients,
            maxAssets,
            maxEmployees,
            features,
        } = data;

        // duplicate check
        const exists = await this.findOne({ type });
        if (exists) {
            throw new ConflictError("Plan already exists");
        }

        // ✅ USING BaseService.create()
        const plan = await this.create(
            {
                type,
                price,
                maxClients,
                maxAssets,
                maxEmployees,
                features: {
                    create: features.map((f) => ({
                        featureId: f.featureId,
                        enabled: f.enabled ?? true,
                    })),
                },
            },
            {
                features: {
                    include: {
                        feature: true,
                    },
                },
            }
        );

        AppLogger.info("Plan created", {
            planId: plan.id,
            type: plan.type,
            price: plan.price,
            featuresCount: (plan as any).features?.length ?? 0,
        });

        return {
            message: "Plan created successfully",
        };
    }
}
