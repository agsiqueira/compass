import{prisma}from"@/server/db";
export async function GET(){try{await prisma.$queryRaw`SELECT 1`;return Response.json({status:"ok",database:"connected",service:"compass",prototype:"synthetic-nonclinical"})}catch{return Response.json({status:"degraded",database:"unavailable",service:"compass",prototype:"synthetic-nonclinical"},{status:503})}}
