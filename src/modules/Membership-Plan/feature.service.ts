import { BaseService } from "@/core/BaseService";
import { Feature, PrismaClient } from "@/generated/prisma";
import { createFeatureInput } from "./plan.validation";
import { ConflictError } from "@/core/errors/AppError";
import { AppLogger } from "@/core/ logging/logger";

export class FeatureService extends BaseService<Feature> {
    constructor(prisma: PrismaClient) {
        super(prisma, "Feature", {
            enableAuditFields: true,
            enableSoftDelete: false,
        });
    }

    protected getModel() {
        return this.prisma.feature;
    }

    /**
      * Create a new feature (admin only)
      */
    async createFeature(
        data: createFeatureInput
    ): Promise<{ message: string }> {
        const { key, name, description } = data;

        const exists = await this.findOne({ key });
        if (exists) {
            throw new ConflictError("Feature already exists");
        }

        const feature = await this.create({
            key,
            name,
            description,
        });

        AppLogger.info("Feature created", {
            featureId: feature.id,
            key: feature.key,
            name: feature.name,
            description: feature.description
        });

        return {
            message: 'Feature created successfully'
        };
    }

    /**
      * Get all features
      */
    async getAllFeatures() {
        return this.findMany(
            {},
            undefined,
            { key: "asc" }
        );
    }
}
