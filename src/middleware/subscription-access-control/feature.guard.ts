import { NextFunction } from "express";
import { RequestWithUser } from "../auth";
import { AuthorizationError } from "@/core/errors/AppError";

export const requireFeature = (...requiredFeatures: string[]) => {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {

        if (!req.membership) {
            throw new AuthorizationError('Subscription not loaded');
        }

        const enabledFeatures = req.membership.features;

        const hasAccess = requiredFeatures.every(f =>
            enabledFeatures.includes(f)
        );
        if (!hasAccess) {
            throw new AuthorizationError(
                `Feature access denied. Required: ${requiredFeatures.join(', ')}`
            );

        }

        next();
    };
}