import { z } from "zod";
import { stringToNumber } from "@/utils/stringToNumber";

// Base schema for reusability
const BaseEmployeeSchema = z.object({
    e_id: z.string().max(50).optional(),
    name: z.string().min(2, "Name is too short").max(100).trim(),
    email: z.string().email("Invalid email").max(255).optional().or(z.literal('')),
    phone: z.string().max(20).optional(),
    subscriberId: z.string().uuid().optional(), 
}).strict();

export const EmployeeValidation = {
    params: {
        id: z.object({ id: z.string().uuid("Invalid employee ID") }),
    },
    query: {
        list: z.object({
            page: z.preprocess((val) => stringToNumber(val) || 1, z.number().int().min(1).default(1)),
            limit: z.preprocess((val) => Math.min(Math.max(stringToNumber(val) || 10, 1), 100), z.number().int().min(1).max(100).default(10)),
            search: z.string().optional(),
            sortBy: z.enum(["id", "e_id", "name", "email", "createdAt"]).default("createdAt"),
            sortOrder: z.enum(["asc", "desc"]).default("desc"),
        }).transform((data) => ({
            ...data,
            search: data.search?.trim() !== "" ? data.search : undefined,
        })),
    },
    body: {
        addEmployee: BaseEmployeeSchema,
        // Batch Add Schema
        addMultipleEmployees: z.array(BaseEmployeeSchema)
            .min(1, "At least one employee required")
            .max(100, "Cannot process more than 100 employees at once"),
        updateEmployee: BaseEmployeeSchema.partial().refine(data => Object.keys(data).length > 0, {
            message: "At least one field must be provided for update",
        }),
    }
};

export type AddEmployeeInput = z.infer<typeof EmployeeValidation.body.addEmployee>;
export type AddMultipleEmployeesInput = z.infer<typeof EmployeeValidation.body.addMultipleEmployees>;
export type EmployeeListQuery = z.infer<typeof EmployeeValidation.query.list>;