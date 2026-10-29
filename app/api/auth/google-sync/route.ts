import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_fAd0s9jcCOzJ@ep-young-bird-b5rc4sq6-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_change_this";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "https://dine-desk-backend.vercel.app"
).replace(/\/+$/, "");

function createJwt(payload: { id: string; email: string; role: string }): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const base64UrlEncode = (str: string) =>
    Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, name, googleId, avatarUrl } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const displayName = (name && String(name).trim()) || normalizedEmail.split("@")[0] || "Diner";
    const userAvatar = typeof avatarUrl === "string" && avatarUrl.trim() ? avatarUrl.trim() : null;

    // Extract device telemetry from request headers
    const userAgent = req.headers.get("user-agent") || "Web Browser";
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const sql = neon(DATABASE_URL);

    // 1. Look up user by email or googleId
    const rows = await sql`
      SELECT id, name, email, role, phone, "avatarUrl", "loyaltyPoints"
      FROM "User"
      WHERE email = ${normalizedEmail} OR ("googleId" IS NOT NULL AND "googleId" = ${googleId || ""})
      LIMIT 1
    `;

    let user: any = null;
    let isNewUser = false;

    if (rows && rows.length > 0) {
      user = rows[0];
      if (googleId && !user.googleId) {
        await sql`UPDATE "User" SET "googleId" = ${googleId} WHERE id = ${user.id}`.catch(() => { });
      }
      if (userAvatar && !user.avatarUrl) {
        await sql`UPDATE "User" SET "avatarUrl" = ${userAvatar} WHERE id = ${user.id}`.catch(() => { });
      }
    } else {
      // 2. Create new user with cuid
      const cuid = `c${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
      const inserted = await sql`
        INSERT INTO "User" (id, name, email, "googleId", "avatarUrl", role, "createdAt", "updatedAt")
        VALUES (${cuid}, ${displayName}, ${normalizedEmail}, ${googleId || null}, ${userAvatar}, 'USER', NOW(), NOW())
        RETURNING id, name, email, role, phone, "avatarUrl", "loyaltyPoints"
      `;
      user = inserted[0];
      isNewUser = true;
    }

    // 3. Trigger Email Dispatch
    if (isNewUser) {
      // First-time registration -> Welcome / Founding Patron Member Pass
      fetch(`${BACKEND_URL}/api/v1/auth/send-welcome-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: user.email,
          userName: user.name || displayName,
        }),
      }).catch((emailErr) => {
        console.error("Welcome email delivery failed:", emailErr);
      });
    } else {
      // Returning user -> Session Sign-in Notification
      fetch(`${BACKEND_URL}/api/v1/auth/send-signin-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: user.email,
          userName: user.name || displayName,
          firstName: (user.name || displayName).split(" ")[0],
          loginDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          loginTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          device: "Google Account (Web)",
          ipAddress,
          userAgent,
        }),
      }).catch((emailErr) => {
        console.error("Sign-in email delivery failed:", emailErr);
      });
    }

    // 4. Sign backend JWT token
    const token = createJwt({
      id: user.id,
      email: user.email,
      role: user.role || "USER",
    });

    const response = NextResponse.json({
      success: true,
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "USER",
        phone: user.phone || null,
        avatarUrl: user.avatarUrl || userAvatar || null,
        loyaltyPoints: user.loyaltyPoints || 0,
      },
    });

    // Set token cookies for browser requests and server-side fetch
    response.cookies.set("token", token, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
      httpOnly: false,
    });

    response.cookies.set("dinedesk_auth_token", token, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    console.error("Google Sync API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to sync Google user" },
      { status: 500 }
    );
  }
}