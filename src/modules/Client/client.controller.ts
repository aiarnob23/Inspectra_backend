import { BaseController } from "@/core/BaseController";
import { ClientService } from "./client.service";
import { Request, Response } from "express";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";


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

    /**
   * Get all clients with filtering, sorting, and pagination
   * GET /api/clients
   */
  public getAllClients  = async (req: Request, res: Response) => {
    const query = req.validatedQuery || req.query;
    const result = await this.clientService.getClients(query);

    this.logAction("getAllClients", req, { count: result.data.length });

    return this.sendPaginatedResponse(
        res,
        {
            page:result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
            hasNext: result.hasNext,
            hasPrevious: result.hasPrevious,
        },
        "clients retrieved successfully",
        result.data
    );
  };

  /**
   * Get a client by ID
   * GET /api/clients/:id
   */
  public getClientById = async (req: Request, res: Response) => {
    const params = req.validatedParams || req.params;
    const { id } = params;

    this.logAction("getClientById", req, { clientId: id });
    const result = await this.clientService.getClientById(id);

    return this.sendResponse(
      res,
      "Client retrieved successfully",
      HTTPStatusCode.OK,
      result
    );
  };

   /**
   * Update a client by ID
   * PATCH /api/clients/:id
   */

  public updateClient = async (req: Request, res: Response) => {
    const params = req.validatedParams || req.params;
    const { id } = params;
    const body = req.validatedBody || req.body;

    const result = await this.clientService.updateClient(id, body);

    this.logAction("updateClient", req, { clientId: id, body: body });
    return this.sendResponse(
      res,
      "Client updated successfully",
      HTTPStatusCode.OK,
      result
    );
  };


    /**
   * Delete a client by ID
   * DELETE /api/clients/:id
   */
    public deleteClient = async (req: Request, res: Response) => {
        const params = req.validatedParams || req.params;
        const { id } = params;

        const result = await this.clientService.deleteClient(id);

        this.logAction("deleteClient", req, { clientId: id });
        
        return this.sendResponse(
            res,
            "Client deleted successfully",
            HTTPStatusCode.OK,
            result
        );
    }


}