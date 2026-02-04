import { BaseController } from "@/core/BaseController";
import { Request, Response } from "express";
import { FeatureService } from "./feature.service";

export class FeatureController extends BaseController {
    constructor(private readonly featureService: FeatureService) {
        super();
    }

    /**
     * Create feature
     * POST /api/feature/create
     */
    public create = async (req: Request, res: Response) => {
        const body = req.validatedBody || req.body;
        this.logAction("create", req, { key: body.key });

        const result = await this.featureService.createFeature(body);
        return this.sendCreatedResponse(res, result, "Feature created successfully");
    };

    /**
     * Get all features
     * GET /api/feature
     */
    public getAll = async (_req: Request, res: Response) => {
        const features = await this.featureService.getAllFeatures();
        return this.sendResponse(res, "Features fetched", undefined, features);
    };

    /**
     * Get single feature
     * GET /api/feature/:id
     */
    public getOne = async (req: Request, res: Response) => {
        const feature = await this.featureService.getFeatureById(req.params.id);
        return this.sendResponse(res, "Feature fetched", undefined, feature);
    };

    /**
     * Update feature
     * PUT /api/feature/:id
     */
    public update = async (req: Request, res: Response) => {
        const result = await this.featureService.updateFeature(
            req.params.id,
            req.validatedBody || req.body
        );

        return this.sendResponse(res, result.message);
    };

    /**
     * Delete feature
     * DELETE /api/feature/:id
     */
    public delete = async (req: Request, res: Response) => {
        const result = await this.featureService.deleteFeature(req.params.id);
        return this.sendResponse(res, result.message);
    };
}
