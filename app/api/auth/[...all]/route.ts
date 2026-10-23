import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handlers = toNextJsHandler(auth.handler);

export const GET = async (req: NextRequest) => {
  try {
    return await handlers.GET(req);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error in Auth GET";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const hasClientId = !!(
      process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_ID
    );
    const hasClientSecret = !!(
      process.env.GOOGLE_CLIENT_SECRET ||
      process.env.GOOGLE_SECRET
    );

    if (req.nextUrl.pathname.includes("/sign-in/social") && (!hasClientId || !hasClientSecret)) {
      return NextResponse.json(
        {
          message:
            "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in Vercel Environment Variables! Please add them in Vercel Settings > Environment Variables and redeploy.",
        },
        { status: 400 }
      );
    }

    return await handlers.POST(req);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error in Auth POST";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
