import { betterAuth } from "better-auth";

const defaultSecret = "dinedesk_better_auth_secret_key_production_2026_xyz";
if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET = defaultSecret;
}

const getBaseURL = () => {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "production" ? "https://dine-desk-one.vercel.app" : "http://localhost:3000");
  return url.trim().replace(/\/+$/, "");
};

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
});
