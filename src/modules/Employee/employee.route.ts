import { Request, Response, Router } from "express";
import { EmployeeController } from "./employee.controller";
import { asyncHandler } from "@/middleware/asyncHandler";
import { validateRequest } from "@/middleware/validation";
import { EmployeeValidation } from "./employee.validation";
import { authenticate } from "@/middleware/auth";

export class EmployeeRoutes {
    private router = Router();
    private employeeController: EmployeeController;

    constructor(employeeController: EmployeeController) {
        this.router = Router();
        this.employeeController = employeeController;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Create a single new employee
        this.router.post(
            '/',
            authenticate,
            validateRequest({
                body: EmployeeValidation.body.addEmployee,
            }),
            asyncHandler((req: Request, res: Response) => this.employeeController.createEmployee(req, res))
        );

        // Create multiple employees (Batch/CSV upload)
        this.router.post(
            '/batch',
            validateRequest({
                body: EmployeeValidation.body.addMultipleEmployees,
            }),
            asyncHandler((req: Request, res: Response) => this.employeeController.createMultipleEmployees(req, res))
        );

        // Get all employees
        this.router.get(
            "/",
            authenticate,
            validateRequest({
                query: EmployeeValidation.query.list,
            }),
            asyncHandler((req: Request, res: Response) =>
                this.employeeController.getAllEmployees(req, res)
            )
        );

        // Get employee by ID
        this.router.get(
            "/:id",
            validateRequest({
                params: EmployeeValidation.params.id,
            }),
            asyncHandler((req: Request, res: Response) =>
                this.employeeController.getEmployeeById(req, res)
            )
        );

        // Update employee
        this.router.patch(
            "/:id",
            validateRequest({
                params: EmployeeValidation.params.id,
                body: EmployeeValidation.body.updateEmployee,
            }),
            asyncHandler((req: Request, res: Response) =>
                this.employeeController.updateEmployee(req, res)
            )
        );

        // Delete employee by ID
        this.router.delete(
            "/:id",
            validateRequest({
                params: EmployeeValidation.params.id,
            }),
            asyncHandler((req: Request, res: Response) =>
                this.employeeController.deleteEmployee(req, res)
            )
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}