// fileName: reminder.validation.ts

import { z } from "zod";
import { stringToNumber } from "@/utils/stringToNumber";
import { ReminderMethod } from "@/generated/prisma";

// ---------------------------------------------
// ✅ Reminder Validation Schema
// ---------------------------------------------
export const ReminderValidation = {
  params: {
    id: z.object({
      id: z.string().uuid("Invalid reminder ID"),
    }),
  },

  query: {
    list: z.object({
      page: z.preprocess((val) => stringToNumber(val) || 1, z.number().int().min(1).default(1)),
      limit: z.preprocess((val) => {
        const num = stringToNumber(val) || 10;
        return Math.min(Math.max(num, 1), 100);
      }, z.number().int().min(1).max(100).default(10)),
      isSent: z.preprocess((val) => val === 'true', z.boolean().optional()),
      method: z.nativeEnum(ReminderMethod).optional(),
      inspectionId: z.string().uuid().optional(),
      sortBy: z.enum(["id", "createdAt", "sentAt", "attempts"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }),
  },

  body: {
    // Create new reminder manually for an inspection
    create: z.object({
      inspectionId: z.string().uuid("Invalid inspection ID"),
      method: z.nativeEnum(ReminderMethod),
      additionalNotes: z.string().max(500).optional(),
    }).strict(),

    // Update reminder status or delivery notes
    update: z.object({
      method: z.nativeEnum(ReminderMethod).optional(),
      additionalNotes: z.string().max(500).optional(),
      isSent: z.boolean().optional(),
      attempts: z.number().int().min(0).optional(),
    }).strict().refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
  },
};

export type CreateReminderInput = z.infer<typeof ReminderValidation.body.create>;
export type UpdateReminderInput = z.infer<typeof ReminderValidation.body.update>;
export type ReminderListQuery = z.infer<typeof ReminderValidation.query.list>;