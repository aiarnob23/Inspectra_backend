// fileName: reminder.controller.ts

import { BaseController } from "@/core/BaseController";
import { ReminderService } from "./reminder.service";
import { Request, Response } from "express";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";

export class ReminderController extends BaseController {
    constructor(private reminderService: ReminderService) {
        super();
    }

    /**
     * POST /api/reminders
     */
    public createReminder = async (req: Request, res: Response) => {
        const body = req.validatedBody || req.body;
        this.logAction('createReminder', req, { inspectionId: body.inspectionId });
        
        const result = await this.reminderService.createReminder(body);
        return this.sendCreatedResponse(
            res,
            "Reminder created successfully",
            result, 
        );
    }

    /**
     * GET /api/reminders
     */
    public getAllReminders = async (req: Request, res: Response) => {
        const query = req.validatedQuery || req.query;
        const result = await this.reminderService.getReminders(query);

        this.logAction("getAllReminders", req, { count: result.data.length });
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
            "Reminders retrieved successfully",
            result.data
        );
    };

    /**
     * GET /api/reminders/:id
     */
    public getReminderById = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const { id } = params;

        this.logAction("getReminderById", req, { id });
        const result = await this.reminderService.getReminderById(id);

        return this.sendResponse(
            res,
            "Reminder retrieved successfully",
            HTTPStatusCode.OK,
            result
        );
    };

    /**
     * PATCH /api/reminders/:id
     */
    public updateReminder = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const { id } = params;
        const body = req.validatedBody || req.body;

        const result = await this.reminderService.updateReminder(id, body);
        this.logAction("updateReminder", req, { reminderId: id });

        return this.sendResponse(
            res,
            "Reminder updated successfully",
            HTTPStatusCode.OK,
            result
        );
    };

    /**
     * DELETE /api/reminders/:id
     */
    public deleteReminder = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const { id } = params;

        this.logAction("deleteReminder", req, { id });
        const result = await this.reminderService.deleteReminder(id);

        return this.sendResponse(
            res,
            "Reminder deleted successfully",
            HTTPStatusCode.OK,
            result
        );
    };
}