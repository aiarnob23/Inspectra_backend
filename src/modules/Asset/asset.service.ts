import { BaseService } from "@/core/BaseService";
import { Asset, PrismaClient } from "@/generated/prisma";
import { AddAssetInput, AssetListQuery } from "./asset.validation";
import { AppLogger } from "@/core/ logging/logger";
import { NotFoundError, ConflictError } from "@/core/errors/AppError";

export class AssetService extends BaseService<Asset> {
    constructor(prisma: PrismaClient) {
        super(prisma, "Asset", {
            enableAuditFields: true,
            enableSoftDelete: false,
        });
    }

    protected getModel() {
        return this.prisma.asset;
    }

    /**
     * Create a new asset (SINGLE)
     */
    async createAsset(data: AddAssetInput , userId:string): Promise<Asset> {
        const { name, type, model, serialNumber, description, location, clientId } = data;
        const subscriber = await this.getSubscriberOrThrow(userId);
        const subscriberId = subscriber.id

        // Check if an asset with the same serial number already exists for this client
        if (serialNumber) {
            const existingAsset = await this.findOne({ serialNumber, clientId });
            if (existingAsset) {
                AppLogger.warn(`Asset with serial number ${serialNumber} already exists.`);
                throw new ConflictError("Asset with this serial number already exists");
            }
        }

        AppLogger.info(`Creating asset: ${name} for client: ${clientId}`);

        const newAsset = await this.create({
            name,
            type,
            model,
            serialNumber,
            description,
            location,
            clientId,
            subscriberId: subscriberId as string
        });

        AppLogger.info(`Created new asset: ${newAsset.name} (ID: ${newAsset.id})`);
        return newAsset;
    }

    /**
     * Get all assets with optional filtering, search, and pagination
     */
    async getAssets(subscriberId: string, query: AssetListQuery) {
        const {
            page = 1,
            limit = 10,
            search,
            clientId,
            sortBy = "createdAt",
            sortOrder = "desc",
            ...rest
        } = query;

        let filters: any = {
            ...this.buildWhereClause(rest),
            subscriberId
        };

        if (clientId) {
            filters.clientId = clientId;
        }

        if (search) {
            filters.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
                { serialNumber: { contains: search, mode: 'insensitive' } },
                { type: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ];
        }

        const offset = (page - 1) * limit;

        const result = await this.findMany(
            filters,
            { page, limit, offset },
            { [sortBy]: sortOrder },
            {  } //client:true
        );

        AppLogger.info(`Assets found : ${result.data.length}`);
        return result;
    }

    /**
     * Get an asset by ID
     */
    async getAssetById(id: string, subscriberId: string): Promise<Asset> {
        const asset = await this.findOne({ id, subscriberId }, { client: true });
        if (!asset) throw new NotFoundError("Asset");
        return asset;
    }

    /**
     * Update an asset by ID
     */
    async updateAsset(id: string, subscriberId: string, data: any): Promise<Asset> {
        // Ensure asset exists and belongs to the subscriber
        const exists = await this.findById(id);
        if (!exists) throw new NotFoundError("Asset");

        // If serial number is being updated, check for uniqueness
        if (data.serialNumber) {
            const existing = await this.findOne({
                serialNumber: data.serialNumber,
                subscriberId,
                id: { not: id }
            });
            if (existing) throw new ConflictError("Serial number already in use by another asset");
        }

        AppLogger.info(`Updating asset: ${id}`);
        const updatedAsset = await this.updateById(id, data);

        AppLogger.info(`Asset updated successfully: ${updatedAsset.name}`);
        return updatedAsset;
    }

    /**
     * Delete an asset by ID
     */
    async deleteAsset(id: string, subscriberId: string): Promise<Asset> {
        const exists = await this.findOne({ id, subscriberId });
        if (!exists) throw new NotFoundError("Asset");
        AppLogger.info(`Deleting asset: ${id}`);
        const deletedAsset = await this.deleteById(id);

        AppLogger.info(`Asset deleted: ${deletedAsset.name} (ID: ${deletedAsset.id})`);
        return deletedAsset;
    }
}