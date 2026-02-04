import { Request, Response, Router } from "express";
import { ClientController } from "./client.controller";
import { asyncHandler } from "@/middleware/asyncHandler";


export class ClientRoutes {
    private router = Router();
    private clientsController: ClientController;


    constructor(clientsController: ClientController) {
        this.router = Router();
        this.clientsController = clientsController;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(
            '/',
            asyncHandler((req: Request, res: Response) => this.clientsController.createClient(req, res))
        );
        this.router.post(
            '/import-csv',
            asyncHandler((req: Request, res: Response) => this.clientsController.createMultipleClients(req, res))
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}