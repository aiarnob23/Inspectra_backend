import { BaseService } from "@/core/BaseService";
import { Inspection, InspectionStatus, PrismaClient } from "@/generated/prisma";
import { CreateInspectionInput, InspectionListQuery, UpdateInspectionInput } from "./inspection.validation";
import { AppLogger } from "@/core/ logging/logger";
import { NotFoundError } from "@/core/errors/AppError";


export class InspectionService extends BaseService<Inspection> {
    constructor(prisma: PrismaClient) {
        super(
            prisma, "Inspection", {
            enableAuditFields: true,
            enableSoftDelete: false
        }
        )
    }

    protected getModel() {
        return this.prisma.inspection;
    }


    /**
     * Create a new inspection with reminders and assignments (Atomic Transaction)
     */
    async createInspection(subscriberId: string, data: CreateInspectionInput): Promise<Inspection> {
        const { clientId, assetId, frequency, scheduledAt, reminders, employeeIds } = data;

        AppLogger.info(`Creating inspection for asset: ${assetId} for client: ${clientId} , frequency: ${frequency}, scheduledAt: ${scheduledAt}, reminders: ${reminders.length}, employees: ${employeeIds.length}`);
        const result = await this.prisma.$transaction(async (tx) => {
            //create new inspection record
            const newInspection = await tx.inspection.create({
                data: {
                    subscriberId,
                    clientId,
                    assetId,
                    frequency,
                    scheduledAt: new Date(scheduledAt),
                    status: InspectionStatus.pending,
                }
            })
            AppLogger.info(`Created new inspection `, newInspection)
            //create reminders (one to many)
            const newReminders = await tx.reminder.createMany({
                data: reminders.map(r => ({
                    inspectionId: newInspection.id,
                    method: r.method,
                    additionalNotes: r.additionalNotes || "",
                    isSent: false,
                }))
            })
            AppLogger.info(`Created new reminders for inspection: ${newInspection.id} `,newReminders)
            //create employee assignments 
            const newEmployeeAssignments = await tx.inspectionAssignment.createMany({
                data: employeeIds.map(e => ({
                    employeeId: e,
                    inspectionId: newInspection.id
                }))
            })
            AppLogger.info(`Created new employee assignments for inspection: ${newInspection.id} `,newEmployeeAssignments)
            return newInspection;
        })
        return result;
    }

    /**
     * Get inspections with filtering and pagination
     */
    async getInspections(subscriberId: string, query: InspectionListQuery) {
        const { page = 1, limit = 10, sortBy, sortOrder, ...rest } = query;
        const filters: any = { ...rest, subscriberId, deletedAt: null };

        const offset = (page - 1) * limit;
        const result = await this.findMany(
            filters,
            { page, limit, offset },
            { [sortBy]: sortOrder },
            {
                client: true,
                asset: true,
                assignments: { include: { employee: true } },
                reminder: true
            }
        );

        AppLogger.info(`Inspections found: ${result.data.length}`);
        return result;
    }

    /**
     * Get an inspection by ID with relations
     */
    async getInspectionById(id: string, subscriberId: string): Promise<Inspection> {
        const inspection = await this.prisma.inspection.findFirst({
            where: { id, subscriberId, deletedAt: null },
            include: {
                client: true,
                asset: true,
            }
        });

        if (!inspection) throw new NotFoundError("Inspection");
        return inspection;
    }

    /**
     * Update inspection status or schedule
     */
    async updateInspection(id: string, subscriberId: string, data: UpdateInspectionInput): Promise<Inspection> {
        const exists = await this.findOne({ id, subscriberId, deletedAt: null });
        if (!exists) throw new NotFoundError("Inspection not found");

        AppLogger.info(`Updating inspection: ${id}`);
        return await this.updateById(id, data);
    }

}