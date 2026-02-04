import { z } from "zod";

export const FeatureValidation = {
  createFeature: z.object({
    key: z.string(),
    name: z.string().min(2),
    description: z.string().optional(),
  }),
};

export type CreateFeatureInput = z.infer<
  typeof FeatureValidation.createFeature
>;
