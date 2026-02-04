import { BaseService } from "@/core/BaseService";
import { Feature, PrismaClient } from "@/generated/prisma";
import { ConflictError } from "@/core/errors/AppError";
import { AppLogger } from "@/core/ logging/logger";
import { CreateFeatureInput } from "./feature.validation";


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
        data: CreateFeatureInput
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

    /**
 * Get feature by id
 */
    async getFeatureById(id: string) {
        const feature = await this.findById(id);
        if (!feature) {
            throw new ConflictError("Feature not found");
        }
        return feature;
    }

    /**
     * Update feature
     */
    async updateFeature(
        id: string,
        data: Partial<CreateFeatureInput>
    ): Promise<{ message: string }> {

        await this.getFeatureById(id);

        await this.updateById(id, data);

        return { message: "Feature updated successfully" };
    }

    /**
     * Delete feature
     */
    async deleteFeature(id: string): Promise<{ message: string }> {
        await this.getFeatureById(id);

        await this.deleteById(id);

        return { message: "Feature deleted successfully" };
    }

}
