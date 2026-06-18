import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth.js v5 configuration.
 *
 * Uses JWT sessions (no database) and a single Google provider. The provider
 * automatically reads the AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET env vars, and
 * AUTH_SECRET signs the session JWT.
 *
 * The `authorized` callback doubles as the gate for `middleware.ts`: it allows
 * the /login page, bounces signed-in users away from it, and protects every
 * other route by redirecting anonymous visitors to /login.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname === "/login";

      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true; // allow anonymous access to the login page
      }

      // Every other matched route requires a session. Returning false makes
      // Auth.js redirect to the configured signIn page (/login).
      return isLoggedIn;
    },
  },
});
