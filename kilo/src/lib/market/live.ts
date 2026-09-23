/**
 * Live wholesale prints.
 *
 * MISO's public API needs no key and allows browser requests, so it is on
 * by default. EIA and PJM are the two free keys that cover the markets the
 * pathways actually sit in. Both allow browser CORS; both keys are public
 * once compiled into the bundle.
 *
 * Pathway $/MWh figures stay modeled. These prints are the wholesale energy
 * price and the system load, which is a different number.
 */

export interface FuelSlice {
  name: string;
  mw: number;
}

export interface HubPrint {
  name: string;
  region: string;
  lmp: number;
}

export interface MisoPrint {
  asOf: string;
  demandMw: number;
  peakForecastMw: number;
  marginalEnergy: number;
  /** MISO sign: negative means the footprint is importing. */
  netExportMw: number;
  fuel: FuelSlice[];
  hubs: HubPrint[];
}

export interface EiaDemand {
  respondent: string;
  name: string;
  period: string;
  demandMw: number;
}

export interface PjmPrint {
  asOf: string;
  node: string;
  lmp: number;
  energy: number;
}

export type FeedStatus = "off" | "ok" | "error";

export interface LiveBoard {
  fetchedAt: string;
  miso: MisoPrint | null;
  misoError: string | null;
  eia: EiaDemand[] | null;
  eiaStatus: FeedStatus;
  eiaError: string | null;
  pjm: PjmPrint | null;
  pjmStatus: FeedStatus;
  pjmError: string | null;
}

const EIA_RESPONDENTS = ["PJM", "ERCO", "MISO", "NYIS", "ISNE"] as const;

const EIA_NAMES: Record<string, string> = {
  PJM: "PJM",
  ERCO: "ERCOT",
  MISO: "MISO",
  NYIS: "NYISO",
  ISNE: "ISO-NE",
};

function num(value: unknown): number {
  const n = Number(String(value ?? "").replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function envKey(name: "VITE_EIA_API_KEY" | "VITE_PJM_SUBSCRIPTION_KEY"): string {
  const value = import.meta.env[name];
  return typeof value === "string" ? value.trim() : "";
}

async function getJson(url: string, headers?: HeadersInit): Promise<unknown> {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text.slice(0, 140)}`);
  }
  return res.json();
}

function snapshotValue(rows: { t?: string; v?: string; d?: string }[], label: string) {
  return rows.find((r) => (r.t ?? "").startsWith(label));
}

async function fetchMiso(): Promise<MisoPrint> {
  const [snapshot, fuel, lmp] = await Promise.all([
    getJson("https://public-api.misoenergy.org/api/Snapshot"),
    getJson("https://public-api.misoenergy.org/api/FuelMix"),
    getJson("https://public-api.misoenergy.org/api/MarketPricing/GetLmpConsolidatedTable"),
  ]);

  const rows = Array.isArray(snapshot) ? (snapshot as { t?: string; v?: string; d?: string }[]) : [];
  const demand = snapshotValue(rows, "Current Demand");
  const peak = snapshotValue(rows, "Forecasted Peak");
  const energy = snapshotValue(rows, "Marginal Energy");
  const interchange = snapshotValue(rows, "Scheduled Imports");
  if (!demand || !energy) throw new Error("MISO snapshot did not include demand and price");

  const fuelBody = fuel as {
    Fuel?: { Type?: { CATEGORY?: string; ACT?: string }[] };
  };
  const slices = (fuelBody.Fuel?.Type ?? [])
    .map((t) => ({ name: t.CATEGORY ?? "Other", mw: num(t.ACT) }))
    .filter((t) => Number.isFinite(t.mw) && t.name !== "Imports");

  const lmpBody = lmp as {
    LMPData?: { FiveMinLMP?: { PricingNode?: { name?: string; region?: string; LMP?: string }[] } };
  };
  const hubs = (lmpBody.LMPData?.FiveMinLMP?.PricingNode ?? [])
    .filter((n) => (n.name ?? "").endsWith(".HUB"))
    .map((n) => ({
      name: (n.name ?? "").replace(".HUB", ""),
      region: n.region ?? "",
      lmp: num(n.LMP),
    }))
    .filter((n) => Number.isFinite(n.lmp))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    asOf: demand.d ?? "",
    demandMw: num(demand.v),
    peakForecastMw: num(peak?.v),
    marginalEnergy: num(energy.v),
    netExportMw: num(interchange?.v),
    fuel: slices,
    hubs,
  };
}

async function fetchEia(): Promise<{ status: FeedStatus; rows: EiaDemand[] | null; error: string | null }> {
  const key = envKey("VITE_EIA_API_KEY");
  if (!key) return { status: "off", rows: null, error: null };

  const params = new URLSearchParams();
  params.set("api_key", key);
  params.set("frequency", "hourly");
  params.append("data[]", "value");
  params.append("facets[type][]", "D");
  for (const id of EIA_RESPONDENTS) params.append("facets[respondent][]", id);
  params.append("sort[0][column]", "period");
  params.append("sort[0][direction]", "desc");
  params.set("length", "40");

  const json = (await getJson(
    `https://api.eia.gov/v2/electricity/rto/region-data/data/?${params.toString()}`,
  )) as { response?: { data?: Record<string, unknown>[] } };

  const latest = new Map<string, EiaDemand>();
  for (const row of json.response?.data ?? []) {
    const respondent = String(row.respondent ?? "");
    if (!respondent || latest.has(respondent)) continue;
    const demandMw = num(row.value);
    if (!Number.isFinite(demandMw)) continue;
    latest.set(respondent, {
      respondent,
      name: EIA_NAMES[respondent] ?? String(row["respondent-name"] ?? respondent),
      period: String(row.period ?? ""),
      demandMw,
    });
  }
  return { status: "ok", rows: [...latest.values()], error: null };
}

async function fetchPjm(): Promise<{ status: FeedStatus; print: PjmPrint | null; error: string | null }> {
  const key = envKey("VITE_PJM_SUBSCRIPTION_KEY");
  if (!key) return { status: "off", print: null, error: null };

  // pnode 1 is the PJM-RTO residual aggregate — the system price, not a bus.
  const json = await getJson(
    "https://api.pjm.com/api/v1/rt_hrl_lmps?rowCount=1&startRow=1&pnode_id=1",
    { "Ocp-Apim-Subscription-Key": key },
  );
  const items = Array.isArray(json)
    ? json
    : ((json as { items?: unknown[] }).items ?? (json as { results?: unknown[] }).results ?? []);
  const row = (items[0] ?? {}) as Record<string, unknown>;
  const lmp = num(row.total_lmp_rt ?? row.total_lmp);
  if (!Number.isFinite(lmp)) throw new Error("PJM did not return an LMP");
  return {
    status: "ok",
    print: {
      asOf: String(row.datetime_beginning_ept ?? row.datetime_beginning_utc ?? ""),
      node: String(row.pnode_name ?? "PJM-RTO"),
      lmp,
      energy: num(row.system_energy_price_rt ?? row.system_energy_price),
    },
    error: null,
  };
}

export async function loadLiveBoard(): Promise<LiveBoard> {
  const [miso, eia, pjm] = await Promise.allSettled([fetchMiso(), fetchEia(), fetchPjm()]);

  const eiaResult =
    eia.status === "fulfilled"
      ? eia.value
      : { status: "error" as const, rows: null, error: eia.reason instanceof Error ? eia.reason.message : "EIA request failed" };
  const pjmResult =
    pjm.status === "fulfilled"
      ? pjm.value
      : { status: "error" as const, print: null, error: pjm.reason instanceof Error ? pjm.reason.message : "PJM request failed" };

  return {
    fetchedAt: new Date().toISOString(),
    miso: miso.status === "fulfilled" ? miso.value : null,
    misoError: miso.status === "rejected" ? (miso.reason instanceof Error ? miso.reason.message : "MISO request failed") : null,
    eia: eiaResult.rows,
    eiaStatus: eiaResult.status,
    eiaError: eiaResult.error,
    pjm: pjmResult.print,
    pjmStatus: pjmResult.status,
    pjmError: pjmResult.error,
  };
}

export interface LocalWholesale {
  label: string;
  value: string;
  note: string;
}

/** What the live feeds can say about the market a pathway actually sits in. */
export function localWholesale(market: string, board: LiveBoard): LocalWholesale {
  if (market.includes("PJM")) {
    if (board.pjm) {
      return {
        label: `${board.pjm.node} LMP`,
        value: `$${board.pjm.lmp.toFixed(2)}/MWh`,
        note: "PJM real-time hourly. Energy only — not this pathway's all-in price.",
      };
    }
    const demand = board.eia?.find((r) => r.respondent === "PJM");
    if (demand) {
      return {
        label: "PJM demand",
        value: `${Math.round(demand.demandMw).toLocaleString("en-US")} MW`,
        note: `EIA hourly, ${demand.period}. A load print, not a price. LMP needs a PJM key.`,
      };
    }
    return {
      label: "PJM wholesale",
      value: "Not connected",
      note: "A free EIA key adds hourly demand. A free PJM Data Miner key adds the real-time LMP.",
    };
  }

  if (market.includes("ERCOT")) {
    const demand = board.eia?.find((r) => r.respondent === "ERCO");
    if (demand) {
      return {
        label: "ERCOT demand",
        value: `${Math.round(demand.demandMw).toLocaleString("en-US")} MW`,
        note: `EIA hourly, ${demand.period}. ERCOT's own dashboard blocks browser requests.`,
      };
    }
    return {
      label: "ERCOT wholesale",
      value: "Not connected",
      note: "EIA's free key publishes ERCOT hourly demand. MISO's Texas hub is a different grid.",
    };
  }

  return {
    label: "Local wholesale",
    value: "No ISO print",
    note: "The Carolinas settle bilaterally. There is no public hub LMP to put next to this price.",
  };
}

const listeners = new Set<(board: LiveBoard) => void>();
let cached: LiveBoard | null = null;
let inflight: Promise<LiveBoard> | null = null;
let timer: number | null = null;

async function refresh() {
  try {
    if (!inflight) {
      inflight = loadLiveBoard().finally(() => {
        inflight = null;
      });
    }
    cached = await inflight;
    listeners.forEach((fn) => fn(cached!));
  } catch {
    // loadLiveBoard already settles each feed. A throw here is unexpected.
  }
}

export function subscribeLive(listener: (board: LiveBoard) => void): () => void {
  listeners.add(listener);
  if (cached) listener(cached);
  void refresh();
  if (timer === null) timer = window.setInterval(() => void refresh(), 60_000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}
