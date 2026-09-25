/** Local demo instrumentation. No names, no documents, no network. */

const KEY = "kilo-events";

export type KiloEvent =
  | "search submitted"
  | "pathway opened"
  | "evidence opened"
  | "unknown clicked"
  | "requirement created"
  | "blocker opened"
  | "actor opened"
  | "path to power opened"
  | "research hypothesis updated";

export function track(name: KiloEvent, detail?: string) {
  try {
    const prev = JSON.parse(localStorage.getItem(KEY) || "[]") as { name: string; at: string }[];
    prev.push({ name, at: new Date().toISOString(), ...(detail ? { detail } : {}) });
    localStorage.setItem(KEY, JSON.stringify(prev.slice(-200)));
  } catch {
    /* private mode */
  }
}
