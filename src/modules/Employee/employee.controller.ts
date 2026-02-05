import { BaseController } from "@/core/BaseController";
import { EmployeeService } from "./employee.service";
import { Request, Response } from "express";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";

export class EmployeeController extends BaseController {
    constructor(private employeeService: EmployeeService) {
        super();
    }

    /**
     * Create a new employee (SINGLE)
     * POST /api/employees
     */
    public createEmployee = async (req: Request, res: Response) => {
        const rawBody = req.validatedBody || req.body;
        const userId = req.userId;
        const data = { ...rawBody, subscriberId: userId };

        this.logAction(
            'create',
            req,
            { email: data.email, name: data.name }
        );
        const result = await this.employeeService.createEmployee(data);
        return this.sendCreatedResponse(
            res,
            result,
            'Employee created successfully'
        );
    }

    /**
     * Create multiple employees (BATCH)
     * POST /api/employees/batch
     */
    public createMultipleEmployees = async (req: Request, res: Response) => {
        const rawBody = req.validatedBody || req.body;
        const userId = req.userId;
        const employeesData = rawBody.map((emp: any) => ({ ...emp, subscriberId: userId }));

        this.logAction(
            'batch-create',
            req,
            { count: employeesData.length }
        );
        const result = await this.employeeService.createMultipleEmployees(employeesData);
        return this.sendCreatedResponse(
            res, result,
            'Employees created successfully'
        );
    }

    /**
     * Get all employees with filtering, sorting, and pagination
     * GET /api/employees
     */
    public getAllEmployees = async (req: Request, res: Response) => {
        const query = req.validatedQuery || req.query;
        const result = await this.employeeService.getEmployees(req.userId!, query);

        this.logAction(
            "getAllEmployees",
            req,
            { count: result.data.length }
        );
        return this.sendPaginatedResponse(
            res,
            {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrevious: result.hasPrevious
            },
            "Employees retrieved successfully",
            result.data
        );
    };

    /**
     * Get an employee by ID
     * GET /api/employees/:id
     */
    public getEmployeeById = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const { id } = params;
        this.logAction("getEmployeeById", req, { id });
        const result = await this.employeeService.getEmployeeById(id, req.userId!);
        return this.sendResponse(
            res,
            "Employee retrieved successfully",
            HTTPStatusCode.OK,
            result
        );
    };

    /**
     * Update an employee by ID
     * PPATCH /api/employees/:id
     */
    public updateEmployee = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const { id } = params;
        const body = req.validatedBody || req.body;
        this.logAction("updateEmployee", req, { id, body });
        const result = await this.employeeService.updateEmployee(id, req.userId!, body);
        return this.sendResponse(
            res,
            "Employee updated successfully",
            HTTPStatusCode.OK,
            result
        );
    };

    /**
     * Delete an employee by ID
     * DELETE /api/employees/:id
     */
    public deleteEmployee = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const { id } = params;
        this.logAction("deleteEmployee", req, { id });
        const result = await this.employeeService.deleteEmployee(id, req.userId!); 
        return this.sendResponse(
            res,
            "Employee deleted successfully",
            HTTPStatusCode.OK,
            result
        );
    }
}