import "server-only";
import{Prisma,AlertPriority,AlertStatus}from"@/generated/prisma/client";
import{prisma}from"./db";
import{AppError}from"./errors";
import{opaqueToken,securePinHash,tokenHash}from"./security";
import{evaluatePlaceholderRule,type Answers}from"@/lib/domain";
import{activationProblem,nursePriorityRank}from"@/lib/persistence-contracts";
import{retrySerializable}from"@/lib/transactions";

const STAFF_EMAIL="nurse.synthetic@example.invalid";
const RULE_VERSION="M02_SYNTHETIC_V1";
const addDays=(date:Date,days:number)=>new Date(date.getTime()+days*86_400_000);
async function serializable<T>(operation:(tx:Prisma.TransactionClient)=>Promise<T>){return retrySerializable(()=>prisma.$transaction(operation,{isolationLevel:Prisma.TransactionIsolationLevel.Serializable}))}

export async function enrollSynthetic(displayName:string,consentConfirmed:boolean){
 if(!consentConfirmed)throw new AppError("VALIDATION","Consent confirmation is required.",400);
 const rawCode=`COMPASS-${opaqueToken(18).toUpperCase()}`,codeHash=tokenHash(rawCode),now=new Date();
 const result=await serializable(async tx=>{
  const staff=await tx.staffUser.upsert({where:{email:STAFF_EMAIL},update:{},create:{email:STAFF_EMAIL,name:"Nurse Sample"}});
  const identity=await tx.patientIdentity.create({data:{displayName}});
  const participant=await tx.studyParticipant.create({data:{studyId:`SYN-${opaqueToken(6).toUpperCase()}`,identityId:identity.id}});
  const enrollment=await tx.enrollment.create({data:{participantId:participant.id,enrolledById:staff.id,consentConfirmed:true,expiresAt:addDays(now,84)}});
  await tx.activationCode.create({data:{enrollmentId:enrollment.id,codeHash,expiresAt:addDays(now,1)}});
  await tx.emaOccurrence.create({data:{participantId:participant.id,occurrenceKey:`initial-${now.toISOString()}`,closesAt:addDays(now,1)}});
  await tx.auditEvent.create({data:{participantId:participant.id,staffUserId:staff.id,actorType:"STAFF",action:"STAFF_ENROLLED_SYNTHETIC_PATIENT",targetType:"Enrollment",targetId:enrollment.id}});
  return{studyId:participant.studyId};
 });
 return{...result,activationCode:rawCode,expiresAt:addDays(now,1)};
}

export async function activatePatient(code:string,pin:string,deviceLabel:string){
 const hash=tokenHash(code),rawSession=opaqueToken(),now=new Date();
 const result=await serializable(async tx=>{
  const activation=await tx.activationCode.findUnique({where:{codeHash:hash},include:{enrollment:{include:{participant:true}}}});
  if(!activation)throw new AppError("NOT_FOUND","That activation code was not recognized.",404);
  const enrollment=activation.enrollment;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${enrollment.participantId}))`;
  const activeDevices=await tx.patientDevice.count({where:{participantId:enrollment.participantId,revokedAt:null,sessions:{some:{revokedAt:null,expiresAt:{gt:now}}}}});
  const problem=activationProblem({status:activation.status,expiresAt:activation.expiresAt,enrollmentStatus:enrollment.status,withdrawnAt:enrollment.withdrawnAt,enrollmentExpiresAt:enrollment.expiresAt},now,activeDevices);
  if(problem==="USED")throw new AppError("CONFLICT","That activation code has already been used.",409);if(problem==="EXPIRED")throw new AppError("EXPIRED","That activation code has expired. Ask study staff for help.",410);if(problem==="WITHDRAWN")throw new AppError("UNAUTHORIZED","This enrollment is not active.",401);if(problem==="DEVICE_LIMIT")throw new AppError("DEVICE_LIMIT","This patient already has two active devices. Ask study staff to revoke one.",409);
  const consumed=await tx.activationCode.updateMany({where:{id:activation.id,status:"UNUSED",expiresAt:{gt:now}},data:{status:"USED",usedAt:now}});
  if(consumed.count!==1)throw new AppError("CONFLICT","That activation code is no longer available.",409);
  const device=await tx.patientDevice.create({data:{participantId:enrollment.participantId,label:deviceLabel,pinHash:await securePinHash(pin)}});
  const expiresAt=enrollment.expiresAt<addDays(now,84)?enrollment.expiresAt:addDays(now,84);
  const session=await tx.patientSession.create({data:{participantId:enrollment.participantId,deviceId:device.id,tokenHash:tokenHash(rawSession),expiresAt}});
  await tx.auditEvent.createMany({data:[{participantId:enrollment.participantId,actorType:"PATIENT",action:"ACTIVATION_CODE_CONSUMED",targetType:"ActivationCode",targetId:activation.id},{participantId:enrollment.participantId,actorType:"PATIENT",action:"PATIENT_SESSION_ISSUED",targetType:"PatientSession",targetId:session.id}]});
  return{expiresAt,participantId:enrollment.participantId};
 });
 return{...result,sessionToken:rawSession};
}

export async function revokeSession(sessionId:string,participantId:string){await prisma.$transaction(async tx=>{const changed=await tx.patientSession.updateMany({where:{id:sessionId,participantId,revokedAt:null},data:{revokedAt:new Date()}});if(changed.count!==1)throw new AppError("CONFLICT","This session is already inactive.",409);await tx.auditEvent.create({data:{participantId,actorType:"PATIENT",action:"PATIENT_SESSION_REVOKED",targetType:"PatientSession",targetId:sessionId}});});}

export async function getEligibleOccurrence(participantId:string){const now=new Date();return prisma.emaOccurrence.findFirst({where:{participantId,submittedAt:null,availableAt:{lte:now},closesAt:{gt:now}},orderBy:{availableAt:"asc"}});}

function observations(answers:Answers){return Object.entries(answers).map(([metric,value])=>({metric,...(typeof value==="number"?{numericValue:value}:{textValue:value})}));}
function visibleSignals(signals:string[]){return signals.map(signal=>signal==="SYNTHETIC_TEST_PAIN_10"?"Synthetic test response: pain value 10":signal==="SYNTHETIC_TEST_NO_HYDRATION"?"Synthetic test response: no hydration":"Synthetic test signal");}

export async function submitEma(participantId:string,occurrenceId:string,answers:Answers){
 return serializable(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${participantId}))`;
  const now=new Date(),occurrence=await tx.emaOccurrence.findFirst({where:{id:occurrenceId,participantId}});
  if(!occurrence)throw new AppError("NOT_FOUND","This check-in was not found.",404);
  if(occurrence.submittedAt)throw new AppError("CONFLICT","This check-in has already been submitted.",409);
  if(occurrence.closesAt<=now)throw new AppError("EXPIRED","This check-in is no longer available.",410);
  const response=await tx.emaResponse.create({data:{participantId,occurrenceId:occurrence.id,occurrenceKey:occurrence.occurrenceKey,answers:answers as Prisma.InputJsonValue,observations:{create:observations(answers)}}});
  const occurrenceUpdate=await tx.emaOccurrence.updateMany({where:{id:occurrence.id,submittedAt:null},data:{submittedAt:now}});if(occurrenceUpdate.count!==1)throw new AppError("CONFLICT","This check-in has already been submitted.",409);
  const evaluated=evaluatePlaceholderRule(answers);let alertId:string|undefined;
  if(evaluated.signals.length){
   const priority=evaluated.priority==="Urgent"?AlertPriority.URGENT:AlertPriority.ATTENTION_NEEDED;
   let active=await tx.alert.findFirst({where:{participantId,status:{not:AlertStatus.CLOSED}},orderBy:{createdAt:"desc"}});
   const summary=`Nonclinical placeholder: ${visibleSignals(evaluated.signals).join("; ")}`;
   active=active?await tx.alert.update({where:{id:active.id},data:{priority:active.priority===AlertPriority.URGENT?AlertPriority.URGENT:priority,summary,ruleVersion:RULE_VERSION}}):await tx.alert.create({data:{participantId,priority,summary,ruleVersion:RULE_VERSION}});
   alertId=active.id;
   await tx.alertEvidence.createMany({data:evaluated.signals.map(signal=>({alertId:active!.id,emaResponseId:response.id,signal})),skipDuplicates:true});
  }
  await tx.auditEvent.create({data:{participantId,actorType:"PATIENT",action:"PATIENT_SUBMITTED_IMMUTABLE_EMA",targetType:"EmaResponse",targetId:response.id,metadata:{ruleVersion:RULE_VERSION,alertCreatedOrUpdated:Boolean(alertId)}}});
  return{responseId:response.id,alertId};
 });
}

export async function listNursePatients(){
 const rows=await prisma.studyParticipant.findMany({where:{enrollment:{is:{status:"ACTIVE"}}},include:{identity:true,enrollment:true,alerts:{where:{status:{not:"CLOSED"}},orderBy:{updatedAt:"desc"},take:1},auditEvents:{orderBy:{createdAt:"desc"},take:20}},orderBy:{createdAt:"desc"}});
 return rows.map(row=>({participantId:row.id,studyId:row.studyId,displayName:row.identity.displayName,status:row.alerts[0]?.status??"STABLE",alert:row.alerts[0]?{id:row.alerts[0].id,priority:row.alerts[0].priority,status:row.alerts[0].status,summary:row.alerts[0].summary}:null,audit:row.auditEvents})).sort((a,b)=>nursePriorityRank(a.alert?.priority??null)-nursePriorityRank(b.alert?.priority??null));
}

export async function claimAlertService(alertId:string){return transitionAlert(alertId,"claim");}
export async function closeAlertService(alertId:string,outcome:string){return transitionAlert(alertId,"close",outcome);}
async function transitionAlert(alertId:string,action:"claim"|"close",outcome?:string){return prisma.$transaction(async tx=>{const staff=await tx.staffUser.findUnique({where:{email:STAFF_EMAIL}});if(!staff)throw new AppError("UNAUTHORIZED","Synthetic staff account is unavailable.",401);const now=new Date();const changed=action==="claim"?await tx.alert.updateMany({where:{id:alertId,status:"NEW"},data:{status:"IN_PROGRESS",claimedById:staff.id,claimedAt:now}}):await tx.alert.updateMany({where:{id:alertId,status:"IN_PROGRESS",claimedById:staff.id},data:{status:"CLOSED",closedAt:now,closureOutcome:outcome}});if(changed.count!==1)throw new AppError("CONFLICT",action==="claim"?"Only a new alert can be claimed.":"Only the nurse who claimed an in-progress alert can close it.",409);const alert=await tx.alert.findUniqueOrThrow({where:{id:alertId}});await tx.auditEvent.create({data:{participantId:alert.participantId,staffUserId:staff.id,actorType:"STAFF",action:action==="claim"?"STAFF_CLAIMED_ALERT":"STAFF_CLOSED_ALERT",targetType:"Alert",targetId:alert.id,metadata:outcome?{outcome}:undefined}});return alert;});}

export async function createDevOccurrence(participantId:string){if(process.env.NODE_ENV!=="development"||process.env.COMPASS_ENABLE_DEV_ACCESS!=="true")throw new AppError("NOT_FOUND","Not found.",404);const now=new Date();return prisma.emaOccurrence.create({data:{participantId,occurrenceKey:`dev-${now.toISOString()}-${opaqueToken(4)}`,closesAt:addDays(now,1),devSynthetic:true}});}

export async function issueDevActivationCode(participantId:string){if(process.env.NODE_ENV!=="development"||process.env.COMPASS_ENABLE_DEV_ACCESS!=="true")throw new AppError("NOT_FOUND","Not found.",404);const rawCode=`COMPASS-${opaqueToken(18).toUpperCase()}`,now=new Date();const result=await prisma.$transaction(async tx=>{const enrollment=await tx.enrollment.findUnique({where:{participantId}});if(!enrollment||enrollment.status!=="ACTIVE"||enrollment.expiresAt<=now)throw new AppError("NOT_FOUND","Active enrollment not found.",404);const code=await tx.activationCode.create({data:{enrollmentId:enrollment.id,codeHash:tokenHash(rawCode),expiresAt:addDays(now,1)}});await tx.auditEvent.create({data:{participantId,actorType:"STAFF",action:"STAFF_ISSUED_SYNTHETIC_DEVICE_CODE",targetType:"ActivationCode",targetId:code.id}});return{expiresAt:code.expiresAt};});return{...result,activationCode:rawCode};}
