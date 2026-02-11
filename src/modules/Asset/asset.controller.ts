import { BaseController } from "@/core/BaseController";
import { AssetService } from "./asset.service";
import { Request, Response } from "express";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";

export class AssetController extends BaseController {
    constructor(private assetService: AssetService) {
        super();
    }

    /**
     * Create a new Asset
     * POST /api/assets
     */
    public createAsset = async (req: Request, res: Response) => {
        const body = req.validatedBody || req.body;
        const userId = req.userId as string;
        this.logAction(
            "createAsset",
            req,
            { body }
        );
        const result = await this.assetService.createAsset(body, userId);
        return this.sendCreatedResponse(
            res,
            "Asset created successfully",
            result,
        );
    };

    /**
      * Get all Assets with filtering, sorting, and pagination
      * GET /api/assets
      */
    public getAllAssets = async (req: Request, res: Response) => {
        const query = req.validatedQuery || req.query;
        const result = await this.assetService.getAssets(req.userId!, query);
        this.logAction("getAllAssets", req, { count: result.data.length });
        return this.sendPaginatedResponse(
            res,
            {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrevious: result.hasPrevious,
            },
            "Assets retrieved successfully",
            result.data,
        );
    };
    /**
      * Get an asset by ID
      * GET /api/assets/:id
      */
    public getAssetById = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const { id } = params;
        this.logAction("getAssetById", req, { id });
        const result = await this.assetService.getAssetById(
            req.params.id,
            req.userId!,
        );
        return this.sendResponse(
            res,
            "Asset retrieved successfully",
            HTTPStatusCode.OK,
            result,
        );
    };
    /**
      * Update an Asset by ID
      * PATCH /api/assets/:id
      */
    public updateAssetById = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const body = req.validatedBody || req.body;
        const { id } = params;
        this.logAction("updateAssetById", req, { id, body });
        const result = await this.assetService.updateAsset(
            id,
            body,
            req.userId!,
        )
        return this.sendResponse(
            res,
            "Asset updated successfully",
            HTTPStatusCode.OK,
            result,
        );
    };
    /**
  * Delete an asset by ID
  * DELETE /api/assets/:id
  */
    public deleteAsset = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const { id } = params;
        this.logAction("deleteAsset", req, { id });
        const result = await this.assetService.deleteAsset(id, req.userId!);
        return this.sendResponse(
            res,
            "Asset deleted successfully",
            HTTPStatusCode.OK,
            result
        );
    };
}
