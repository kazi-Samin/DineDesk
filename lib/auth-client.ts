import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    (typeof window !== "undefined" && window.location.origin)
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || "https://dine-desk-one.vercel.app"),
});

export const { signIn, signUp, useSession, signOut } = authClient;
