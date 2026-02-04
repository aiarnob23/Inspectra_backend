import { BaseController } from "@/core/BaseController";
import { ClientService } from "./client.service";
import { Request, Response } from "express";


export class ClientController extends BaseController {
    constructor(private clientService: ClientService) {
        super()
    }

    /**
   * Create a new client (SINGLE) - Logic remains the same
   * POST /api/clients
   */
    public createClient = async (req: Request, res: Response) => {
        const rawBody = req.validatedBody || req.body;
        const userId = req.userId || "40e80625-6432-44b1-8f5b-1ebe1280c926";
        const client = { ...rawBody, subscriberId: userId }
        this.logAction('create', req, client)
        const result = await this.clientService.createClient(client);
        return this.sendCreatedResponse(res, result, 'Client created succeddfully');
    }

    /**
     * Create multiple clients (BATCH) (NEW METHOD)
     * POST /api/clients/batch
     */
    public createMultipleClients = async (req: Request, res: Response) => {
        const rawBody = req.validatedBody || req.body;
        const userId = req.userId;
        const clientsData = rawBody.map((client: any) => ({ ...client, subscriberId: userId }))
        this.logAction('create', req, { count: clientsData.length })
        const result = await this.clientService.createMultipleClients(clientsData);
        return this.sendCreatedResponse(res, result, 'Clients created succeddfully');
    }
}