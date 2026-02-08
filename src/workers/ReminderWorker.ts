import { AppLogger } from "@/core/ logging/logger";
import { NotFoundError } from "@/core/errors/AppError";
import { PrismaClient, ReminderStatus } from "@/generated/prisma";
import { ReminderService } from "@/modules/Reminder/reminder.service";
import SESEmailService from "@/services/SESEmailService";
import { SMSService } from "@/services/SMSService";

export class ReminderWorker {
    private reminderService: ReminderService;
    private emailService: SESEmailService;
    private smsService: SMSService;

    constructor(private readonly prisma: PrismaClient) {
        this.reminderService = new ReminderService(this.prisma);
        this.emailService = new SESEmailService();
        this.smsService = new SMSService();
    }

    async run(): Promise<void> {
        AppLogger.info("🔔 Reminder worker started")

        const now = new Date();
        const reminders = await this.reminderService.getPendingReminders(now);
        if (reminders.data.length === 0) {
            AppLogger.info("No pending reminders found")
            return;
        }

        AppLogger.info(`Processing ${reminders.data.length} reminders`);

        for (const reminder of reminders.data) {
            await this.processReminder(reminder);
        }
        AppLogger.info("🏁 ReminderWorker finished");
    }

    private async processReminder(reminder: any): Promise<void> {
        try {
            //client exists
            const client = await this.prisma.client.findUnique({
                where: {
                    id: reminder.clientId
                }
            })
            if (!client) {
                AppLogger.warn(`❌ Reminder ${reminder.id} failed: Client not found`);
                await this.prisma.reminder.update(
                    {
                        where: { id: reminder.id },
                        data: {
                            status: ReminderStatus.failed,
                            attempts: { increment: 1 },
                            failedAt: new Date(),
                            failReason: "Client not found"
                        }
                    },
                )
                return
            }

            //at least one employee is required
            const employees = reminder.inspection?.employees || [];
            if (employees.length === 0) {
                AppLogger.warn(`❌ Reminder ${reminder.id} failed: No employee assigned to inspection`);
                await this.prisma.reminder.update(
                    {
                        where: { id: reminder.id },
                        data: {
                            status: ReminderStatus.failed,
                            attempts: { increment: 1 },
                            failedAt: new Date(),
                            failReason: "No employee assigned to inspection"
                        }
                    },
                )
            }

            //lock reminder
            await this.prisma.reminder.update({
                where: { id: reminder.id },
                data: {
                    status: "processing",
                }
            });

            //Employee emails
            for (const emp of employees) {
                if (!emp.email) continue;

                await this.emailService.sendTemplatedEmail(
                    "reminders/employee-inspection-reminder", {
                    to: emp.email,
                    subject: "Upcoming Inspection Reminder",
                    templateData: {
                        employeeName: emp.name,
                        inspectionDate: reminder.inspection.scheduledAt,
                        assetName: reminder.inspection.asset.name,
                        assetModel: reminder.inspection.asset.model,
                        location: reminder.inspection.asset.location,
                    },
                }
                );
            }
            //Client email
            if (reminder.inspection.client?.email) {
                await this.emailService.sendTemplatedEmail(
                    "reminders/client-inspection-reminder", {
                    to: client.email,
                    subject: "Inspection Scheduled for your Asset",
                    templateData: {
                        clientName: client.name,
                        assetName: reminder.inspection.asset.name,
                        assetModel: reminder.inspection.asset.model,
                        location: reminder.inspection.asset.location,
                        inspectionDate: reminder.inspection.scheduledAt
                    }
                }
                )
            }
            //update success status
            await this.prisma.reminder.update({
                where: { id: reminder.id },
                data: {
                    status: "success",
                    sentAt: new Date(),
                }
            });
            AppLogger.info(`✅ Reminder sent to all for ${reminder.id}`);
        }
        catch (error) {
            AppLogger.error(`❌ Reminder ${reminder.id} failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            await this.prisma.reminder.update(
                {
                    where: { id: reminder.id },
                    data: {
                        status: ReminderStatus.failed,
                        attempts: { increment: 1 },
                        failedAt: new Date(),
                        failReason: error instanceof Error ? error.message : "Unknown error"
                    }
                },
            )
        }
    }

}

