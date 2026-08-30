import{describe,expect,it}from"vitest";
import{activationProblem,nursePriorityRank,sessionIsActive}from"./persistence-contracts";
import{tokenHash}from"./token";
import{AppError,publicError}from"../server/errors";
import{retrySerializable}from"./transactions";

const now=new Date("2026-08-30T12:00:00Z"),later=new Date("2026-09-01T12:00:00Z"),earlier=new Date("2026-08-29T12:00:00Z");
const activation={status:"UNUSED"as const,expiresAt:later,enrollmentStatus:"ACTIVE"as const,withdrawnAt:null,enrollmentExpiresAt:later};
const session={expiresAt:later,revokedAt:null,deviceRevokedAt:null,enrollmentStatus:"ACTIVE"as const,withdrawnAt:null,enrollmentExpiresAt:later};

describe("Milestone 02 persistence contracts",()=>{
 it("stores a one-way activation/session token digest",()=>{const raw="COMPASS-VERY-SECRET-SYNTHETIC-CODE";expect(tokenHash(raw)).not.toBe(raw);expect(tokenHash(raw)).toHaveLength(64);expect(tokenHash(raw)).toBe(tokenHash(raw))});
 it("rejects expired and reused activation codes",()=>{expect(activationProblem({...activation,expiresAt:earlier},now,0)).toBe("EXPIRED");expect(activationProblem({...activation,status:"USED"},now,0)).toBe("USED")});
 it("rejects withdrawn and expired enrollments",()=>{expect(activationProblem({...activation,enrollmentStatus:"WITHDRAWN"},now,0)).toBe("WITHDRAWN");expect(activationProblem({...activation,enrollmentExpiresAt:earlier},now,0)).toBe("WITHDRAWN")});
 it("enforces two active devices at the transaction decision point",()=>{expect(activationProblem(activation,now,1)).toBeNull();expect(activationProblem(activation,now,2)).toBe("DEVICE_LIMIT")});
 it("retries a serialization conflict before re-evaluating device state",async()=>{let attempts=0;const result=await retrySerializable(async()=>{attempts++;if(attempts===1)throw{code:"P2034"};return"committed"});expect(result).toBe("committed");expect(attempts).toBe(2)});
 it("accepts a current patient session",()=>expect(sessionIsActive(session,now)).toBe(true));
 it("rejects expired or revoked sessions and devices",()=>{expect(sessionIsActive({...session,expiresAt:earlier},now)).toBe(false);expect(sessionIsActive({...session,revokedAt:now},now)).toBe(false);expect(sessionIsActive({...session,deviceRevokedAt:now},now)).toBe(false)});
 it("rejects sessions after withdrawal",()=>expect(sessionIsActive({...session,enrollmentStatus:"WITHDRAWN",withdrawnAt:now},now)).toBe(false));
 it("orders urgent, attention-needed, then stable",()=>{const priorities:("URGENT"|"ATTENTION_NEEDED"|null)[]=[null,"URGENT","ATTENTION_NEEDED"];expect(priorities.sort((a,b)=>nursePriorityRank(a)-nursePriorityRank(b))).toEqual(["URGENT","ATTENTION_NEEDED",null])});
 it("does not convert database failure into false success",()=>expect(publicError(new Error("database unavailable"))).toEqual({status:503,body:{ok:false,error:"DATABASE",message:"COMPASS could not save that change. Please try again."}}));
 it("preserves explicit conflict responses",()=>expect(publicError(new AppError("CONFLICT","already submitted",409))).toEqual({status:409,body:{ok:false,error:"CONFLICT",message:"already submitted"}}));
});
