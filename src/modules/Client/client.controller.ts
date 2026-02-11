import { BaseController } from "@/core/BaseController";
import { ClientService } from "./client.service";
import { Request, Response } from "express";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";
import { Parser } from "json2csv";


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
    const userId = req.userId as string;
    this.logAction('create', req, rawBody)
    const result = await this.clientService.createClient(rawBody, userId);
    return this.sendCreatedResponse(
      res,
      'Client created succeddfully',
      result,
    );
  }

  /**
   * Create multiple clients (BATCH) 
   * POST /api/clients/batch
   */
  public createMultipleClients = async (req: Request, res: Response) => {
    const rawBody = req.validatedBody || req.body;
    const userId = req.userId as string;
    this.logAction('create', req, { count: rawBody.length })
    const result = await this.clientService.createMultipleClients(rawBody, userId);
    return this.sendCreatedResponse(
      res,
      'Clients created succeddfully',
      result,

    );
  }

  /**
 * Get all clients with filtering, sorting, and pagination
 * GET /api/clients
 */
  public getAllClients = async (req: Request, res: Response) => {
    const query = req.validatedQuery || req.query;
    const result = await this.clientService.getClients(query);

    this.logAction("getAllClients", req, { count: result.data.length });

    return this.sendPaginatedResponse(
      res,
      {
        page: result.page,
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
   * Get all clients : CSV export
   * GET /api/clients/export
   */
  public getExportCLients = async (req: Request, res: Response) => {
    const userId = req.userId as string;
    const clients = await this.clientService.getClientsForExport(userId);

    if (!clients.length) {
      return res.status(200).send("No clients found");
    }

    const fields = [
      { label: "Name", value: "name" },
      { label: "Company", value: "company" },
      { label: "Email", value: "email" },
      { label: "Phone", value: "phone" },
      { label: "Address", value: "address" },
      { label: "Status", value: "status" },
      {
        label: "Created At",
        value: (row: any) =>
          row.createdAt ? new Date(row.createdAt).toISOString() : "",
      },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(clients); 

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=clients.csv"
    );

    return res.status(200).send(csv);
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