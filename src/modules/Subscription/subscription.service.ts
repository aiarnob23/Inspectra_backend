import { AppLogger } from "@/core/ logging/logger";
import { NotFoundError } from "@/core/errors/AppError";
import { Prisma, PrismaClient } from "@/generated/prisma";


export class SubscriptionService {

    constructor(
        private readonly prisma: PrismaClient,
    ) { }

    // ===============================
    // MEMBERSHIP ACTIVATION / RENEWAL
    // ===============================
    async activateMembership(subscriberId: string, planId: string, tx?: Prisma.TransactionClient) {
        const db = tx || this.prisma;
        AppLogger.info(`Activating membership for subscriber ${subscriberId} and plan ${planId}`);

        //fetch target plan details
        const plan = await db.plan.findUnique({
            where: { id: planId },
        })
        if (!plan) throw new NotFoundError("Plan");

        //check current membership
        const currentMembership = await db.membership.findUnique({
            where: { subscriberId }
        });
        //if current membership is active and plan matches
        if (currentMembership && currentMembership.isActive && currentMembership.planId === planId) {
            const currentEndDate = currentMembership.endDate ? new Date(currentMembership.endDate) : new Date();
            if (!plan.duration) {
                throw new Error("Plan duration is required for renewal");
            }
            const newEndDate = new Date(currentEndDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);

            const result = await db.membership.update({
                where: { id: currentMembership.id },
                data: {
                    endDate: newEndDate,
                    isActive: true
                }
            });
            AppLogger.info(`Plan renewal successful for subscriber ${subscriberId} new end date: ${newEndDate}`);
            return result;
        }
        else {
            //store memberhsip history
            if (currentMembership) {
                await db.membershipHistory.create({
                    data: {
                        subscriberId,
                        planId: currentMembership.planId,
                        startDate: currentMembership.startDate,
                        endDate: new Date(),
                        reason: currentMembership.planId === planId ? 'expired' : 'upgrade'
                    }
                });
                await db.membership.update({
                    where: { id: currentMembership.id },
                    data: {
                        isActive: false,
                        endDate: new Date()
                    }
                });
            }
            AppLogger.info(`Membership history created for subscriber ${subscriberId} `);
            //create new membership
            const planFeature = await db.planFeature.findMany({
                where: { planId }
            })
            const result = await db.membership.create({
                data: {
                    subscriberId,
                    planId: plan.id,
                    isActive: true,
                    startDate: new Date(),
                    endDate: plan.duration ? new Date(new Date().getTime() + plan.duration * 24 * 60 * 60 * 1000) : null,
                    features: {
                        create: planFeature.map((f) => ({
                            featureId: f.featureId,
                            enabled: f.enabled
                        }))
                    }
                }
            })
            AppLogger.info(`Membership created for subscriber ${subscriberId} end date: ${result.endDate}`);
            return result;
        }

    }
}