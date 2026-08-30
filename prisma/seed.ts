import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const connectionString=process.env.DATABASE_URL;
if(!connectionString) throw new Error("DATABASE_URL is required to seed synthetic data");
const prisma=new PrismaClient({adapter:new PrismaPg({connectionString})});
async function main(){await prisma.staffUser.upsert({where:{email:"nurse.synthetic@example.invalid"},update:{},create:{email:"nurse.synthetic@example.invalid",name:"Nurse Sample"}});}
main().finally(()=>prisma.$disconnect());
