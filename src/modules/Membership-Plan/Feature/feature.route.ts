import { Router, Request, Response } from "express";
import { FeatureController } from "./feature.controller";
import { validateRequest } from "@/middleware/validation";
import { asyncHandler } from "@/middleware/asyncHandler";
import { PlanValidation } from "../Plan/plan.validation";
import { FeatureValidation } from "./feature.validation";

export class FeatureRoutes {
    private router: Router;

    constructor(private readonly controller: FeatureController) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {

        // CREATE
        this.router.post(
            "/create",
            validateRequest({ body: FeatureValidation.createFeature }),
            asyncHandler((req: Request, res: Response) =>
                this.controller.create(req, res)
            )
        );

        // READ ALL
        this.router.get(
            "/",
            asyncHandler((req: Request, res: Response) =>
                this.controller.getAll(req, res)
            )
        );

        // READ ONE
        this.router.get(
            "/:id",
            asyncHandler((req: Request, res: Response) =>
                this.controller.getOne(req, res)
            )
        );

        // UPDATE
        this.router.put(
            "/:id",
            validateRequest({ body: FeatureValidation.createFeature.partial() }),
            asyncHandler((req: Request, res: Response) =>
                this.controller.update(req, res)
            )
        );

        // DELETE
        this.router.delete(
            "/:id",
            asyncHandler((req: Request, res: Response) =>
                this.controller.delete(req, res)
            )
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}
