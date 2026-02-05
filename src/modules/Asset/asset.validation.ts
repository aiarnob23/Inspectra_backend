import { z } from "zod";
import { stringToNumber } from "@/utils/stringToNumber";

const BaseAssetSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    type: z.string().min(2).max(50).trim(),
    model: z.string().min(1).max(100).trim(),
    serialNumber: z.string().max(100).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    location: z.string().min(2).max(255).trim(),
    clientId: z.string().uuid("Invalid client ID"),
    subscriberId: z.string().uuid().optional(),
}).strict();

export const AssetValidation = {
    params: {
        id: z.object({ id: z.string().uuid("Invalid asset ID") }),
    },
    query: {
        list: z.object({
            page: z.preprocess((val) => stringToNumber(val) || 1, z.number().int().min(1).default(1)),
            limit: z.preprocess((val) => Math.min(Math.max(stringToNumber(val) || 10, 1), 100), z.number().int().min(1).max(100).default(10)),
            search: z.string().optional(),
            clientId: z.string().uuid().optional(),
            sortBy: z.enum(["name", "type", "model", "createdAt"]).default("createdAt"),
            sortOrder: z.enum(["asc", "desc"]).default("desc"),
        }).transform((data) => ({
            ...data,
            search: data.search?.trim() !== "" ? data.search : undefined,
        })),
    },
    body: {
        addAsset: BaseAssetSchema,
        addMultipleAssets: z.array(BaseAssetSchema).min(1).max(100),
        updateAsset: BaseAssetSchema.partial().omit({ clientId: true }).refine(data => Object.keys(data).length > 0, {
            message: "At least one field must be provided for update",
        }),
    }
};

export type AssetListQuery = z.infer<typeof AssetValidation.query.list>;
export type AddAssetInput = z.infer<typeof AssetValidation.body.addAsset>;
export type AddMultipleAssetsInput = z.infer<typeof AssetValidation.body.addMultipleAssets>;