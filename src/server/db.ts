import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma=globalThis as unknown as {compassPrisma?:PrismaClient};
function createClient(){const connectionString=process.env.DATABASE_URL;if(!connectionString)throw new Error("Database configuration is unavailable");return new PrismaClient({adapter:new PrismaPg({connectionString})});}
export const prisma=globalForPrisma.compassPrisma??createClient();
if(process.env.NODE_ENV!=="production")globalForPrisma.compassPrisma=prisma;
