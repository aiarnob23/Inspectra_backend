import { AppLogger } from "@/core/ logging/logger";
import { PrismaClient } from "@/generated/prisma";
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
        
    }

}