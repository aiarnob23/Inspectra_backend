// fileName: reminder.route.ts

import { Request, Response, Router } from "express";
import { ReminderController } from "./reminder.controller";
import { validateRequest } from "@/middleware/validation";
import { ReminderValidation } from "./reminder.validation";
import { asyncHandler } from "@/middleware/asyncHandler";

export class ReminderRoutes {
    private router = Router();

    constructor(private reminderController: ReminderController) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Create manual reminder
        this.router.post(
            '/',
            validateRequest({
                body: ReminderValidation.body.create,
            }),
            asyncHandler((req: Request, res: Response) => this.reminderController.createReminder(req, res))
        );

        // List reminders
        this.router.get(
            '/',
            validateRequest({ query: ReminderValidation.query.list }),
            asyncHandler((req: Request, res: Response) => this.reminderController.getAllReminders(req, res))
        );

        // Get by ID
        this.router.get(
            "/:id",
            validateRequest({ params: ReminderValidation.params.id }),
            asyncHandler((req: Request, res: Response) =>
                this.reminderController.getReminderById(req, res)
            )
        );

        // Update reminder details
        this.router.patch(
            '/:id',
            validateRequest({
                params: ReminderValidation.params.id,
                body: ReminderValidation.body.update
            }),
            asyncHandler((req: Request, res: Response) => this.reminderController.updateReminder(req, res))
        );

        // Delete reminder
        this.router.delete(
            "/:id",
            validateRequest({ params: ReminderValidation.params.id }),
            asyncHandler((req: Request, res: Response) =>
                this.reminderController.deleteReminder(req, res)
            )
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}