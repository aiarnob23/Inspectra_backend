import { BaseController } from "@/core/BaseController";
import { PlanService } from "./plan.service";
import { Request, Response } from "express";

export class PlanController extends BaseController {
    constructor(private planService: PlanService) {
        super()
    }

    /**
     * Create a new plan
     * POST /api/plan/create
     */
    public create = async (req: Request, res: Response) => {
        const body = req.validatedBody || req.body;
        this.logAction('create', req, { type: body.type })

        const result = await this.planService.createPlan(body);

        return this.sendCreatedResponse(res, result, 'Plan created succeddfully');
    }

    /**
 * Get all plans
 * GET /api/plan
 */
    public getAll = async (req: Request, res: Response) => {
        const plans = await this.planService.getAllPlans();
        return this.sendResponse(res, "Plans fetched", undefined, plans);
    };

    /**
 * Get plan by id
 * GET /api/plan/:id
 */
    public getOne = async (req: Request, res: Response) => {
        const plan = await this.planService.getPlanById(req.params.id);
        return this.sendResponse(res, "Plan fetched", undefined, plan);
    };

    /**
     * Update plan
     * PUT /api/plan/:id
     */
    public update = async (req: Request, res: Response) => {
        const result = await this.planService.updatePlan(
            req.params.id,
            req.validatedBody || req.body
        );
        return this.sendResponse(res, result.message);
    };

    /**
     * Delete plan
     * DELETE /api/plan/:id
     */
    public delete = async (req: Request, res: Response) => {
        const result = await this.planService.deletePlan(req.params.id);
        return this.sendResponse(res, result.message);
    };

}