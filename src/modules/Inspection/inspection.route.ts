import { Request, Response, Router } from "express";
import { InspectionController } from "./inspection.controller";
import { validateRequest } from "@/middleware/validation";
import { InspectionValidation } from "./inspection.validation";
import { asyncHandler } from "@/middleware/asyncHandler";
import { authenticate } from "@/middleware/auth";


export class InspectionRoutes {
    private router = Router();

    constructor(private inspectionController: InspectionController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        //Schedule new inspection
        this.router.post(
            '/',
            authenticate,
            validateRequest({
                body: InspectionValidation.body.create,
            }),
            asyncHandler((req: Request, res: Response) => this.inspectionController.createInspection(req, res))
        );
        // List inspections
        this.router.get(
            '/',
            validateRequest({ query: InspectionValidation.query.list }),
            asyncHandler((req: Request, res: Response) => this.inspectionController.getAllInspections(req, res))
        );
        // Get inspection by ID
        this.router.get(
            "/:id",
            validateRequest({ params: InspectionValidation.params.id }),
            asyncHandler((req: Request, res: Response) =>
                this.inspectionController.getInspectionById(req, res)
            )
        );
        // Update inspection details
        this.router.patch(
            '/:id',
            validateRequest({
                params: InspectionValidation.params.id,
                body: InspectionValidation.body.update
            }),
            asyncHandler((req: Request, res: Response) => this.inspectionController.updateInspection(req, res))
        );
        // Delete inspection by ID
        this.router.delete(
            "/:id",
            validateRequest({ params: InspectionValidation.params.id }),
            asyncHandler((req: Request, res: Response) =>
                this.inspectionController.deleteInspection(req, res)
            )
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}