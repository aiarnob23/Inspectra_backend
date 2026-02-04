import { z } from "zod";

const planTypeSchema = z.enum(["basic", "pro", "enterprise"]);
const planFeatureInputSchema = z.object({
    featureId: z.string().uuid(),
    enabled: z.boolean().optional().default(true),
});

export const PlanValidation = {
    //create feature
    createFeature: z
        .object({
            key: z.string(),
            name: z.string().min(2),
            description: z.string().optional(),
        }),
    //create plan
    createPlan: z.
        object({
            type: planTypeSchema,
            price: z.number().positive(),
            maxClients: z.number().int().positive().optional(),
            maxEmployees: z.number().int().positive().optional(),
            maxAssets: z.number().int().positive().optional(),
            features: z
            .array(planFeatureInputSchema)
            .min(1, "At least one feature is required"),
        }),
};

export type createFeatureInput = z.infer<typeof PlanValidation.createFeature>;
export type createPlanInput = z.infer<typeof PlanValidation.createPlan>;