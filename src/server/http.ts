import{NextResponse}from"next/server";import{ZodError}from"zod";import{AppError,publicError}from"./errors";
export function errorResponse(error:unknown){const normalized=error instanceof ZodError?new AppError("VALIDATION",error.issues[0]?.message??"Invalid request",400):error;const result=publicError(normalized);return NextResponse.json(result.body,{status:result.status});}
