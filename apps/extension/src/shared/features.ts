/**
 * Edition gates.
 *
 * The edition is chosen at build time: `capann.config.json` sets the default
 * for the checked-out branch, and `npm run build:free` / `build:premium`
 * override it (see `scripts/build.mjs`). On `dev` this lets one codebase build
 * either edition; `free` and `premium` differ only in that config value.
 *
 * Annotation, screenshots, and instant tab recording are free in every
 * edition. Premium (a paid account, in the premium build) adds: marks that
 * scroll with the page, screenshot styling, shareable 7-day links with
 * playback, and later the browser-AI layer. Gate the build on
 * `PREMIUM_ENABLED` and a feature on `premiumActive(account)`, so the UI and
 * the service worker cannot drift apart.
 */
import type { Edition } from "@capann/contract";
export type { Edition };

export const EDITION: Edition = __CAPANN_EDITION__;
export const PREMIUM_ENABLED = EDITION === "premium";

/**
 * Whether Premium features are on for this account: the premium build, signed
 * in, and paid (the cached claim; the API re-checks it on upload). Always
 * false in the free build.
 */
export function premiumActive(
  account: { signedIn: boolean; paid: boolean } | null | undefined,
): boolean {
  return PREMIUM_ENABLED && account?.signedIn === true && account.paid === true;
}

/** Premium backend origin (no trailing slash). Set in capann.config.json. */
export const API_URL: string = __CAPANN_API_URL__;
/** Website origin: sign-in landing pages, link recovery, and pricing. */
export const SITE_URL: string = __CAPANN_SITE_URL__;
/** Where the free build's one Premium teaser points. Opening it is a plain link. */
export const PRICING_URL = `${SITE_URL}/#pricing`;
/** Shown on the Upgrade button. Keep in step with the Bachs product price. */
export const PREMIUM_PRICE_LABEL = "$7/month";
