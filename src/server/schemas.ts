import{z}from"zod";import{pinSchema}from"@/lib/domain";
export const enrollInput=z.object({displayName:z.string().trim().min(2).max(80),consentConfirmed:z.literal(true)});
export const activateInput=z.object({code:z.string().trim().regex(/^COMPASS-[A-Z0-9_-]{16,}$/,"Enter a valid activation code"),pin:pinSchema,deviceLabel:z.string().trim().min(1).max(80).default("Web browser")});
export const answersInput=z.object({pain:z.number().int().min(0).max(10),nausea:z.number().int().min(0).max(10),fatigue:z.number().int().min(0).max(10),eating:z.enum(["normal","less","none"]),hydration:z.enum(["normal","less","none"]),sleep:z.enum(["normal","less","more"]),functioning:z.enum(["usual","reduced","unable"])});
export const submitInput=z.object({occurrenceId:z.string().cuid(),answers:answersInput});
export const closeInput=z.object({outcome:z.string().trim().min(1).max(120)});
