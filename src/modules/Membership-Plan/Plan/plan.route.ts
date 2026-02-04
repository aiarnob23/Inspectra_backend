import { Request, Response, Router } from "express";
import { PlanController } from "./plan.controller";
import { validateRequest } from "@/middleware/validation";
import { PlanValidation } from "./plan.validation";
import { asyncHandler } from "@/middleware/asyncHandler";


export class PlanRoutes {
    private router: Router;
    private planController: PlanController;

    constructor(planController: PlanController) {
        this.router = Router();
        this.planController = planController;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {

        //Create a new plan
        this.router.post(
            '/create',
            validateRequest({
                body: PlanValidation.createPlan
            }),
            asyncHandler((req: Request, res: Response) => this.planController.create(req, res))
        );

        //Get all plan
        this.router.get(
            "/",
            asyncHandler((req, res) => this.planController.getAll(req, res))
        );

        // Get by id
        this.router.get(
            "/:id",
            asyncHandler((req, res) => this.planController.getOne(req, res))
        );

        // UPDATE
        this.router.patch(
            "/:id",
            validateRequest({ body: PlanValidation.createPlan.partial() }),
            asyncHandler((req, res) => this.planController.update(req, res))
        );

        // DELETE
        this.router.delete(
            "/:id",
            asyncHandler((req, res) => this.planController.delete(req, res))
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}