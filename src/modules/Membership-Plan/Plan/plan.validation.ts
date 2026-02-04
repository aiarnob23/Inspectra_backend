import { z } from "zod";

const planTypeSchema = z.enum(["basic", "pro", "enterprise"]);

const planFeatureInputSchema = z.object({
  featureId: z.string().uuid(),
  enabled: z.boolean().optional().default(true),
});

export const PlanValidation = {
  createPlan: z.object({
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

export type CreatePlanInput = z.infer<
  typeof PlanValidation.createPlan
>;
