import { betterAuth } from "better-auth";

const defaultSecret = "dinedesk_better_auth_secret_key_production_2026_xyz";
if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET = defaultSecret;
}

const getBaseURL = () => {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://dine-desk-one.vercel.app"
      : "http://localhost:3000");
  return url.trim().replace(/\/+$/, "");
};

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://dine-desk-backend.vercel.app"
    : "http://localhost:5000")
).replace(/\/+$/, "");

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.GOOGLE_ID ||
  "";

const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ||
  process.env.GOOGLE_SECRET ||
  "";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || defaultSecret,
  baseURL: getBaseURL(),
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
    },
  },
  account: {
    storeAccountCookie: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user: any) => {
          // Triggers exclusively for new registrations (manual or Google OAuth)
          try {
            await fetch(`${BACKEND_URL}/api/v1/auth/send-welcome-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                toEmail: user.email,
                userName: user.name || "Diner",
              }),
            });
          } catch (error) {
            console.error("Failed to send welcome email via Better Auth hook:", error);
          }
        },
      },
    },
    session: {
      create: {
        after: async (session: any) => {
          // Triggers on successful login sessions
          try {
            const userEmail = session.user?.email;
            if (!userEmail) return;

            await fetch(`${BACKEND_URL}/api/v1/auth/send-signin-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                toEmail: userEmail,
                userName: session.user?.name || "Diner",
                device: "Google Account (Web)",
                loginDate: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                loginTime: new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }),
            });
          } catch (error) {
            console.error("Failed to send sign-in email via Better Auth hook:", error);
          }
        },
      },
    },
  },
});