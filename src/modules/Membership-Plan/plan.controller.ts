import { BaseController } from "@/core/BaseController";
import { PlanService } from "./plan.service";
import { Request, Response } from "express";

export class PlanController extends BaseController {
    constructor(private planService : PlanService){
        super()
    }

    /**
     * Create a new plan
     * POST /api/plan/create
     */
    public create = async(req:Request, res:Response) => {
        const body = req.validatedBody || req.body;
        this.logAction('create', req, {type:body.type})

        const result = await this.planService.createPlan(body);

        return this.sendCreatedResponse(res, result, 'Plan created succeddfully');
    }
}