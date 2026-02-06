import { BaseController } from "@/core/BaseController";
import { InspectionService } from "./inspection.service";
import { Request, Response } from "express";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";


export class InspectionController extends BaseController {
    constructor(private inspectionService: InspectionService) {
        super();
    }

    /**
     * POST /api/inspections
     */
    public createInspection = async (req: Request, res: Response) => {
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

    /**
     * GET /api/inspections
     */
    public getAllInspections = async (req: Request, res: Response) => {
        const query = req.validatedQuery || req.query;
        const result = await this.inspectionService.getInspections(req.userId!, query);

        this.logAction("getAllInspections", req, { count: result.data.length });
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
            "Inspections retrieved successfully",
            result.data
        );
    };

    /**
     * Get an inspection by ID
     * GET /api/inspections/:id
     */
    public getInspectionById = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const subscriberId = req.userId!;
        const { id } = params;

        this.logAction("getInspectionById", req, { id });
        const result = await this.inspectionService.getInspectionById(id, subscriberId);

        return this.sendResponse(
            res,
            "Inspection retrieved successfully",
            HTTPStatusCode.OK,
            result
        );
    };

    /**
     * PATCH /api/inspections/:id
     */
    public updateInspection = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const { id } = params;
        const body = req.validatedBody || req.body;

        const result = await this.inspectionService.updateInspection(id, req.userId!, body);
        this.logAction("updateInspection", req, { inspectionId: id });

        return this.sendResponse(
            res,
            "Inspection updated successfully",
            HTTPStatusCode.OK,
            result
        );
    };

    /**
     * Delete an inspection by ID
     * DELETE /api/inspections/:id
     */
    public deleteInspection = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const { id } = params;
        const subscriberId = req.userId!;

        this.logAction("deleteInspection", req, { id });
        const result = await this.inspectionService.deleteInspection(id, subscriberId);

        return this.sendResponse(
            res,
            "Inspection deleted successfully",
            HTTPStatusCode.OK,
            result
        );
    };
}