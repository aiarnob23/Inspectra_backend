import { Request, Response, Router } from "express";
import { InspectionController } from "./inspection.controller";
import { validateRequest } from "@/middleware/validation";
import { InspectionValidation } from "./inspection.validation";
import { asyncHandler } from "@/middleware/asyncHandler";


export class InspectionRoutes {
    private router = Router();

    constructor(private inspectionController : InspectionController){
        this.initializeRoutes();
    }

    private initializeRoutes(){
        //Schedule new inspection
        this.router.post(
            '/',
            validateRequest({
                body:InspectionValidation.body.create,
            }),
            asyncHandler((req:Request, res:Response)=>this.inspectionController.createInspection(req,res))
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}