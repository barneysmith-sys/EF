import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type Plugin, type ViteDevServer } from "vite";

/**
 * Dev-server only. EIA and PJM keys are read here and never sent to the browser.
 * GitHub Pages has no server, so the public site does not call these APIs.
 */

interface Env {
  [key: string]: string;
}

function key(env: Env, name: string): string {
  return (env[name] || env[`VITE_${name}`] || "").trim();
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

async function readJson(url: string, headers?: Record<string, string>): Promise<unknown> {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text.slice(0, 180)}`);
  }
  return res.json();
}

function num(value: unknown): number {
  const n = Number(String(value ?? "").replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

async function eia(env: Env) {
  const apiKey = key(env, "EIA_API_KEY");
  const retrievedAt = new Date().toISOString();
  if (!apiKey) {
    return {
      status: "off" as const,
      retrievedAt,
      demand: null,
      virginiaRetail: null,
      error: null,
    };
  }

  const demandParams = new URLSearchParams();
  demandParams.set("api_key", apiKey);
  demandParams.set("frequency", "hourly");
  demandParams.append("data[]", "value");
  demandParams.append("facets[type][]", "D");
  for (const id of ["PJM", "ERCO", "MISO", "NYIS", "ISNE"]) {
    demandParams.append("facets[respondent][]", id);
  }
  demandParams.append("sort[0][column]", "period");
  demandParams.append("sort[0][direction]", "desc");
  demandParams.set("length", "40");

  const retailParams = new URLSearchParams();
  retailParams.set("api_key", apiKey);
  retailParams.set("frequency", "monthly");
  retailParams.append("data[]", "price");
  retailParams.append("facets[stateid][]", "VA");
  retailParams.append("facets[sectorid][]", "ALL");
  retailParams.append("sort[0][column]", "period");
  retailParams.append("sort[0][direction]", "desc");
  retailParams.set("length", "1");

  const [demandRes, retailRes] = await Promise.allSettled([
    readJson(`https://api.eia.gov/v2/electricity/rto/region-data/data/?${demandParams}`),
    readJson(`https://api.eia.gov/v2/electricity/retail-sales/data/?${retailParams}`),
  ]);

  if (demandRes.status === "rejected" && retailRes.status === "rejected") {
    const reason = demandRes.reason instanceof Error ? demandRes.reason.message : "EIA request failed";
    return { status: "error" as const, retrievedAt, demand: null, virginiaRetail: null, error: reason };
  }

  const names: Record<string, string> = {
    PJM: "PJM",
    ERCO: "ERCOT",
    MISO: "MISO",
    NYIS: "NYISO",
    ISNE: "ISO-NE",
  };
  const latest = new Map<string, Record<string, unknown>>();
  if (demandRes.status === "fulfilled") {
    const rows = ((demandRes.value as { response?: { data?: Record<string, unknown>[] } }).response?.data ?? []);
    for (const row of rows) {
      const respondent = String(row.respondent ?? "");
      if (!respondent || latest.has(respondent) || !Number.isFinite(num(row.value))) continue;
      latest.set(respondent, row);
    }
  }

  const demand = [...latest.entries()].map(([respondent, row]) => ({
    respondent,
    name: names[respondent] ?? String(row["respondent-name"] ?? respondent),
    period: String(row.period ?? ""),
    demandMw: num(row.value),
    source: "EIA Open Data, electricity/rto/region-data, type D",
    coverage: `${names[respondent] ?? respondent} footprint. Not a state, a county, or a data-center site.`,
    verification: "public" as const,
    caveat: "Hourly system demand. It does not say whether a new load can be served.",
  }));

  let virginiaRetail = null;
  if (retailRes.status === "fulfilled") {
    const row = ((retailRes.value as { response?: { data?: Record<string, unknown>[] } }).response?.data ?? [])[0];
    const price = num(row?.price);
    if (row && Number.isFinite(price)) {
      virginiaRetail = {
        period: String(row.period ?? ""),
        priceCentsPerKwh: price,
        source: "EIA Open Data, electricity/retail-sales, all sectors",
        coverage: "Virginia, all retail sectors. Not a data-center tariff and not a Dominion quote.",
        verification: "public" as const,
        caveat: "A statewide average. It is not the price this project would pay.",
      };
    }
  }

  return {
    status: demand.length || virginiaRetail ? ("ok" as const) : ("error" as const),
    retrievedAt,
    demand,
    virginiaRetail,
    error: demandRes.status === "rejected" && demandRes.reason instanceof Error ? demandRes.reason.message : null,
  };
}

async function pjm(env: Env) {
  const subscriptionKey = key(env, "PJM_SUBSCRIPTION_KEY");
  const retrievedAt = new Date().toISOString();
  if (!subscriptionKey) {
    return { status: "off" as const, retrievedAt, print: null, error: null };
  }

  const json = await readJson(
    "https://api.pjm.com/api/v1/rt_hrl_lmps?rowCount=1&startRow=1&pnode_id=1",
    { "Ocp-Apim-Subscription-Key": subscriptionKey },
  );
  const items = Array.isArray(json)
    ? json
    : ((json as { items?: unknown[] }).items ?? (json as { results?: unknown[] }).results ?? []);
  const row = (items[0] ?? {}) as Record<string, unknown>;
  const lmp = num(row.total_lmp_rt ?? row.total_lmp);
  if (!Number.isFinite(lmp)) throw new Error("PJM did not return an LMP");

  return {
    status: "ok" as const,
    retrievedAt,
    print: {
      asOf: String(row.datetime_beginning_ept ?? row.datetime_beginning_utc ?? ""),
      node: String(row.pnode_name ?? "PJM-RTO"),
      lmp,
      energy: num(row.system_energy_price_rt ?? row.system_energy_price),
      source: "PJM Data Miner 2, rt_hrl_lmps, pnode 1",
      coverage: "PJM-RTO residual aggregate. Not the Dominion zone, not Louisa County, and not a retail rate.",
      verification: "public" as const,
      caveat: "Wholesale energy. A data center would not pay this number.",
    },
    error: null,
  };
}

async function handle(req: IncomingMessage, res: ServerResponse, server: ViteDevServer) {
  const path = req.url?.split("?")[0];
  if (path !== "/api/market/eia" && path !== "/api/market/pjm") return false;
  try {
    const env = loadEnv(server.config.mode, server.config.envDir, "");
    const body = path === "/api/market/eia" ? await eia(env) : await pjm(env);
    send(res, 200, body);
  } catch (err) {
    send(res, 200, {
      status: "error",
      retrievedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : "Request failed",
    });
  }
  return true;
}

export function marketApi(): Plugin {
  return {
    name: "kilo-market-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handle(req, res, server).then((handled) => {
          if (!handled) next();
        });
      });
    },
  };
}
