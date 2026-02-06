import { AppLogger } from '@/core/ logging/logger';
import { prisma } from '@/core/prisma';
import { ReminderWorker } from '@/workers/ReminderWorker';
import cron from 'node-cron';

const reminderWorker = new ReminderWorker(prisma);

export function startReminderCronJob(){
    cron.schedule("0 */5 * * *", async()=>{
        AppLogger.info("⏰ Reminder cron triggered");
        AppLogger.info("Running scheduled reminder job...");
        await reminderWorker.run();
    })
}