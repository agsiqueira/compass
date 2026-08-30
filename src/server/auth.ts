import "server-only";
import type{NextRequest}from"next/server";
import{prototypeRouteAllowed}from"@/lib/access";
import{AppError}from"./errors";
import{prisma}from"./db";
import{SESSION_COOKIE,tokenHash}from"./security";
import{sessionIsActive}from"@/lib/persistence-contracts";

export function requireDevStaff(request:NextRequest){if(!prototypeRouteAllowed(process.env.NODE_ENV,process.env.COMPASS_ENABLE_DEV_ACCESS)||request.headers.get("x-compass-dev-role")!=="staff")throw new AppError("UNAUTHORIZED","Staff access is required.",401);}
export async function requirePatient(request:NextRequest){const raw=request.cookies.get(SESSION_COOKIE)?.value;if(!raw)throw new AppError("UNAUTHORIZED","Please activate or sign in again.",401);const now=new Date();const session=await prisma.patientSession.findUnique({where:{tokenHash:tokenHash(raw)},include:{device:true,participant:{include:{enrollment:true}}}});const enrollment=session?.participant.enrollment;if(!session||!enrollment||!sessionIsActive({expiresAt:session.expiresAt,revokedAt:session.revokedAt,deviceRevokedAt:session.device.revokedAt,enrollmentStatus:enrollment.status,withdrawnAt:enrollment.withdrawnAt,enrollmentExpiresAt:enrollment.expiresAt},now))throw new AppError("UNAUTHORIZED","This patient session is no longer active.",401);return session;}
