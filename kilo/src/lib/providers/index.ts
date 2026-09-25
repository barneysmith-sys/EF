/**
 * Provider adapters. UI reads Evidence, not raw API payloads.
 * Secret credentials stay in server/marketApi.ts. This module does not fetch them.
 */

export const pjm = {
  id: "pjm",
  /** Confirm redistribution rights before this can be true. */
  redistributionAllowed: false,
} as const;

export const ercot = {
  id: "ercot",
  state: "UNAVAILABLE" as const,
  reason: "ERCOT credentials stay on a server and are not configured.",
} as const;

export const nlr = {
  id: "nlr-pvwatts-v8",
  state: "UNAVAILABLE" as const,
  reason:
    "PVWatts needs NLR_API_KEY on the server. A modeled solar yield would not mean this load can be served.",
} as const;

export const eiaRoutes = {
  demand: "electricity/rto/region-data",
  retailPrice: "electricity/retail-sales",
} as const;

export const mapbox = {
  id: "mapbox",
  /** The working map is the existing Albers map. A public pk token is not a reason to replace it. */
  usedForBasemap: false,
} as const;
