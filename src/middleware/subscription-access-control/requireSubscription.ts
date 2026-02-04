import { PrismaClient } from "@/generated/prisma";
import { NextFunction, Response } from "express";
import { RequestWithUser } from "../auth";
import { AuthenticationError, AuthorizationError } from "@/core/errors/AppError";

const prisma = new PrismaClient();


export const requireActiveSubscription = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    if (!req.userId) {
        throw new AuthenticationError('User not authenticated');
    }

    //only subscriber(service provider) need subscription
    if (req.userRole !== 'subscriber') return next();

    const subscriber = await prisma.subscriber.findUnique({
        where: { userId: req.userId },
        include: {
            membership: {
                include: {
                    plan: true,
                    features: {
                        where: { enabled: true },
                        include: { feature: true }
                    }
                }
            }
        }
    });

    if (!subscriber || !subscriber.membership || !subscriber.membership.isActive) {
        throw new AuthorizationError('Active subscription required');
    }

    const membership = subscriber.membership;
    req.subscriberId = subscriber.id;
    req.membership = {
        planType: membership.plan.type,
        expiresAt: membership.endDate ?? undefined,
        features: membership.features.map(f => f.feature.key),
    }

    next();
}