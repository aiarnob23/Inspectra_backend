import { BaseService } from "@/core/BaseService";
import { Client, PrismaClient } from "@/generated/prisma";
import { AddClientInput, AddMultipleClientsInput } from "./client.validation";
import { AppError, ConflictError } from "@/core/errors/AppError";
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
    async createClient(data: AddClientInput): Promise<Client> {
        const { name, company, email, phone, address, subscriberId } = data;
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
            subscriberId
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

}