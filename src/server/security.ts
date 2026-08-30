import "server-only";
import {randomBytes}from"node:crypto";
import bcrypt from"bcryptjs";
import{pinSchema}from"@/lib/domain";

export const SESSION_COOKIE="compass_patient_session";
export const SESSION_DAYS=84;
export function opaqueToken(bytes=32){return randomBytes(bytes).toString("base64url");}
export{tokenHash}from"@/lib/token";
export async function securePinHash(pin:string){return bcrypt.hash(pinSchema.parse(pin),12);}
export async function securePinVerify(pin:string,hash:string){return pinSchema.safeParse(pin).success&&bcrypt.compare(pin,hash);}
export function sessionCookie(token:string,expires:Date){return{name:SESSION_COOKIE,value:token,httpOnly:true,sameSite:"lax"as const,secure:process.env.NODE_ENV!=="development",path:"/",expires};}
export function expiredSessionCookie(){return{name:SESSION_COOKIE,value:"",httpOnly:true,sameSite:"lax"as const,secure:process.env.NODE_ENV!=="development",path:"/",expires:new Date(0)};}
