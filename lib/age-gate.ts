/**
 * Age gate constants, shared by the server-rendered inline script (SiteChrome) and the
 * overlay (components/layout/AgeGate.tsx).
 */

/** Set to "1" for 365 days when the visitor confirms they are 18 or older. */
export const AGE_COOKIE = "kinetus_age";
export const AGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Attribute on <html> that shows the overlay (CSS) while the cookie is missing. */
export const AGE_GATE_ATTRIBUTE = "data-age-gate";

/** Wrapper around the header, main and footer; inert while the overlay shows. */
export const SITE_CONTENT_ID = "site-content";

/**
 * Runs inline at the top of the site shell, before anything paints: without the cookie it
 * marks <html> so CSS shows the overlay. The page's HTML is never withheld: crawlers and
 * visitors without JavaScript receive every page in full, and this only decides whether
 * the overlay covers it.
 *
 * No backslashes: a "\s" inside this template literal would lose its backslash. Cookies
 * are separated by "; " (RFC 6265), so " *" covers the space. lib/age-gate.test.ts runs it.
 */
export const AGE_GATE_SCRIPT = `try{if(!/(?:^|; *)${AGE_COOKIE}=1(?:;|$)/.test(document.cookie))document.documentElement.setAttribute("${AGE_GATE_ATTRIBUTE}","show")}catch(e){}`;
