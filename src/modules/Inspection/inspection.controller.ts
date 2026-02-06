import { BaseController } from "@/core/BaseController";
import { InspectionService } from "./inspection.service";
import { Request, Response } from "express";


export class InspectionController extends BaseController {
    constructor(private inspectionService : InspectionService){
        super();
    }

    /**
     * POST /api/inspections
     */
    public createInspection = async(req:Request, res:Response)=>{
        const body = req.validatedBody || req.body;
        const subscriberId = req.userId as string;
        this.logAction('createInspection', req, { type: body.type })
        const result = await this.inspectionService.createInspection(subscriberId, body);
        return this.sendCreatedResponse(
            res,
            "Inspection created successfully",
            result
        )
        
    }
}