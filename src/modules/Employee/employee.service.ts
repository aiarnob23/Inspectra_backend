import { BaseService } from "@/core/BaseService";
import { Employee, PrismaClient } from "@/generated/prisma";
import { AddEmployeeInput, AddMultipleEmployeesInput, EmployeeListQuery } from "./employee.validation";
import { AppError, ConflictError, NotFoundError } from "@/core/errors/AppError";
import { AppLogger } from "@/core/ logging/logger";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";

export class EmployeeService extends BaseService<Employee> {
    constructor(prisma: PrismaClient) {
        super(prisma, "Employee", {
            enableAuditFields: true,
            enableSoftDelete: false,
        });
    }

    protected getModel() {
        return this.prisma.employee;
    }

    /**
     * Create a new employee (SINGLE)
     */
    async createEmployee(data: AddEmployeeInput): Promise<Employee> {
        const exists = await this.findOne({ email: data.email })
        if (exists) {
            AppLogger.warn(`Employee with email ${data.email} already exists.`);
            throw new ConflictError("Employee with this email already exists");
        }
        AppLogger.info(`Creating new employee. email:${data.email} name:${data.name}`);
        const newEmployee = await this.create(data);
        AppLogger.info(`Created new employee. email:${newEmployee.email} name:${newEmployee.name}`);
        return newEmployee
    }

    /**
     * Create multiple employees (BATCH/CSV)
     */
    async createMultipleEmployees(data: AddMultipleEmployeesInput): Promise<Employee[]> {
        const normalizedData = data.map((emp) => ({
            ...emp,
            email: emp.email?.toLowerCase().trim() || null,
            subscriberId: emp.subscriberId as string
        }));

        const emails = normalizedData.map(e => e.email).filter(Boolean) as string[];
        //check if emails already exist
        if (emails.length > 0) {
            const existingEmployees = await this.prisma.employee.findMany({
                where: {
                    email: { in: emails },
                },
                select: { email: true }
            });

            if (existingEmployees.length > 0) {
                const existingEmails = existingEmployees.map(e => e.email).join(", ");
                throw new ConflictError(`Emails already exist: ${existingEmails}`);
            }
        }

        try {
            return await this.prisma.$transaction(async (tx) => {
                AppLogger.info(`Starting batch creation for ${normalizedData.length} employees.`);
                const createdResult = await tx.employee.createMany({
                    data: normalizedData,
                    skipDuplicates: false,
                });

                AppLogger.info(`Batch creation completed. ${createdResult.count} employees created.`);

                // Return the created employees (simplified fetch)
                return tx.employee.findMany({
                    where: { subscriberId: normalizedData[0].subscriberId },
                    orderBy: { createdAt: 'desc' },
                    take: createdResult.count
                });
            });
        } catch (error) {
            AppLogger.error(`Error creating employees: ${error}`);
            throw new AppError(HTTPStatusCode.BAD_REQUEST, 'Employee batch creation error');
        }
    }

    /**
     * Get all employees with filtering, search, and pagination
     */
    async getEmployees(subscriberId: string, query: EmployeeListQuery) {

        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', ...rest } = query;
        let filters: any = { ...this.buildWhereClause({ rest }) };
        if (subscriberId) {
            filters.subscriberId = subscriberId;
        }
        if (search) {
            filters.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { e_id: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const offset = (page - 1) * limit;

        const result = await this.findMany(
            filters,
            { page, limit, offset },
            { [sortBy]: sortOrder },
            {}//subscriber: true
        )

        AppLogger.info(`Employees found : ${result.data.length}`);
        return result;
    }

    /**
     * Get an employee by ID
     */
    async getEmployeeById(id: string, subscriberId: string): Promise<Employee> {
        const employee = await this.findOne({ id, subscriberId });
        if (!employee) throw new NotFoundError("Employee");
        return employee;
    }

    /**
     * Update an employee by ID
     */
    async updateEmployee(id: string, subscriberId: string, data: Partial<AddEmployeeInput>): Promise<Employee> {
        const exists = await this.findOne({ id, subscriberId });
        if (!exists) throw new NotFoundError("Employee");
        AppLogger.info(`Updating employee: ${data.email}`);
        const updatedEmployee = await this.getEmployeeById(id, subscriberId);
        AppLogger.info(`Employee updated successfully: ${updatedEmployee.email}`);
        return updatedEmployee;
    }

    /**
     * Delete an employee by ID
     */
    async deleteEmployee(id: string, subscriberId: string): Promise<Employee> {
        const exists = await this.findOne({ id, subscriberId });
        if (!exists) throw new NotFoundError("Employee");
        const deletedEmployee = await this.deleteById(id);
        AppLogger.info(`Deleted employee: ${deletedEmployee.email}`);
        return deletedEmployee;
    }
}