import bcrypt from "bcryptjs";
import { z } from "zod";

export const pinSchema = z.string().regex(/^\d{6}$/, "PIN must contain exactly six digits");
export async function hashPin(pin:string){ return bcrypt.hash(pinSchema.parse(pin), 10); }
export async function verifyPin(pin:string, hash:string){ if(!pinSchema.safeParse(pin).success) return false; return bcrypt.compare(pin,hash); }
export type Answers={pain:number;nausea:number;fatigue:number;eating:string;hydration:string;sleep:string;functioning:string};
export type PrototypeAlert={id:string;priority:"Attention needed"|"Urgent";status:"New"|"In progress"|"Closed";signals:string[];outcome?:string};
export function evaluatePlaceholderRule(a:Answers){
  const signals:string[]=[];
  if(a.pain===10) signals.push("SYNTHETIC_TEST_PAIN_10");
  if(a.hydration==="none") signals.push("SYNTHETIC_TEST_NO_HYDRATION");
  return {signals,priority:signals.length>1?"Urgent" as const:"Attention needed" as const};
}
export function upsertActiveAlert(existing:PrototypeAlert|undefined, answers:Answers):PrototypeAlert|undefined{
  const result=evaluatePlaceholderRule(answers); if(!result.signals.length) return existing;
  if(existing&&existing.status!=="Closed") return {...existing,priority:result.priority,signals:[...new Set([...existing.signals,...result.signals])]};
  return {id:crypto.randomUUID(),priority:result.priority,status:"New",signals:result.signals};
}
export function claimAlert(alert:PrototypeAlert){if(alert.status!=="New")throw new Error("Only new alerts can be claimed");return {...alert,status:"In progress" as const};}
export function closeAlert(alert:PrototypeAlert,outcome:string){if(alert.status!=="In progress")throw new Error("Claim the alert before closing it");if(!outcome)throw new Error("Select an outcome");return {...alert,status:"Closed" as const,outcome};}
export function consumeActivation(status:"UNUSED"|"USED"|"EXPIRED",expiresAt:Date,now=new Date()){if(status!=="UNUSED"||expiresAt<=now)throw new Error("Activation code is invalid or already used");return "USED" as const;}
export function submitImmutable(existing:Answers|undefined,next:Answers){if(existing)throw new Error("Submitted check-ins cannot be overwritten");return Object.freeze({...next});}
