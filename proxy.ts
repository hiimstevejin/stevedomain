export { auth as proxy } from "@/auth";

export const config = {
  // Run on everything except Next internals, the auth API, and the favicon.
  // The `authorized` callback in auth.ts decides what's public vs protected.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
