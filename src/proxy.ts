import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /admin (Admin panel - no i18n)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /favicon.ico, /sitemap.xml, etc. (static files)
    "/((?!api|admin|_next|_vercel|.*\\..*).*)",
  ],
};
