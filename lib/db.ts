import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL no está definida");
}

const PRISMA_GENERATION = "payments-v1";

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
	prismaGeneration?: string;
};

function createPrisma() {
	return new PrismaClient({
		adapter: new PrismaPg({ connectionString }),
	});
}

function isStalePrisma(client: PrismaClient | undefined) {
	if (!client) return false;
	if (globalForPrisma.prismaGeneration !== PRISMA_GENERATION) return true;
	return typeof (client as { payment?: { findMany?: unknown } }).payment
		?.findMany !== "function";
}

if (isStalePrisma(globalForPrisma.prisma)) {
	void globalForPrisma.prisma?.$disconnect();
	globalForPrisma.prisma = undefined;
}

export const prisma =
	globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
	globalForPrisma.prismaGeneration = PRISMA_GENERATION;
}
