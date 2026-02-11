import { BaseService } from "@/core/BaseService";
import { Client, PrismaClient } from "@/generated/prisma";
import { AddClientInput, AddMultipleClientsInput, ClientListQuery } from "./client.validation";
import { AppError, ConflictError, NotFoundError } from "@/core/errors/AppError";
import { AppLogger } from "@/core/ logging/logger";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";


export class ClientService extends BaseService<Client> {

    constructor(prisma: PrismaClient) {
        super(prisma, "Client", {
            enableAuditFields: true,
            enableSoftDelete: false,
        });
    }
    protected getModel() {
        return this.prisma.client;
    }

    /**
     * Create a new client (SINGLE)
     */
    async createClient(data: AddClientInput, userId: string): Promise<Client> {
        const { name, company, email, phone, address } = data;
        const subscriber = await this.prisma.subscriber.findUnique({
            where: { userId: userId },
        })

        if (!subscriber) {
            throw new NotFoundError("Subscriber not found")
        }

        const normalizedEmail = email?.toLowerCase().trim();
        const exists = await this.findOne({ email: normalizedEmail });
        if (exists) {
            throw new ConflictError("Client already exists");
        }

        AppLogger.info(`Creating new client: ${email}}`);

        const newClient = await this.create({
            name,
            company,
            email: normalizedEmail,
            phone,
            address,
            subscriberId: subscriber.id,

        });

        AppLogger.info(`Created new client: ${newClient.email} (ID: ${newClient.id})`);
        return newClient
    }

    /**
   * Create multiple clients (BATCH/CSV)
   */
    async createMultipleClients(data: AddMultipleClientsInput): Promise<Client[]> {
        //lowecase email and remove whitespace
        const normalizedData = data.map((client) => ({
            ...client,
            email: client.email?.toLowerCase().trim(),
            subscriberId: client.subscriberId as string
        }))
        const emails = normalizedData.map(c => c.email);

        try {
            return await this.prisma.$transaction(async (tx) => {
                //check if emails already exist
                const existingClients = await tx.client.findMany({
                    where: {
                        email: { in: emails },
                    },
                    select: { email: true }
                });

                if (existingClients.length > 0) {
                    const existingEmails = existingClients.map(e => e.email).join(", ");
                    throw new ConflictError(`Emails already exist: ${existingEmails}`);
                }
                AppLogger.info(`Starting batch creation for ${normalizedData.length} clients.`);
                const createdResult = await tx.client.createMany({
                    data: normalizedData,
                    skipDuplicates: false,
                })

                AppLogger.info(`Batch creation completed. ${createdResult.count} clients created.`);

                return tx.client.findMany({
                    where: { email: { in: emails } },
                    orderBy: { createdAt: 'desc' }
                });
            });
        } catch (error) {
            AppLogger.error(`Error creating clients: ${error}`);
            throw new AppError(
                HTTPStatusCode.BAD_REQUEST,
                error instanceof Error ? error.message : 'Unknown error',
                'Client creation error'
            );
        }
    }

    /**
   * Get all clients with optional filtering, search, and pagination
   */
    async getClients(query: ClientListQuery) {
        const { page = 1, limit = 10, search, sortBy = "createdAt", sortOrder = "desc", ...rest } = query;
        let filters: any = { ...this.buildWhereClause(rest) };
        if (search) {
            filters.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ];
        }
        const offset = (page - 1) * limit;
        const result = await this.findMany(
            filters,
            { page, limit, offset },
            { [sortBy]: sortOrder },
            {}, //subscriber: true
        );
        AppLogger.info(`Clients found : ${result.data.length}`);
        return result;
    }

    /**
     * Get a client by ID
     */
    async getClientById(id: string): Promise<Client | null> {
        const client = await this.findById(id);
        if (!client) throw new NotFoundError("Client");
        return client;
    }

    /**
     * Update a client by ID (Professional Version)
     */
    async updateClient(id: string, data: Partial<AddClientInput>): Promise<Client> {
        //check existence
        const client = await this.findOne({ id, deletedAt: null });
        if (!client) {
            throw new NotFoundError("Client not found or you don't have permission to update it");
        }

        // normalize email (if email is provided)
        if (data.email) {
            data.email = data.email.toLowerCase().trim();

            // check if email already exists
            const emailExists = await this.findOne({
                email: data.email,
                id: { not: id },
                deletedAt: null
            });
            if (emailExists) throw new ConflictError("Email is already in use by another client");
        }

        AppLogger.info(`Updating client: ${id}`);
        const updatedClient = await this.updateById(id, data);
        AppLogger.info(`Client updated successfully: ${updatedClient.email}`);
        return updatedClient;
    }

    /**
   * Soft delete a client by ID
   */
    async deleteClient(id: string): Promise<Client> {
        const client = await this.findById(id);
        if (!client) throw new NotFoundError("Client");
        const deletedClient = await this.deleteById(id);
        if (deletedClient) {
            await this.prisma.asset.deleteMany({
                where: {
                    clientId: id
                }
            });
        }
        AppLogger.info(`Client deleted: ${deletedClient.email} (ID: ${deletedClient.id})`);
        return deletedClient;
    }


}