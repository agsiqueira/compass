import type{NextRequest}from"next/server";import{NextResponse}from"next/server";import{requireDevStaff}from"@/server/auth";import{listNursePatients}from"@/server/services";import{errorResponse}from"@/server/http";
export async function GET(request:NextRequest){try{requireDevStaff(request);return NextResponse.json({ok:true,data:await listNursePatients()})}catch(error){return errorResponse(error)}}
