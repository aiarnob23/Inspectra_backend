import { AppLogger } from "@/core/ logging/logger";
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
    AppLogger.info("🔔 Reminder worker started");

    const reminders = await this.reminderService.getPendingReminders(new Date());

    if (!reminders.data.length) {
      AppLogger.info("No pending reminders found");
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
      // 🔒 Atomic Lock (only process if still pending/failed)
      const locked = await this.prisma.reminder.updateMany({
        where: {
          id: reminder.id,
          status: { in: [ReminderStatus.pending, ReminderStatus.failed] },
        },
        data: {
          status: ReminderStatus.processing,
        },
      });

      // If already processing or handled → skip
      if (locked.count === 0) return;

      const inspection = reminder.inspection;
      if (!inspection) {
        return this.failReminder(reminder.id, "Inspection not found");
      }

      const client = inspection.client;
      if (!client) {
        return this.failReminder(reminder.id, "Client not found");
      }

      const employees =
        inspection.assignments?.map((a: any) => a.employee) || [];

      if (!employees.length) {
        return this.failReminder(
          reminder.id,
          "No employee assigned to inspection"
        );
      }

      // ----------------------
      // Send Employee Emails
      // ----------------------
      for (const emp of employees) {
        if (!emp?.email) continue;

        await this.emailService.sendTemplatedEmail(
          "reminders/employee-inspection-reminder",
          {
            to: emp.email,
            subject: "Upcoming Inspection Reminder",
            templateData: {
              employeeName: emp.name,
              inspectionDate: inspection.scheduledAt,
              assetName: inspection.asset.name,
              assetModel: inspection.asset.model,
              location: inspection.asset.location,
            },
          }
        );
      }

      // ----------------------
      // Send Client Email
      // ----------------------
      if (client.email) {
        await this.emailService.sendTemplatedEmail(
          "reminders/client-inspection-reminder",
          {
            to: client.email,
            subject: "Inspection Scheduled for your Asset",
            templateData: {
              clientName: client.name,
              assetName: inspection.asset.name,
              assetModel: inspection.asset.model,
              location: inspection.asset.location,
              inspectionDate: inspection.scheduledAt,
            },
          }
        );
      }

      // ----------------------
      // Mark Success
      // ----------------------
      await this.prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          status: ReminderStatus.success,
          isSent: true,
          sentAt: new Date(),
        },
      });

      AppLogger.info(`✅ Reminder sent for ${reminder.id}`);
    } catch (error: any) {
      await this.failReminder(
        reminder.id,
        error?.message || "Unknown error"
      );
    }
  }

  private async failReminder(id: string, reason: string) {
    AppLogger.warn(`❌ Reminder ${id} failed: ${reason}`);

    await this.prisma.reminder.update({
      where: { id },
      data: {
        status: ReminderStatus.failed,
        attempts: { increment: 1 },
        failedAt: new Date(),
        failReason: reason,
      },
    });
  }
}
