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
  source: string;
  coverage: string;
  verification: "public";
  caveat: string;
}

export interface VirginiaRetail {
  period: string;
  priceCentsPerKwh: number;
  source: string;
  coverage: string;
  verification: "public";
  caveat: string;
}

export interface PjmPrint {
  asOf: string;
  node: string;
  lmp: number;
  energy: number;
  source: string;
  coverage: string;
  verification: "public";
  caveat: string;
}

export type FeedStatus = "off" | "ok" | "error";

export interface LiveBoard {
  fetchedAt: string;
  miso: MisoPrint | null;
  misoError: string | null;
  eia: EiaDemand[] | null;
  eiaRetrievedAt: string | null;
  virginiaRetail: VirginiaRetail | null;
  eiaStatus: FeedStatus;
  eiaError: string | null;
  pjm: PjmPrint | null;
  pjmRetrievedAt: string | null;
  pjmStatus: FeedStatus;
  pjmError: string | null;
}

function num(value: unknown): number {
  const n = Number(String(value ?? "").replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
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

const OFF_NOTE = "Keys stay on the dev server. The public site does not call EIA or PJM.";

async function fetchEia(): Promise<{
  status: FeedStatus;
  rows: EiaDemand[] | null;
  retrievedAt: string | null;
  virginiaRetail: VirginiaRetail | null;
  error: string | null;
}> {
  if (!import.meta.env.DEV) {
    return { status: "off", rows: null, retrievedAt: null, virginiaRetail: null, error: null };
  }
  const json = (await getJson("/api/market/eia")) as {
    status?: FeedStatus;
    demand?: EiaDemand[] | null;
    virginiaRetail?: VirginiaRetail | null;
    retrievedAt?: string;
    error?: string | null;
  };
  return {
    status: json.status ?? "error",
    rows: json.demand ?? null,
    retrievedAt: json.retrievedAt ?? null,
    virginiaRetail: json.virginiaRetail ?? null,
    error: json.error ?? null,
  };
}

async function fetchPjm(): Promise<{
  status: FeedStatus;
  print: PjmPrint | null;
  retrievedAt: string | null;
  error: string | null;
}> {
  if (!import.meta.env.DEV) {
    return { status: "off", print: null, retrievedAt: null, error: null };
  }
  const json = (await getJson("/api/market/pjm")) as {
    status?: FeedStatus;
    print?: PjmPrint | null;
    retrievedAt?: string;
    error?: string | null;
  };
  return {
    status: json.status ?? "error",
    print: json.print ?? null,
    retrievedAt: json.retrievedAt ?? null,
    error: json.error ?? null,
  };
}

export async function loadLiveBoard(): Promise<LiveBoard> {
  const [miso, eia, pjm] = await Promise.allSettled([fetchMiso(), fetchEia(), fetchPjm()]);

  const eiaResult =
    eia.status === "fulfilled"
      ? eia.value
      : {
          status: "error" as const,
          rows: null,
          retrievedAt: null,
          virginiaRetail: null,
          error: eia.reason instanceof Error ? eia.reason.message : "EIA request failed",
        };
  const pjmResult =
    pjm.status === "fulfilled"
      ? pjm.value
      : {
          status: "error" as const,
          print: null,
          retrievedAt: null,
          error: pjm.reason instanceof Error ? pjm.reason.message : "PJM request failed",
        };

  return {
    fetchedAt: new Date().toISOString(),
    miso: miso.status === "fulfilled" ? miso.value : null,
    misoError: miso.status === "rejected" ? (miso.reason instanceof Error ? miso.reason.message : "MISO request failed") : null,
    eia: eiaResult.rows,
    eiaRetrievedAt: eiaResult.retrievedAt,
    virginiaRetail: eiaResult.virginiaRetail,
    eiaStatus: eiaResult.status,
    eiaError: eiaResult.error,
    pjm: pjmResult.print,
    pjmRetrievedAt: pjmResult.retrievedAt,
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
        note: "PJM-RTO wholesale energy. Not a Dominion rate and not this pathway's delivered price.",
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
        note: import.meta.env.DEV
          ? "Put EIA_API_KEY and PJM_SUBSCRIPTION_KEY in .env.local. They stay on the dev server."
          : OFF_NOTE,
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
