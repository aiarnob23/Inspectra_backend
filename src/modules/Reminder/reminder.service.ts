// fileName: reminder.service.ts

import { BaseService } from "@/core/BaseService";
import { Reminder, PrismaClient } from "@/generated/prisma";
import { CreateReminderInput, ReminderListQuery, UpdateReminderInput } from "./reminder.validation";
import { AppLogger } from "@/core/ logging/logger";
import { NotFoundError } from "@/core/errors/AppError";

export class ReminderService extends BaseService<Reminder> {
    constructor(prisma: PrismaClient) {
        super(
            prisma, "Reminder", {
            enableAuditFields: false, // Reminder schema doesn't have standard audit fields
            enableSoftDelete: false
        }
        )
    }

    protected getModel() {
        return this.prisma.reminder;
    }

    /**
     * Create a new reminder for an inspection
     */
    async createReminder(data: CreateReminderInput): Promise<Reminder> {
        const { inspectionId, method, additionalNotes } = data;

        AppLogger.info(`Creating reminder for inspection: ${inspectionId}, method: ${method}`);

        const newReminder = await this.create({
            data: {
                inspectionId,
                method,
                additionalNotes: additionalNotes || "",
                isSent: false,
                attempts: 0
            }
        });

        AppLogger.info(`Created new reminder: ${newReminder.id}`);
        return newReminder;
    }

    /**
     * Get reminders with filtering and pagination 
     */
    async getReminders(query: ReminderListQuery) {
        const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", ...rest } = query;
        const filters: any = { ...rest };

        const offset = (page - 1) * limit;
        const result = await this.findMany(
            filters,
            { page, limit, offset },
            { [sortBy]: sortOrder },
            {
                inspection: {
                    include: {
                        asset: true,
                        client: true
                    }
                }
            }
        );

        AppLogger.info(`Reminders found: ${result.data.length}`);
        return result;
    }

    /**
     * Get pending reminders (for cron / worker)
     */
    async getPendingReminders(now = new Date()) {
        const result = await this.findMany({
            where : {
                isSent:false,
                status:'pending',
                scheduledAt:{
                    lte:now
                }
            },
            take:50
        })
        AppLogger.info(`Pending reminders found: ${result.data.length}`);
        return result;
    }

    /**
     * Get a reminder by ID
     */
    async getReminderById(id: string): Promise<Reminder> {
        const reminder = await this.prisma.reminder.findFirst({
            where: { id },
            include: { inspection: true }
        });

        if (!reminder) throw new NotFoundError("Reminder");
        return reminder;
    }

    /**
     * Update reminder status or delivery data
     */
    async updateReminder(id: string, data: UpdateReminderInput): Promise<Reminder> {
        const exists = await this.exists({ id });
        if (!exists) throw new NotFoundError("Reminder");

        AppLogger.info(`Updating reminder: ${id}`);
        return await this.updateById(id, data);
    }

    /**
     * Delete a reminder
     */
    async deleteReminder(id: string): Promise<Reminder> {
        const exists = await this.exists({ id });
        if (!exists) throw new NotFoundError("Reminder");

        AppLogger.info(`Deleting reminder: ${id}`);
        const result = await this.deleteById(id);
        AppLogger.info(`Reminder deleted successfully: ${id}`);
        return result;
    }
}