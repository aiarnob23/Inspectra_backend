import { Request, Response, Router } from "express";
import { AssetController } from "./asset.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { validateRequest } from "@/middleware/validation";
import { AssetValidation } from "./asset.validation";

export class AssetRoutes {
    private router: Router;
    private assetController: AssetController;

    constructor(assetController: AssetController) {
        this.router = Router();
        this.assetController = assetController;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // create new asset
        this.router.post(
            '/',
            validateRequest({
                body: AssetValidation.body.addAsset
            }),
            asyncHandler((req: Request, res: Response) => this.assetController.createAsset(req, res))
        );

        // Get all assets with pagination & search
        this.router.get(
            '/',
            validateRequest({
                query: AssetValidation.query.list
            }),
            asyncHandler((req: Request, res: Response) => this.assetController.getAllAssets(req, res))
        );
        // Get asset by ID
        this.router.get(
            '/:id',
            validateRequest({
                params: AssetValidation.params.id
            }),
            asyncHandler((req: Request, res: Response) => this.assetController.getAssetById(req, res))
        );
        // PATCH /api/assets/:id
        this.router.patch(
            '/:id',
            validateRequest({
                params: AssetValidation.params.id,
                body: AssetValidation.body.updateAsset
            }),
            asyncHandler((req: Request, res: Response) => this.assetController.updateAssetById(req, res))
        );

        // Delete asset by ID
        this.router.delete(
            '/:id',
            validateRequest({
                params: AssetValidation.params.id
            }),
            asyncHandler((req: Request, res: Response) => this.assetController.deleteAsset(req, res))
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}