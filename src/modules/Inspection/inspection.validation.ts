import { z } from "zod";
import { stringToNumber } from "@/utils/stringToNumber";
import { InspectionFrequency, InspectionStatus, ReminderMethod } from "@/generated/prisma";

// ---------------------------------------------
// ✅ Inspection Validation Schema
// ---------------------------------------------
export const InspectionValidation = {
  params: {
    id: z.object({
      id: z.string().uuid("Invalid inspection ID"),
    }),
  },

  query: {
    list: z.object({
      page: z.preprocess((val) => stringToNumber(val) || 1, z.number().int().min(1).default(1)),
      limit: z.preprocess((val) => {
        const num = stringToNumber(val) || 10;
        return Math.min(Math.max(num, 1), 100);
      }, z.number().int().min(1).max(100).default(10)),
      status: z.nativeEnum(InspectionStatus).optional(),
      frequency: z.nativeEnum(InspectionFrequency).optional(),
      clientId: z.string().uuid().optional(),
      assetId: z.string().uuid().optional(),
      sortBy: z.enum(["id", "scheduledAt", "status", "createdAt"]).default("scheduledAt"),
      sortOrder: z.enum(["asc", "desc"]).default("asc"),
    }),
  },

  body: {
    // Create new inspection with multiple reminders & assignments
    create: z.object({
      clientId: z.string().uuid("Invalid client ID"),
      assetId: z.string().uuid("Invalid asset ID"),
      frequency: z.nativeEnum(InspectionFrequency),
      scheduledAt: z.string().datetime(),
      // One-to-Many Reminders
      reminders: z.array(z.object({
        method: z.nativeEnum(ReminderMethod),
        additionalNotes: z.string().max(500).optional(),
      })).min(1, "At least one reminder is required"),
      // Employee assignments
      employeeIds: z.array(z.string().uuid()).min(1, "At least one employee must be assigned"),
    }).strict(),

    update: z.object({
      status: z.nativeEnum(InspectionStatus).optional(),
      scheduledAt: z.string().datetime().optional(),
      nextDueAt: z.string().datetime().optional(),
      frequency: z.nativeEnum(InspectionFrequency).optional(),
    }).strict().refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
  },
};

export type CreateInspectionInput = z.infer<typeof InspectionValidation.body.create>;
export type UpdateInspectionInput = z.infer<typeof InspectionValidation.body.update>;
export type InspectionListQuery = z.infer<typeof InspectionValidation.query.list>;