import{NextResponse}from"next/server";import{prototypeRouteAllowed}from"@/lib/access";
export function proxy(){if(!prototypeRouteAllowed(process.env.NODE_ENV,process.env.COMPASS_ENABLE_DEV_ACCESS)){return new NextResponse("Prototype access disabled",{status:404})}return NextResponse.next()}
export const config={matcher:["/staff/:path*","/patient/:path*","/api/staff/:path*","/api/patient/:path*","/api/dev/:path*"]};
