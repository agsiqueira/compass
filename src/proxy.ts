import{NextResponse}from"next/server";import type{NextRequest}from"next/server";import{prototypeRouteAllowed}from"@/lib/access";
export function proxy(req:NextRequest){if((req.nextUrl.pathname.startsWith("/staff")||req.nextUrl.pathname.startsWith("/patient"))&&!prototypeRouteAllowed(process.env.NODE_ENV,process.env.COMPASS_ENABLE_DEV_ACCESS)){return new NextResponse("Prototype access disabled",{status:404})}return NextResponse.next()}
export const config={matcher:["/staff/:path*","/patient/:path*"]};
