import { AppLogger } from "@/core/ logging/logger";
import { PrismaClient } from "@/generated/prisma";
import { ReminderService } from "@/modules/Reminder/reminder.service";
import SESEmailService from "@/services/SESEmailService";
import { SMSService } from "@/services/SMSService";

export class ReminderWorker {
    private reminderService:ReminderService;
    private emailService:SESEmailService;
    private smsService:SMSService;

    constructor(private readonly prisma : PrismaClient) {
        this.reminderService = new ReminderService(this.prisma);
        this.emailService = new SESEmailService();
        this.smsService = new SMSService();
    }

    async run():Promise<void>{
        const reminders = await this.reminderService.getPendingReminders();
        AppLogger.info(`Found ${reminders.data.length} pending reminders by worker`);
    }

}