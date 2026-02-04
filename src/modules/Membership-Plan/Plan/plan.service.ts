import { BaseService } from "@/core/BaseService";
import { Plan, PrismaClient } from "@/generated/prisma";
import { ConflictError } from "@/core/errors/AppError";
import { AppLogger } from "@/core/ logging/logger";
import { CreatePlanInput } from "./plan.validation";

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
    /**
          * Create a new Plan (admin only)
          */
    async createPlan(data: CreatePlanInput): Promise<{ message: string }> {
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

    /**
 * Get all plans
 */
    async getAllPlans() {
        return this.findMany(
            {},                  // filters
            undefined,           // pagination
            { createdAt: "asc" },// orderBy
            {
                features: {
                    include: { feature: true }
                }
            }
        );
    }

    /**
     * Get single plan by id
     */
    async getPlanById(id: string) {
        const plan = await this.findById(id, {
            features: {
                include: { feature: true }
            }
        });

        if (!plan) {
            throw new ConflictError("Plan not found");
        }

        return plan;
    }

    /**
     * Update plan (price / quotas only)
     */
    async updatePlan(
        id: string,
        data: Partial<CreatePlanInput>
    ): Promise<{ message: string }> {

        await this.getPlanById(id);

        await this.updateById(
            id,
            {
                price: data.price,
                maxClients: data.maxClients,
                maxEmployees: data.maxEmployees,
                maxAssets: data.maxAssets,
            }
        );

        return { message: "Plan updated successfully" };
    }

    /**
     * Delete plan (hard delete)
     */
    async deletePlan(id: string): Promise<{ message: string }> {
        await this.getPlanById(id);

        await this.deleteById(id);

        return { message: "Plan deleted successfully" };
    }

}
